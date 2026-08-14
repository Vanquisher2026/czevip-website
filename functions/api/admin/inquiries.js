// Admin inquiries list: filter by kind and/or status, paginated.
import { requireAuth } from './_session.js';

export async function onRequestGet({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);
  if (!env.DB) return json({ ok: true, items: [], total: 0, db: false }, 200, cors);
  try {
    const conds = [];
    const binds = [];
    if (kind) { conds.push('kind = ?'); binds.push(kind); }
    if (status) { conds.push('status = ?'); binds.push(status); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const rowsP = env.DB.prepare(
      'SELECT id, kind, name, email, payload, ip, created_at, status FROM inquiries ' + where + ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(...binds, limit, offset).all();
    const totalP = env.DB.prepare('SELECT COUNT(*) as n FROM inquiries ' + where).bind(...binds).first();
    const [rows, total] = await Promise.all([rowsP, totalP]);
    return json({ ok: true, items: rows.results || [], total: total.n || 0, db: true }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } }); }
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
