// Admin product detail: GET, PUT (update), DELETE (soft-delete via active=0).
import { requireAuth } from '../_session.js';
import { fromDb, toDb } from '../_db.js';

export async function onRequestGet({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?1').bind(params.id).first();
    if (!row) return json({ ok: false, error: 'Not found' }, 404, cors);
    return json({ ok: true, item: fromDb(row) }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

export async function onRequestPut({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }
  if (!body || typeof body !== 'object') return json({ error: 'Body required' }, 400, cors);
  const row = toDb(body);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404, cors);
    const cols = [];
    const binds = [];
    for (const k of Object.keys(row)) {
      cols.push(k + ' = ?');
      binds.push(row[k]);
    }
    cols.push('updated_at = unixepoch()');
    binds.push(params.id);
    await env.DB.prepare('UPDATE products SET ' + cols.join(', ') + ' WHERE id = ?').bind(...binds).run();
    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

export async function onRequestDelete({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    await env.DB.prepare('UPDATE products SET active = 0, updated_at = unixepoch() WHERE id = ?1').bind(params.id).run();
    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } }); }
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
