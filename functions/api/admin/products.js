// Admin products: GET list (incl. inactive), POST create.
import { requireAuth } from './_session.js';
import { fromDb, toDb, validateRequired } from './_db.js';

export async function onRequestGet({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get('all') === '1';
  if (!env.DB) return json({ ok: true, items: [], db: false }, 200, cors);
  try {
    const sql = includeInactive
      ? 'SELECT * FROM products ORDER BY featured DESC, cat, id'
      : 'SELECT * FROM products WHERE active = 1 ORDER BY featured DESC, cat, id';
    const rows = await env.DB.prepare(sql).all();
    return json({ ok: true, items: (rows.results || []).map(fromDb), db: true }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }
  if (!body || typeof body !== 'object') return json({ error: 'Body required' }, 400, cors);
  const row = toDb(body);
  // Defaults for fields omitted in the request.
  if (row.featured === undefined) row.featured = 0;
  if (row.is_new === undefined) row.is_new = 0;
  if (row.identifier_exists === undefined) row.identifier_exists = 0;
  if (row.condition === undefined) row.condition = 'new';
  if (row.availability === undefined) row.availability = 'in_stock';
  if (row.active === undefined) row.active = 1;
  const missing = validateRequired(row);
  if (missing.length) return json({ error: 'Missing fields', missing }, 400, cors);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(row.id).first();
    if (existing) return json({ error: 'id already exists' }, 409, cors);
    await env.DB.prepare(`
      INSERT INTO products (
        id, slug, name, color, cat, price, compare_at, material, origin, weight_lb,
        badge, featured, is_new, sizes, colors, gtin, mpn, identifier_exists,
        condition, availability, primary_image, images, description, active
      ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24)
    `).bind(
      row.id, row.slug, row.name, row.color, row.cat, row.price, row.compare_at,
      row.material, row.origin, row.weight_lb, row.badge, row.featured, row.is_new,
      row.sizes, row.colors, row.gtin, row.mpn, row.identifier_exists,
      row.condition, row.availability, row.primary_image, row.images,
      row.description, row.active
    ).run();
    return json({ ok: true, id: row.id }, 201, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } }); }
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
