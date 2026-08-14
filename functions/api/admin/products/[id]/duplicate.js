// Duplicate an existing product with a new ID.
import { requireAuth } from '../../_session.js';
import { fromDb } from '../../_db.js';

export async function onRequestPost({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const src = await env.DB.prepare('SELECT * FROM products WHERE id = ?1').bind(params.id).first();
    if (!src) return json({ error: 'source not found' }, 404, cors);
    let newId = src.id + '-copy';
    let suffix = 1;
    while (await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(newId).first()) {
      suffix += 1;
      newId = src.id + '-copy' + suffix;
    }
    await env.DB.prepare(`
      INSERT INTO products (
        id, slug, name, color, cat, price, compare_at, material, origin, weight_lb,
        badge, featured, is_new, sizes, colors, gtin, mpn, identifier_exists,
        condition, availability, primary_image, images, description, active
      ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,1)
    `).bind(
      newId,
      (src.slug || src.id) + '-copy' + suffix,
      src.name,
      src.color,
      src.cat,
      src.price,
      src.compare_at,
      src.material,
      src.origin,
      src.weight_lb,
      src.badge,
      src.featured,
      src.is_new,
      src.sizes,
      src.colors,
      src.gtin,
      src.mpn,
      src.identifier_exists,
      src.condition,
      src.availability,
      src.primary_image,
      src.images,
      src.description
    ).run();
    const created = await env.DB.prepare('SELECT * FROM products WHERE id = ?1').bind(newId).first();
    return json({ ok: true, id: newId, item: fromDb(created) }, 201, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } }); }
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
