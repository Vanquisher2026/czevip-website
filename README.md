# CZEVIP - Independent Hat Brand Site

Static-first site for CZEVIP (hand-embroidered family caps, designed in Brooklyn, NY). Built for Cloudflare Pages + Functions, with Stripe Checkout, D1 for products and inquiries, and a separate admin console.

---

## Stack

| Layer | Choice | Cost |
| --- | --- | --- |
| Hosting | Cloudflare Pages | Free tier covers the whole site |
| Backend | Cloudflare Pages Functions (Workers) | Free tier covers ~100k req/day |
| Database | Cloudflare D1 (SQLite) | Free tier: 5GB, 5M reads/day, 100k writes/day |
| Payments | Stripe Checkout (Session API, no Stripe.js on the page) | Pay per transaction |
| Email | Resend (optional, for inquiry notifications) | Free 3k/mo |
| Frontend | Plain HTML, CSS, vanilla JS | Zero build step |
| Admin | Separate `/admin/` route, password-gated, same codebase | - |

---

## Directory map

```
CZEVIP/
  index.html              Home (hero + 4 categories + featured + story + FAQ)
  products.html           Catalog with filters (cat / price / sort)
  product.html            Product detail (loaded from ?id=)
  manufacturing.html      OEM landing + inquiry form
  partners.html           Creator/influencer landing + application form
  about.html              Brand story
  contact.html            Unified contact (info@czevip.com)
  cart.html               Cart + Stripe Checkout
  shipping.html           Shipping / returns / sales tax
  privacy.html, terms.html

  admin/
    login.html            Password sign-in
    index.html            Dashboard (counts + recent + quick actions)
    inquiries.html        List + filter + status update + payload viewer
    products.html         Table + add/edit modal + seed button
    admin.css, admin.js   Shared admin shell, fetch, modal, toast

  style.css               Public site styles (loaded by every public page)
  main.js                 Public header/footer injection + form handler + cart count
  cart.js                 Cart store + product rendering + checkout
  products.json           Fallback catalog (used when D1 is empty)

  functions/api/
    checkout.js           POST -> Stripe Checkout Session
    contact.js            POST contact form -> D1 + Resend
    oem.js                POST OEM inquiry -> D1 + Resend
    partner.js            POST creator app -> D1 + Resend
    products.js           GET catalog (D1 first, products.json fallback)
    admin/
      _session.js         Session token create/destroy/verify + auth gate
      _db.js              D1 row <-> JSON mapping (is_new <-> new, description <-> desc)
      login.js            POST password, sets czevip_admin cookie
      logout.js           POST clears cookie + D1 session
      me.js               GET returns auth state
      stats.js            GET dashboard counts (inquiries + products)
      inquiries.js        GET list with kind/status filter
      inquiries/[id].js   GET detail + PATCH status
      products.js         GET list (all / active only) + POST create
      products/[id].js    GET + PUT + DELETE (soft)
      seed-products.js    POST imports products.json into D1 (idempotent)

  schema.sql              D1 schema (inquiries, admin_sessions, products)
  google-merchant.xml     GMC product feed (RSS 2.0 + g: namespace)
  sitemap.xml, robots.txt
  wrangler.toml           Cloudflare config (D1 binding)
  _headers, _redirects    Cache + security headers, /admin redirect

  assets/
    caps/{dad,mom,set,wife}/   Real product photography (PNG)
    svg/{fedora,panama,...}.svg Placeholder category art
```

---

## Local preview

```bash
cd D:\web\CZEVIP
python -m http.server 8000
# open http://localhost:8000
```

Static pages render fully. Cloudflare Functions do not run locally, so:
- `/api/products` falls back to `products.json` (the public site works)
- `/api/checkout`, `/api/admin/*`, form submissions will 404 locally - test these on the deployed preview only.

Default admin password in dev: `czevip-admin`. Override with `ADMIN_PASSWORD` env var on Cloudflare.

---

## Production deployment (step by step)

### 1. Push to Git

Create a GitHub/GitLab repo and push this folder:

```bash
cd D:\web\CZEVIP
git init
git add .
git commit -m "Initial CZEVIP site"
git branch -M main
git remote add origin https://github.com/YOUR/czevip.git
git push -u origin main
```

