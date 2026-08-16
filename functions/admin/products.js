// Pages Function: route /admin/products (and trailing variants) to /admin/products.html static asset.
const PATHS = new Set(['/admin/products', '/admin/products/']);
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (PATHS.has(url.pathname) && context.env.ASSETS) {
    return context.env.ASSETS.fetch(new URL('/admin/products.html', url.origin));
  }
  return context.next();
}
