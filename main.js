 // CZEVIP - shared interactions + global header/footer
 (function () {
   'use strict';
   // === Global business info (single source of truth for Schema, footer, contact) ===
   const BIZ = {
     name: 'CZEVIP',
     legalName: 'CZEVIP LLC',
     street: '1 Pier Place, Suite 200',
     city: 'Brooklyn',
     region: 'NY',
     postal: '11201',
     country: 'US',
     phone: '+1-718-555-0188',
     email: 'info@czevip.com',
     hours: 'Mo-Fr 09:00-17:00 EST'
   };
   const ADDRESS_INLINE = BIZ.street + ', ' + BIZ.city + ', ' + BIZ.region + ' ' + BIZ.postal + ', ' + BIZ.country;
   // === Header (rendered once into [data-header]) ===
   function headerHTML() {
     return '<header class="site-header"><div class="bar">' +
       '<a class="logo" href="/">CZEVIP</a>' +
       '<nav>' +
         '<a href="/products.html">Shop</a>' +
         '<a href="/manufacturing.html">Manufacturing</a>' +
         '<a href="/partners.html">Partners</a>' +
         '<a href="/about.html">About</a>' +
         '<a href="/faq.html">FAQ</a>' +
         '<a href="/contact.html">Contact</a>' +
       '</nav>' +
       '<div class="bar-actions">' +
         '<a class="lang-toggle" href="/zh/" aria-label="Switch language">EN / ZH</a>' +
         '<a class="cart-link" href="/cart.html" aria-label="Cart">' +
           '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 12.5a2 2 0 002 1.5h8.2a2 2 0 002-1.5L21 8H6"/></svg>' +
           '<span class="cart-count" data-cart-count>0</span>' +
         '</a>' +
       '</div></div></header>';
   }
   // === Footer (single source for US business info + GMC + bank compliance links) ===
   function footerHTML() {
     return '<footer class="site-footer"><div class="footer-grid">' +
       '<div>' +
         '<div class="logo">CZEVIP</div>' +
         '<p class="footer-tag">Hand-embroidered family caps. Designed in Brooklyn, made worldwide.</p>' +
         '<p class="footer-address">' + ADDRESS_INLINE + '<br>' + BIZ.phone + '<br>' + BIZ.email + '</p>' +
       '</div>' +
       '<div><h4>Shop</h4><ul>' +
         '<li><a href="/products.html?cat=dad">Dad Cap</a></li>' +
         '<li><a href="/products.html?cat=mom">Mom Cap</a></li>' +
         '<li><a href="/products.html?cat=wife">Wife Cap</a></li>' +
         '<li><a href="/products.html?cat=set">Mom &amp; Dad Set</a></li>' +
         '<li><a href="/products.html">All</a></li>' +
       '</ul></div>' +
       '<div><h4>Company</h4><ul>' +
         '<li><a href="/about.html">About</a></li>' +
         '<li><a href="/manufacturing.html">Manufacturing</a></li>' +
         '<li><a href="/partners.html">Partners</a></li>' +
         '<li><a href="/faq.html">FAQ</a></li>' +
         '<li><a href="/contact.html">Contact</a></li>' +
       '</ul></div>' +
       '<div><h4>Support</h4><ul>' +
         '<li><a href="/shipping.html">Shipping &amp; returns</a></li>' +
         '<li><a href="/privacy.html">Privacy</a></li>' +
         '<li><a href="/terms.html">Terms</a></li>' +
         '<li><a href="/google-merchant.xml">Product feed</a></li>' +
       '</ul></div>' +
     '</div>' +
     '<div class="footer-meta">' +
       '<span>(c) 2026 ' + BIZ.legalName + '. All rights reserved.</span>' +
       '<span>' + BIZ.email + '</span>' +
     '</div></footer>';
   }
   function inject() {
     document.querySelectorAll('[data-header]').forEach(el => { el.outerHTML = headerHTML(); });
     document.querySelectorAll('[data-footer]').forEach(el => { el.outerHTML = footerHTML(); });
   }
   // === Cart badge sync ===
   function syncCartCount() {
     try {
       const cart = JSON.parse(localStorage.getItem('czevip.cart') || '[]');
       const total = cart.reduce(function (n, i) { return n + (i.qty || 0); }, 0);
       document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = String(total); });
     } catch (e) {}
   }
   // === Active nav link highlight ===
   function highlightNav() {
     const path = location.pathname.replace(/\/$/, '') || '/';
     document.querySelectorAll('.site-header nav a').forEach(a => {
       const href = a.getAttribute('href').replace(/\/$/, '') || '/';
       if (href === path || (href !== '/' && path.startsWith(href))) {
         a.setAttribute('aria-current', 'page');
       }
     });
   }
   // === Header shadow on scroll ===
   function bindHeaderShadow() {
     const header = document.querySelector('.site-header');
     if (!header) return;
     const onScroll = () => {
       if (window.scrollY > 4) header.style.boxShadow = '0 1px 0 rgba(20,17,14,.04)';
       else header.style.boxShadow = 'none';
     };
     window.addEventListener('scroll', onScroll, { passive: true });
     onScroll();
   }
   // === Toast ===
   window.czevipToast = function (msg) {
     let t = document.querySelector('.toast');
     if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
     t.textContent = msg;
     t.classList.add('show');
     clearTimeout(window.__czevipToastTimer);
     window.__czevipToastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
   };
   // === Form submission (contact, oem, partner) ===
   function bindForms() {
     document.querySelectorAll('[data-form]').forEach(function (form) {
       form.addEventListener('submit', async function (e) {
         e.preventDefault();
         const type = form.getAttribute('data-form');
         const status = form.querySelector('[data-status]');
         const data = Object.fromEntries(new FormData(form).entries());
         const submit = form.querySelector('button[type="submit"]');
         if (submit) { submit.disabled = true; submit.textContent = 'Sending...'; }
         try {
           const res = await fetch('/api/' + type, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(data)
           });
           if (!res.ok) throw new Error('HTTP ' + res.status);
           if (status) { status.textContent = 'Thank you - we will be in touch within one business day.'; status.classList.add('success'); }
           form.reset();
         } catch (err) {
           if (status) { status.textContent = 'Something went wrong. Please email info@czevip.com directly.'; status.classList.add('error'); }
         } finally {
           if (submit) { submit.disabled = false; submit.textContent = submit.getAttribute('data-original') || submit.textContent.replace('...', ''); }
         }
       });
     });
   }
   // === Boot ===
   inject();
   syncCartCount();
   window.addEventListener('storage', syncCartCount);
   highlightNav();
   bindHeaderShadow();
   bindForms();
   // Expose for other scripts
   window.czevipBiz = BIZ;
 })();