### 2. Create Cloudflare Pages project

1. https://dash.cloudflare.com -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**
2. Pick the repo. Branch: `main`.
3. Build settings:
   - **Build command:** leave empty
   - **Build output directory:** `.`
   - **Root directory:** leave empty (the project IS the root)
4. Click **Save and Deploy**. First deploy takes ~1 min.

### 3. Create D1 database and apply schema

Install Wrangler locally (one-time):

```bash
npm install -g wrangler
wrangler login
```

Then:

```bash
wrangler d1 create czevip-db
# copy the printed "database_id = ..."
wrangler d1 execute czevip-db --remote --file=./schema.sql
# repeat with --local if you want a local D1 for testing
```

Open `wrangler.toml` and replace `REPLACE_WITH_REAL_D1_ID` with the `database_id` from the create command.

Push the updated `wrangler.toml`:

```bash
git add wrangler.toml && git commit -m "Bind D1" && git push
```

Cloudflare Pages redeploys automatically.

### 4. Bind D1 to Pages

Cloudflare dashboard -> your Pages project -> **Settings** -> **Functions** -> **D1 database bindings** -> **Add binding**:
- Variable name: `DB`
- D1 database: `czevip-db`

Save. Triggers a redeploy.

### 5. Set environment variables

Cloudflare dashboard -> your Pages project -> **Settings** -> **Environment variables** -> **Add variable** for **Production** (and repeat for **Preview** if you want):

| Variable | Required | Example value | Notes |
| --- | --- | --- | --- |
| `ADMIN_PASSWORD` | yes | a strong unique value | Used by `/admin/login.html`. Default `czevip-admin` is for local only. |
| `PUBLIC_SITE_URL` | yes | `https://czevip.com` | Used for Stripe redirect URLs + CORS. |
| `STRIPE_SECRET_KEY` | yes | `sk_live_...` | Stripe dashboard -> Developers -> API keys. Use `sk_test_...` first. |
| `STRIPE_CURRENCY` | no | `usd` | Default `usd`. |
| `RESEND_API_KEY` | no | `re_...` | If you want email notifications on inquiries. |
| `NOTIFY_TO` | no | `info@czevip.com` | Recipient for inquiry emails. |
| `NOTIFY_FROM` | no | `CZEVIP Site <noreply@czevip.com>` | Must be a verified domain in Resend. |
| `GA_MEASUREMENT_ID` | no | `G-XXXXXXXXXX` | Optional. Cloudflare Analytics works without this. |

### 6. Custom domain

Cloudflare Pages -> your project -> **Custom domains** -> **Set up a custom domain**:
1. Add `czevip.com` (apex)
2. Add `www.czevip.com` (redirect to apex, or vice versa)

If `czevip.com` is on Cloudflare already, DNS is automatic. Otherwise point the nameservers to Cloudflare. SSL is provisioned automatically.

### 7. Verify the deployment

Open these URLs in a private window and confirm each:

| URL | Expected |
| --- | --- |
| `https://czevip.com/` | Home page with 4 category cards (Dad/Mom/Wife/Set), Brooklyn copy, footer with US address. |
| `https://czevip.com/products.html` | Catalog with 9 products (4 real + 5 placeholder). |
| `https://czevip.com/product.html?id=dad-cap` | Product detail with real photos. |
| `https://czevip.com/admin/login.html` | Password login form. |
| `https://czevip.com/api/products` | JSON catalog. |
| `https://czevip.com/google-merchant.xml` | GMC RSS feed with 4 items. |
| `https://czevip.com/sitemap.xml` | Sitemap. |

Then sign in to admin with `ADMIN_PASSWORD` and:
- Dashboard shows real counts (or 0s if D1 is fresh)
- Products page -> click **Seed from products.json** to import the 9 starter products
- Edit any product to confirm CRUD works
- Submit a test contact form, then check Inquiries page

### 8. Submit to Google Merchant Center

