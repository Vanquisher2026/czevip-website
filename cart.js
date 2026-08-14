 // CZEVIP cart - localStorage backed + product rendering
 (function () {
   'use strict';
   const KEY = 'czevip.cart';
   function read() {
     try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
     catch (e) { return []; }
   }
   function write(items) {
     localStorage.setItem(KEY, JSON.stringify(items));
     window.dispatchEvent(new Event('storage'));
   }
   function add(item) {
     const items = read();
     const key = item.id + '|' + (item.size || '') + '|' + (item.color || '');
     const existing = items.find(i => i.key === key);
     if (existing) existing.qty += item.qty || 1;
     else items.push(Object.assign({ qty: 1 }, item, { key }));
     write(items);
     if (window.czevipToast) window.czevipToast('Added to bag');
   }
   function update(key, qty) {
     const items = read();
     const i = items.findIndex(i => i.key === key);
     if (i < 0) return;
     if (qty <= 0) items.splice(i, 1);
     else items[i].qty = qty;
     write(items);
   }
   function remove(key) {
     write(read().filter(i => i.key !== key));
   }
   function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
   function img(p) {
     const src = p.primary_image || (p.images && p.images[0]);
     if (!src) return '';
     const alt = (p.name || 'Product') + ' - ' + (p.color || '') + ' by CZEVIP';
     return '<img src="/' + src + '" alt="' + alt.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async">';
   }
   // Try /api/products (Cloudflare Functions) first, then fall back to /products.json (local preview)
   async function fetchCatalog() {
     let res;
     try { res = await fetch('/api/products'); } catch (e) {}
     if (!res || !res.ok) {
       try { res = await fetch('/products.json'); } catch (e) {}
     }
     if (!res || !res.ok) throw new Error('Catalog unavailable');
     return await res.json();
   }
   // Card markup used on home + catalog
   function productCard(p) {
     const onSale = p.compare_at && p.compare_at > p.price;
     const isSet = p.cat === 'set';
     const isPlaceholder = ['fedora','panama','beret','sun','beanie'].indexOf(p.cat) >= 0;
     return '<a class="card" href="/product.html?id=' + encodeURIComponent(p.id) + '">' +
       '<div class="card-media">' + img(p) + (isPlaceholder ? '<span class="placeholder-tag">Coming soon</span>' : '') + '</div>' +
       '<div class="card-body">' +
         '<p class="card-cat">' + (isSet ? 'Bundle' : isPlaceholder ? p.cat.charAt(0).toUpperCase() + p.cat.slice(1) : 'Cap') + (p.badge ? ' - ' + p.badge : '') + '</p>' +
         '<p class="card-title">' + p.name + '</p>' +
         '<p class="card-price">' +
           (onSale ? '<s style="color:var(--ink-3);margin-right:8px">' + money(p.compare_at) + '</s>' : '') +
           money(p.price) +
         '</p>' +
       '</div></a>';
   }
   // Featured on home
   async function loadFeatured() {
     const root = document.querySelector('[data-featured]');
     if (!root) return;
     try {
       const data = await fetchCatalog();
       const featured = (data.products || []).filter(p => p.featured).slice(0, 4);
       root.innerHTML = featured.map(productCard).join('');
     } catch (e) {
       root.innerHTML = '<div class="empty"><h2>Catalog unavailable</h2><p>Please try again later.</p></div>';
     }
   }
   // Catalog page
   async function loadCatalog() {
     const root = document.querySelector('[data-catalog]');
     if (!root) return;
     const empty = document.querySelector('[data-empty]');
     let data;
     try { data = await fetchCatalog(); }
     catch (e) {
       root.innerHTML = '<div class="empty"><h2>Could not load catalog</h2><p>Please refresh.</p></div>';
       return;
     }
     const params = new URLSearchParams(location.search);
     const state = { cat: params.get('cat') || '', price: '', sort: 'featured' };
     function apply() {
       let list = (data.products || []).slice();
       if (state.cat) list = list.filter(p => p.cat === state.cat);
       if (state.price) {
         const [a, b] = state.price.split('-').map(Number);
         list = list.filter(p => p.price >= a && p.price <= b);
       }
       if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
       else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
       else if (state.sort === 'new') list = list.filter(p => p.new).concat(list.filter(p => !p.new));
       root.innerHTML = list.map(productCard).join('');
       if (empty) empty.hidden = list.length > 0;
       document.querySelectorAll('[data-filter]').forEach(group => {
         const key = group.getAttribute('data-filter');
         group.querySelectorAll('.chip').forEach(c => {
           c.classList.toggle('active', c.getAttribute('data-val') === state[key]);
         });
       });
     }
     document.querySelectorAll('[data-filter]').forEach(group => {
       const key = group.getAttribute('data-filter');
       group.addEventListener('click', e => {
         const chip = e.target.closest('.chip');
         if (!chip) return;
         state[key] = chip.getAttribute('data-val');
         apply();
       });
     });
     apply();
   }
   // Product detail
   async function loadProduct() {
     const root = document.querySelector('[data-product-detail]');
     if (!root) return;
     const id = new URLSearchParams(location.search).get('id') || 'dad-cap';
     let data;
     try { data = await fetchCatalog(); } catch (e) { return; }
     const p = (data.products || []).find(x => x.id === id) || (data.products || [])[0];
     if (!p) return;
     document.querySelector('[data-product-title]').textContent = p.name + ' (' + p.color + ') - CZEVIP';
     const desc = p.desc + ' Material: ' + p.material + '.';
     document.querySelector('[data-product-desc]').setAttribute('content', desc);
     document.querySelector('[data-product-og-title]').setAttribute('content', p.name);
     document.querySelector('[data-product-og-desc]').setAttribute('content', desc);
     const canonical = document.querySelector('link[rel="canonical"]');
     if (canonical) canonical.setAttribute('href', 'https://czevip.com/product.html?id=' + p.id);
     const schema = {
       '@context': 'https://schema.org', '@type': 'Product',
       name: p.name + ' (' + p.color + ')', description: desc,
       sku: p.mpn || p.id, mpn: p.mpn,
       brand: { '@type': 'Brand', name: 'CZEVIP' },
       image: (p.images || []).map(s => 'https://czevip.com/' + s),
       offers: {
         '@type': 'Offer', url: 'https://czevip.com/product.html?id=' + p.id,
         priceCurrency: data.currency || 'USD', price: p.price,
         availability: 'https://schema.org/InStock',
         itemCondition: 'https://schema.org/NewCondition',
         seller: { '@type': 'Organization', name: 'CZEVIP' }
       }
     };
     document.querySelector('[data-product-schema]').textContent = JSON.stringify(schema);
     document.querySelector('[data-product-name]').textContent = p.name;
     document.querySelector('[data-product-cat]').textContent = (p.cat === 'set' ? 'Bundle' : 'Cap') + (p.badge ? ' - ' + p.badge : '');
     const priceEl = document.querySelector('[data-product-price]');
     if (p.compare_at && p.compare_at > p.price) {
       priceEl.innerHTML = '<s style="color:var(--ink-3);margin-right:10px;font-size:18px">' + money(p.compare_at) + '</s>' + money(p.price);
     } else {
       priceEl.textContent = money(p.price);
     }
     document.querySelector('[data-product-desc-body]').textContent = p.desc;
     document.querySelector('[data-product-image]').innerHTML = img(p);
     const thumbs = document.querySelector('[data-product-thumbs]');
     if (thumbs) thumbs.innerHTML = (p.images || []).slice(1).map(s => '<div><img src="/' + s + '" alt="' + p.name + '" loading="lazy"></div>').join('');
     const size = document.querySelector('[data-product-size]');
     size.innerHTML = (p.sizes || ['One size']).map(s => '<option>' + s + '</option>').join('');
     const color = document.querySelector('[data-product-color]');
     color.innerHTML = (p.colors || [p.color]).map(c => '<option>' + c + '</option>').join('');
     const meta = document.querySelector('[data-product-meta]');
     meta.innerHTML = '<div>Material: ' + p.material + '</div><div>SKU: ' + (p.mpn || p.id) + '</div><div>Free US shipping over $50</div>';
     document.querySelector('[data-add-to-cart]').addEventListener('click', () => {
       add({ id: p.id, name: p.name, color: color.value, size: size.value, price: p.price, cat: p.cat, image: p.primary_image || (p.images && p.images[0]) });
     });
     const related = (data.products || []).filter(x => x.cat !== p.cat).slice(0, 4);
     const relRoot = document.querySelector('[data-related]');
     if (relRoot) relRoot.innerHTML = related.map(productCard).join('');
   }
   // Cart page
   function renderCart() {
     const root = document.querySelector('[data-cart-root]');
     if (!root) return;
     const empty = document.querySelector('[data-cart-empty]');
     const items = document.querySelector('[data-cart-items]');
     const summary = document.querySelector('[data-cart-summary]');
     const cart = read();
     if (!cart.length) {
       if (empty) empty.hidden = false;
       if (items) items.hidden = true;
       if (summary) summary.hidden = true;
       return;
     }
     if (empty) empty.hidden = true;
     if (items) {
       items.hidden = false;
       items.innerHTML = cart.map(i =>
         '<div class="cart-row">' +
           '<div class="thumb">' + (i.image ? '<img src="/' + i.image + '" alt="' + i.name + '" style="width:100%;height:100%;object-fit:cover">' : '') + '</div>' +
           '<div>' +
             '<p class="name">' + i.name + '</p>' +
             '<p class="price">' + (i.color || '') + (i.size ? ' / ' + i.size : '') + ' - ' + money(i.price) + '</p>' +
             '<div class="qty">' +
               '<button data-dec="' + i.key + '" aria-label="Decrease">-</button>' +
               '<span>' + i.qty + '</span>' +
               '<button data-inc="' + i.key + '" aria-label="Increase">+</button>' +
             '</div>' +
           '</div>' +
           '<button class="remove" data-rm="' + i.key + '">Remove</button>' +
         '</div>'
       ).join('');
       items.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
         const k = b.getAttribute('data-inc');
         const it = read().find(x => x.key === k);
         if (it) update(k, it.qty + 1);
         renderCart();
       }));
       items.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
         const k = b.getAttribute('data-dec');
         const it = read().find(x => x.key === k);
         if (it) update(k, it.qty - 1);
         renderCart();
       }));
       items.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
         remove(b.getAttribute('data-rm'));
         renderCart();
       }));
     }
     if (summary) {
       summary.hidden = false;
       const subtotal = cart.reduce((n, i) => n + i.price * i.qty, 0);
       document.querySelector('[data-subtotal]').textContent = money(subtotal);
       document.querySelector('[data-total]').textContent = money(subtotal);
       document.querySelector('[data-checkout]').addEventListener('click', async () => {
         const btn = document.querySelector('[data-checkout]');
         btn.disabled = true;
         btn.textContent = 'Redirecting...';
         try {
           const res = await fetch('/api/checkout', {
             method: 'POST', headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ items: cart })
           });
           if (!res.ok) throw new Error('HTTP ' + res.status);
           const j = await res.json();
           if (j.url) location.href = j.url;
           else throw new Error('No checkout URL');
         } catch (e) {
           btn.disabled = false;
           btn.textContent = 'Checkout';
           if (window.czevipToast) window.czevipToast('Checkout failed - please email info@czevip.com');
         }
       });
     }
   }
   // Boot
   if (document.querySelector('[data-featured]')) loadFeatured();
   if (document.querySelector('[data-catalog]')) loadCatalog();
   if (document.querySelector('[data-product-detail]')) loadProduct();
   if (document.querySelector('[data-cart-root]')) renderCart();
   window.czevipCart = { add: add, update: update, remove: remove, read: read };
 })();
