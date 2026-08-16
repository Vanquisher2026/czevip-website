// Pages Function: route /products (and trailing variants) to /products.html static asset.
// Cloudflare Pages auto-strips .html via 308; this function intercepts the clean URL
// and serves the underlying .html content.
const PATHS = new Set(['/products', '/products/']);
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (PATHS.has(url.pathname) && context.env.ASSETS) {
    return context.env.ASSETS.fetch(new URL('/products.html', url.origin));
  }
  return context.next();
}