Once the domain is live and HTTPS works:
1. https://merchants.google.com -> sign in with the Google account that owns the brand
2. **Products** -> **Add product feed** -> type: **Scheduled fetch** (or **Upload** for one-shot)
3. Feed URL: `https://czevip.com/google-merchant.xml`
4. Feed name: `CZEVIP`
5. Submit. Approval typically takes 3-7 days. Common rejection reasons:
   - Missing return policy link (we have `/shipping.html`)
   - Missing contact info (we have `info@czevip.com` + Brooklyn address)
   - Placeholder images (we have real photography for the 4 SKUs)
   - Mismatched prices vs landing page

### 9. Stripe activation (US business)

For US-based merchant processing:
1. https://dashboard.stripe.com/register -> sign up with the LLC legal info
2. **Settings** -> **Business settings** -> fill in:
   - Legal entity name: `CZEVIP LLC`
   - EIN (US Employer Identification Number)
   - Industry: `Retail` -> `Apparel & accessories`
   - Address: `1 Pier Place, Suite 200, Brooklyn NY 11201`
3. **Settings** -> **Branding** -> upload CZEVIP logo, set brand color
4. **Settings** -> **Customer support** -> set `info@czevip.com`, phone `+1-718-555-0188`
5. **Settings** -> **Public details** -> add hosting URL `https://czevip.com`
6. Add a US business bank account under **Settings** -> **Payouts** (for GMC + Stripe payouts)
7. Once Stripe activates (~1-2 business days after they verify identity), swap `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...` in Pages env vars

The current checkout code does not need webhooks - Stripe Checkout success/cancel URLs handle the user flow. If you later want server-side order records, add a webhook listener at `/api/stripe-webhook`.

---

## Admin usage

- **Login:** `/admin/login.html` with `ADMIN_PASSWORD`. 7-day session cookie.
- **Dashboard:** real-time counts for inquiries (by status/kind) and products (active/inactive).
- **Inquiries:** filter by kind (`contact` / `oem` / `partner`) and status (`new` / `read` / `replied` / `archived`). Click **View** for full payload. Status auto-promotes to `read` on first view.
- **Products:** Add/edit via modal. Edit any field. **Archive** sets `active=0` (soft delete - recoverable). The first time, click **Seed from products.json** to import the 9 starter products.
- After admin saves a product, the public site picks it up on the next page load (D1 read).

---

## Pre-launch checklist

- [ ] `ADMIN_PASSWORD` is a strong unique value, not `czevip-admin`
- [ ] `STRIPE_SECRET_KEY` is `sk_live_...`
- [ ] `PUBLIC_SITE_URL` matches the live domain exactly
- [ ] Custom domain resolves and has a valid SSL cert (Cloudflare auto-issues)
- [ ] D1 schema applied (`wrangler d1 execute czevip-db --remote --file=./schema.sql`)
- [ ] `assets/og.png` (1200x630) exists for social sharing
- [ ] `privacy.html`, `terms.html`, `shipping.html` reviewed by counsel
- [ ] Google Search Console: domain verified, sitemap submitted
- [ ] Bing Webmaster: domain verified, sitemap submitted
- [ ] Test checkout end-to-end with Stripe test card `4242 4242 4242 4242`
- [ ] Real product photography uploaded to `assets/caps/` for all active SKUs
- [ ] GMC feed approved

---

## Post-launch maintenance

- **Add a product:** Admin -> Products -> Add product (or POST `/api/admin/products`)
- **Change a price:** Admin -> Products -> Edit. Public site reflects on next fetch.
- **Bulk update prices:** For now, edit one at a time in admin. (Batch editor is on the roadmap.)
- **Process an inquiry:** Admin -> Inquiries -> View -> change status to `replied`.
- **Swap a product image:** Drop the new file into `assets/caps/<cat>/`, then update `primary_image` (and `images[]`) in admin.
- **Push code changes:** `git push` -> Cloudflare redeploys automatically.

---

## Open roadmap

- [ ] `/zh/` Chinese-localized pages (currently hreflang targets 404)
- [ ] Image upload directly in admin (currently requires manual file drop + DB update)
- [ ] Batch product editor (price changes, badge updates)
- [ ] Order tracking (Stripe webhook -> D1 `orders` table)
- [ ] Customer accounts / order history
- [ ] OG image generator (dynamic per product)
