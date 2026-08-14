// CZEVIP Admin - shared client: auth gate, sidebar, fetch wrapper, toast, modal, i18n.
(function () {
  'use strict';

  const API = '/api/admin';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // === Toast ===
  function toast(msg, kind) {
    let host = $('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 200);
    }, 2400);
  }

  // === Fetch wrapper ===
  async function api(method, path, body) {
    const opts = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    let res;
    try { res = await fetch(API + path, opts); }
    catch (e) { throw new Error(window.czI18n.t('common.networkError') || 'Network error'); }
    if (res.status === 401) { location.href = '/admin/login.html'; throw new Error('Unauthorized'); }
    const text = await res.text();
    let data; try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
    if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
    return data;
  }

  // === Auth gate ===
  async function requireAuth() {
    try {
      const me = await api('GET', '/me');
      return me;
    } catch (e) {
      location.href = '/admin/login.html';
      return null;
    }
  }

  // === Sidebar ===
  function sidebar(active) {
    const I = window.czI18n.t;
    const items = [
      { key: 'dashboard', label: I('nav.dashboard'), href: '/admin/index.html', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>' },
      { key: 'inquiries', label: I('nav.inquiries'), href: '/admin/inquiries.html', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16v12H7l-3 4z"/></svg>' },
      { key: 'products', label: I('nav.products'), href: '/admin/products.html', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/></svg>' }
    ];
    const nav = items.map(i =>
      '<a href="' + i.href + '"' + (i.key === active ? ' class="active"' : '') + '>' + i.icon + '<span>' + i.label + '</span></a>'
    ).join('');
    const locale = window.czI18n.getLocale();
    return (
      '<aside class="sidebar">' +
        '<div class="brand"><div class="logo">CZEVIP</div><div class="sub">' + I('brand.sub') + '</div></div>' +
        '<nav>' + nav + '</nav>' +
        '<div class="foot">' +
          '<button class="lang-btn" data-lang-toggle>' + (locale === 'zh' ? '中文 / EN' : 'EN / 中文') + '</button>' +
          '<a href="/" target="_blank" style="color:#d8d2c5;display:block;margin-top:12px">' + I('nav.viewSite') + ' &rarr;</a>' +
          '<a href="#" data-logout style="color:#8a8175">' + I('nav.signOut') + '</a>' +
        '</div>' +
      '</aside>'
    );
  }

  function mountShell(active) {
    const shell = $('#app-shell');
    if (shell) shell.insertAdjacentHTML('afterbegin', sidebar(active));
    const logout = $('[data-logout]');
    if (logout) logout.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await api('POST', '/logout'); } catch (e) {}
      location.href = '/admin/login.html';
    });
    const lang = $('[data-lang-toggle]');
    if (lang) lang.addEventListener('click', () => {
      const cur = window.czI18n.getLocale();
      window.czI18n.setLocale(cur === 'zh' ? 'en' : 'zh');
      // Re-render sidebar to refresh nav labels
      const existing = $('.sidebar');
      if (existing) existing.outerHTML = sidebar(active);
      mountShell(active); // re-bind logout + lang
    });
  }

  // === Modal ===
  function openModal(html, opts) {
    opts = opts || {};
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal' + (opts.large ? ' large' : '') + '">' + html + '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    requestAnimationFrame(() => overlay.classList.add('open'));
    return overlay;
  }
  function closeModal() {
    const el = $('.modal-overlay');
    if (el) el.remove();
  }

  // === Helpers ===
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"'\'']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
  function money(n) { return '$' + (Math.round(Number(n) * 100) / 100).toFixed(2); }
  function timeAgo(unix) {
    if (!unix) return '';
    const d = new Date(unix * 1000);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return Math.floor(diff) + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return d.toLocaleDateString();
  }
  function fmtDate(unix) {
    if (!unix) return '';
    return new Date(unix * 1000).toLocaleString();
  }

  // === Boot for protected pages ===
  async function boot(active) {
    await requireAuth();
    mountShell(active);
    window.czI18n.applyAll();
  }

  window.czAdmin = { api, toast, openModal, closeModal, esc, money, timeAgo, fmtDate, boot, requireAuth, $: $, $$: $$ };
})();
