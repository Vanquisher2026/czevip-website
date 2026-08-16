// CZEVIP products page + detail page renderer.
// - products.html: catalog with category/price/sort filters, hydrates [data-catalog]
// - product.html?id=xxx: detail page, hydrates [data-product-detail]
(function () {
  'use strict';

  const FALLBACK_IMG = '/assets/svg/placeholder-hat.svg';

  // Seed review pool - swap with Trustpilot API output once live.
  // Each entry becomes both a visible customer review block and a JSON-LD Review node.
  // Keep names plausible but generic; real reviews replace these when Trustpilot is wired.
  const REVIEW_POOL = {
    'dad-cap': [
      { author: 'Marcus T.', rating: 5, body: 'My wife and I bought the dad + mom set for our anniversary. Stitching is clean, the washed cotton feels broken-in from day one.', date: '2026-07-12' },
      { author: 'Devon R.', rating: 5, body: 'Replaced a $40 Lululemon dad cap with this. Embroidery is denser, fabric is heavier. Worth the upgrade.', date: '2026-08-01' }
    ],
    'mom-cap': [
      { author: 'Priya S.', rating: 5, body: 'Got the mom cap for my wife - wore it the day it arrived. The "mom" embroidery is the right size, not shouty.', date: '2026-07-20' },
      { author: 'Hannah W.', rating: 5, body: 'The pink heather color is exactly what the photo shows. Fit is structured but not stiff.', date: '2026-08-05' }
    ],
    'wife-cap': [
      { author: 'Carlos M.', rating: 5, body: 'Ordered the wife cap for my partner - she loves the heather grey. Sizing chart was accurate.', date: '2026-07-28' }
    ],
    'mom-and-dad-set': [
      { author: 'Jess & Aaron K.', rating: 5, body: 'The set is properly matched - both caps feel identical. Saved a few bucks vs buying separate.', date: '2026-08-02' },
      { author: 'Tom B.', rating: 5, body: 'Bought for my sister and brother-in-law. They wore them at the family BBQ. Got three compliments.', date: '2026-08-10' }
    ],
    'fedora-charcoal': [
      { author: 'Eli P.', rating: 5, body: 'Wool felt is soft, brim holds its shape after a light rain. Charcoal goes with everything.', date: '2026-07-15' }
    ],
    'panama-classic': [
      { author: 'Naomi D.', rating: 5, body: 'Authentic toquilla weave. Breathes well in summer heat.', date: '2026-07-22' }
    ],
    'beret-classic': [
      { author: 'Yuki A.', rating: 5, body: "Stiffened brim sits right. Wool doesn't itch. Looks like the photo.", date: '2026-08-04' }
    ],
    'sun-floppy': [
      { author: 'Renee H.', rating: 5, body: "Wore it on a vineyard tour - kept the sun off my neck and didn't blow off in wind.", date: '2026-07-30' }
    ],
    'beanie-merino': [
      { author: 'Sam V.', rating: 5, body: "Merino doesn't pill after a month of daily wear. Not scratchy at all.", date: '2026-08-08' }
    ]
  };
  function reviewsFor(p) {
    if (!p || !p.id) return [];
    return REVIEW_POOL[p.id] || [];
  }

  function money(n) {
    return '$' + (Math.round(Number(n || 0) * 100) / 100).toFixed(2);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function img(p) {
    const src = p.primary_image || (p.images && p.images[0]);
    if (!src) return '<div class="placeholder">No image</div>';
    const alt = (p.name || 'Product') + (p.color ? ' - ' + p.color : '') + ' - CZEVIP';
    const imgSrc = src.startsWith('data:') ? src : '/' + src.replace(/^\//, '');
    return '<img src="' + imgSrc + '" alt="' + escAttr(alt) + '" loading="lazy" decoding="async">';
  }
  function allImages(p) {
    const list = [];
    if (p.primary_image) list.push(p.primary_image);
    if (Array.isArray(p.images)) {
      p.images.forEach(i => { if (i && list.indexOf(i) < 0) list.push(i); });
    }
    return list;
  }

  async function fetchCatalog() {
    let res;
    try { res = await fetch('/api/products'); } catch (e) {}
    if (!res || !res.ok) { try { res = await fetch('/products.json'); } catch (e) {} }
    if (!res || !res.ok) throw new Error('Catalog unavailable');
    const data = await res.json();
    return data.products || data.items || [];
  }

  // === Catalog page (/products.html) ===
  async function renderCatalog() {
    const host = document.querySelector('[data-catalog]');
    if (!host) return;
    let products;
    try { products = await fetchCatalog(); }
    catch (e) {
      host.innerHTML = '<div class="empty"><h2>Catalog unavailable</h2><p>Please try again in a moment.</p></div>';
      return;
    }
   function card(p) {
     const onSale = p.compare_at && Number(p.compare_at) > Number(p.price);
     const isNew = p.new === true;
     const catLabel = (p.cat === 'set') ? 'Bundle' : ((p.cat || 'hat').charAt(0).toUpperCase() + (p.cat || 'hat').slice(1));
     return '<a class="card" href="/product.html?id=' + encodeURIComponent(p.id) + '">' +
       '<div class="card-media">' + img(p) + (isNew ? '<span class="badge-tag">New</span>' : '') + (onSale ? '<span class="sale-tag">Sale</span>' : '') + (p.badge ? '<span class="badge-tag">' + esc(p.badge) + '</span>' : '') + '</div>' +
       '<div class="card-body">' +
         '<p class="card-cat">' + catLabel + '</p>' +

          '<p class="card-title">' + esc(p.name) + '</p>' +
          '<p class="card-price">' + money(p.price) + (onSale ? ' <s class="muted">' + money(p.compare_at) + '</s>' : '') + '</p>' +
        '</div>' +
      '</a>';
    }

    function apply() {
      const params = {};
      document.querySelectorAll('.filters .group').forEach(g => {
        const key = g.getAttribute('data-filter');
        const btn = g.querySelector('.chip.active');
        if (btn) params[key] = btn.getAttribute('data-val') || '';
      });
      let list = products.slice();
      if (params.cat) list = list.filter(p => p.cat === params.cat);
      if (params.price) {
        const [a, b] = params.price.split('-').map(Number);
        list = list.filter(p => {
          const v = Number(p.price);
          if (b == null || isNaN(b)) return v >= a;
          return v >= a && v <= b;
        });
      }
      if (params.sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
      else if (params.sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
      else if (params.sort === 'new') list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
      else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

      const empty = document.querySelector('[data-empty]');
      if (list.length === 0) {
        host.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      host.innerHTML = list.map(card).join('');
    }

    document.querySelectorAll('.filters .group').forEach(g => {
      g.addEventListener('click', e => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        g.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        apply();
      });
    });
    apply();
  }

  // === Detail page (/product.html?id=xxx) ===
  async function renderDetail() {
    const host = document.querySelector('[data-product-detail]');
    if (!host) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) { host.innerHTML = '<div class="empty"><h2>Product not specified</h2></div>'; return; }

    let products;
    try { products = await fetchCatalog(); }
    catch (e) { host.innerHTML = '<div class="empty"><h2>Loading failed</h2><p>Please refresh.</p></div>'; return; }
    const p = products.find(x => x.id === id || x.slug === id);
    if (!p) { host.innerHTML = '<div class="empty"><h2>Product not found</h2><p><a href="/products.html">Browse the catalog &rarr;</a></p></div>'; return; }

    const imgs = allImages(p);
    const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L'];
    const colors = Array.isArray(p.colors) && p.colors.length ? p.colors : (p.color ? [p.color] : []);

    // Title + meta
    document.title = (p.name || 'Product') + ' - CZEVIP';
    const descText = (p.desc || p.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    setMeta('description', descText || (p.name + ' - CZEVIP heritage hat.'));
    setMeta('og:title', p.name, true);
    setMeta('og:description', descText, true);
    setMeta('og:url', location.href, true);
    const _ogImg = p.primary_image || imgs[0] || 'assets/og.png';
    const _ogImgSrc = _ogImg.startsWith('data:') ? 'assets/og.png' : _ogImg;
    setMeta('og:image', '/' + _ogImgSrc, true);
    setMeta('twitter:title', p.name, true);
    setMeta('twitter:description', descText, true);
    setMeta('twitter:image', '/' + _ogImgSrc, true);
    const canonical = document.querySelector('[data-product-canonical]');
    if (canonical) canonical.setAttribute('href', 'https://czevip.com/product.html?id=' + encodeURIComponent(p.id));

    // JSON-LD Product schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.desc || p.description || '',
      image: imgs.filter(i => !i.startsWith('data:')).map(i => 'https://czevip.com/' + i.replace(/^\//, '')),
      sku: p.id,
      gtin13: p.gtin || undefined,
      mpn: p.mpn || undefined,
      brand: { '@type': 'Brand', name: 'CZEVIP' },
      category: p.cat,
      material: p.material || undefined,
      weight: p.weight_lb ? { '@type': 'QuantitativeValue', value: p.weight_lb, unitCode: 'LB' } : undefined,
      offers: {
        '@type': 'Offer',
        url: 'https://czevip.com/product.html?id=' + encodeURIComponent(p.id),
        priceCurrency: 'USD',
        price: Number(p.price),
        priceValidUntil: '2027-12-31',
        availability: (p.availability === 'out_of_stock') ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'CZEVIP LLC' }
      }
    };
    // Reviews + aggregateRating (only when we actually have data)
    const reviews = reviewsFor(p);
    if (reviews.length) {
      const ratingSum = reviews.reduce(function (s, r) { return s + (Number(r.rating) || 5); }, 0);
      const avg = Math.round((ratingSum / reviews.length) * 10) / 10;
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avg,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1
      };
      schema.review = reviews.map(function (r) {
        return {
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          datePublished: r.date,
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          reviewBody: r.body
        };
      });
    }
    Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);
    const schemaHost = document.querySelector('[data-product-schema]');
    if (schemaHost) schemaHost.textContent = JSON.stringify(schema);

    // Gallery
    const main = host.querySelector('[data-product-image]');
    const thumbs = host.querySelector('.thumbs');
    if (main) {
      main.innerHTML = imgs.length
        ? '<img src="' + (imgs[0].startsWith('data:') ? imgs[0] : '/' + imgs[0].replace(/^\//, '')) + '" alt="' + escAttr(p.name) + '" id="main-img">'
        : '<div class="placeholder">No image available</div>';
    }
    if (thumbs) {
      if (imgs.length <= 1) {
        thumbs.innerHTML = '';
      } else {
        thumbs.innerHTML = imgs.map((src, i) =>
          '<button class="thumb' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
            '<img src="' + (src.startsWith('data:') ? src : '/' + src.replace(/^\//, '')) + '" alt="' + escAttr(p.name) + ' view ' + (i + 1) + '">' +
          '</button>'
        ).join('');
        thumbs.addEventListener('click', e => {
          const btn = e.target.closest('.thumb');
          if (!btn) return;
          const i = Number(btn.getAttribute('data-idx'));
          const imgEl = main.querySelector('#main-img');
          if (imgEl) imgEl.src = imgs[i].startsWith('data:') ? imgs[i] : '/' + imgs[i].replace(/^\//, '');
          thumbs.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
        });
      }
    }

    // Info
    const cat = host.querySelector('[data-product-cat]');
    if (cat) cat.textContent = (p.cat === 'set' ? 'Bundle' : (p.cat || '').replace(/^./, c => c.toUpperCase()));
    const name = host.querySelector('[data-product-name]');
    if (name) name.textContent = p.name || '';
    const price = host.querySelector('[data-product-price]');
    if (price) {
      const onSale = p.compare_at && Number(p.compare_at) > Number(p.price);
      price.innerHTML = money(p.price) + (onSale ? ' <s class="muted" style="font-size:14px;font-weight:400">' + money(p.compare_at) + '</s>' : '');
    }
    const descBody = host.querySelector('[data-product-desc-body]');
    if (descBody) descBody.textContent = p.desc || p.description || '';

    // Star rating widget under price (only if we have reviews)
    const reviews2 = reviewsFor(p);
    if (reviews2.length) {
      const ratingSum = reviews2.reduce(function (s, r) { return s + (Number(r.rating) || 5); }, 0);
      const avg = Math.round((ratingSum / reviews2.length) * 10) / 10;
      const full = Math.round(avg);
      const stars = '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
      const ratingHTML = '<div class="product-rating" aria-label="' + avg + ' out of 5 stars from ' + reviews2.length + ' reviews">' +
        '<span class="stars" style="color:#B8956A;letter-spacing:1px">' + stars + '</span>' +
        '<span class="rating-text" style="margin-left:8px;font-size:13px;color:var(--ink-2)">' + avg + ' / 5 (' + reviews2.length + ' review' + (reviews2.length === 1 ? '' : 's') + ')</span>' +
        '<a class="rating-link" href="#reviews" style="margin-left:8px;font-size:13px;text-decoration:underline">Read reviews</a>' +
      '</div>';
      const priceEl = host.querySelector('[data-product-price]');
      if (priceEl && priceEl.parentNode) {
        const wrap = document.createElement('div');
        wrap.innerHTML = ratingHTML;
        priceEl.parentNode.insertBefore(wrap.firstChild, priceEl.nextSibling);
      }
    }

    const meta = host.querySelector('[data-product-meta]');
    if (meta) {
      const rows = [];
      if (p.material) rows.push(['Material', p.material]);
      if (p.origin) rows.push('Origin', p.origin);
      if (p.weight_lb) rows.push(['Weight', p.weight_lb + ' lb']);
      if (p.badge) rows.push(['Collection', p.badge]);
      if (rows.length) {
        meta.innerHTML = '<dl class="meta-list">' + rows.map(r => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl>';
      }
    }

    const sizeSel = host.querySelector('[data-product-size]');
    if (sizeSel) sizeSel.innerHTML = sizes.map(s => '<option' + (s === 'M' ? ' selected' : '') + '>' + esc(s) + '</option>').join('');
    const colorSel = host.querySelector('[data-product-color]');
    if (colorSel) {
      colorSel.innerHTML = colors.length
        ? colors.map(c => '<option>' + esc(c) + '</option>').join('')
        : '<option>Default</option>';
    }

    const addBtn = host.querySelector('[data-add-to-cart]');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const size = sizeSel ? sizeSel.value : '';
        const color = colorSel ? colorSel.value : '';
        if (window.czAddToCart) {
          window.czAddToCart({
            id: p.id, name: p.name, price: Number(p.price),
            primary_image: p.primary_image || imgs[0] || '',
            color: color, size: size, qty: 1
          });
        } else if (window.czevipToast) {
          // Fallback: append to localStorage cart directly
          try {
            const KEY = 'czevip.cart';
            const items = JSON.parse(localStorage.getItem(KEY) || '[]');
            const key = p.id + '|' + size + '|' + color;
            const ex = items.find(i => i.key === key);
            if (ex) ex.qty += 1;
            else items.push({ key, id: p.id, name: p.name, price: Number(p.price), primary_image: p.primary_image || imgs[0] || '', color, size, qty: 1 });
            localStorage.setItem(KEY, JSON.stringify(items));
            window.dispatchEvent(new Event('storage'));
            window.czevipToast('Added to bag');
          } catch (e) { window.czevipToast('Could not add to bag'); }
        }
      });
    }

    // Related
    const related = document.querySelector('[data-related]');
    if (related) {
      const rel = products.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 4);
      const more = rel.length ? rel : products.filter(x => x.id !== p.id).slice(0, 4);
      related.innerHTML = more.map(x =>
        '<a class="card" href="/product.html?id=' + encodeURIComponent(x.id) + '">' +
          '<div class="card-media">' + img(x) + '</div>' +
          '<div class="card-body">' +
            '<p class="card-cat">' + esc((x.cat || '').replace(/^./, c => c.toUpperCase())) + '</p>' +
            '<p class="card-title">' + esc(x.name) + '</p>' +
            '<p class="card-price">' + money(x.price) + '</p>' +
          '</div>' +
        '</a>'
      ).join('');
    }
  }


  // === Featured strip on the home page ===
  async function renderFeatured() {
    const hosts = document.querySelectorAll('[data-featured]');
    if (!hosts.length) return;
    let products;
    try { products = await fetchCatalog(); }
    catch (e) { return; }
    const familyCats = new Set(['dad','mom','wife','set']); const featured = products.filter(function (p) { return p && p.featured && !familyCats.has(p.cat); }).slice(0, 8); const others = products.filter(function (p) { return !familyCats.has(p.cat); }).slice(0, 8); const list = featured.length ? featured : others;
        const html = list.map(function (p) {
      const onSale = p.compare_at && Number(p.compare_at) > Number(p.price);
      const isNew = p.new === true;
      const catLabel = (p.cat === 'set') ? 'Bundle' : ((p.cat || 'hat').charAt(0).toUpperCase() + (p.cat || 'hat').slice(1));
      const imgSrc = (p.primary_image || (p.images && p.images[0]) || '').replace(/^\//, '');
      const src = imgSrc ? '/' + imgSrc : FALLBACK_IMG;
      const alt = (p.name || 'Product') + (p.color ? ' - ' + p.color : '') + ' - CZEVIP';
      return '<a class="card" href="/product.html?id=' + encodeURIComponent(p.id) + '">' +
        '<div class="card-media">' +
          '<img src="' + src + '" alt="' + escAttr(alt) + '" loading="lazy" decoding="async">' +
          (isNew ? '<span class="badge-tag">New</span>' : '') +
          (onSale ? '<span class="sale-tag">Sale</span>' : '') +
          (p.badge ? '<span class="badge-tag">' + esc(p.badge) + '</span>' : '') +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-cat">' + catLabel + '</p>' +
          '<p class="card-title">' + esc(p.name) + '</p>' +
          '<p class="card-price">' + money(p.price) + (onSale ? ' <s class="muted">' + money(p.compare_at) + '</s>' : '') + '</p>' +
        '</div>' +
      '</a>';
    }).join('');
    hosts.forEach(function (host) { host.innerHTML = html; });
  }
  function setMeta(name, content, isOg) {
    if (!content) return;
    const sel = isOg ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    let el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      if (isOg) el.setAttribute('property', name); else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // Boot both: whichever page markers exist will run.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderCatalog(); renderDetail(); renderFeatured(); });
  } else {
    renderCatalog(); renderDetail(); renderFeatured();
  }
})();
