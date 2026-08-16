// Pages Function: route /product (and trailing variants) to /product.html static asset.
const PATHS = new Set(['/product', '/product/']);
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (PATHS.has(url.pathname) && context.env.ASSETS) {
    return context.env.ASSETS.fetch(new URL('/product.html', url.origin));
  }
  return context.next();
}
