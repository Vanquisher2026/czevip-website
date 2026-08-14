// Cloudflare Pages Function - serves the product catalog
// Tries to load from a D1 table `products`; falls back to bundled products.json
import data from '../../products.json';
export async function onRequest({ env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=300, must-revalidate'
  };
  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        'SELECT id, slug, name, color, cat, price, compare_at, material, origin, weight_lb, badge, featured, is_new AS "new", sizes, colors, gtin, mpn, identifier_exists, condition, availability, primary_image, images, description AS desc FROM products WHERE active = 1 ORDER BY featured DESC, id'
      ).all();
      if (results && results.length) {
        const products = results.map(r => ({
          ...r,
          sizes: r.sizes ? JSON.parse(r.sizes) : [],
          colors: r.colors ? JSON.parse(r.colors) : [],
          images: r.images ? JSON.parse(r.images) : [],
          featured: !!r.featured,
          identifier_exists: !!r.identifier_exists,
          price: Number(r.price),
          compare_at: r.compare_at == null ? null : Number(r.compare_at),
          weight_lb: Number(r.weight_lb)
        }));
        return new Response(JSON.stringify({ currency: 'USD', products }), { headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    } catch (e) {}
  }
  return new Response(JSON.stringify(data), { headers: { ...cors, 'Content-Type': 'application/json' } });
}
