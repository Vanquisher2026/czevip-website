// Admin inquiry detail / status update.
import { requireAuth } from '../_session.js';

export async function onRequestGet({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const row = await env.DB.prepare(
      'SELECT id, kind, name, email, payload, ip, user_agent, created_at, status FROM inquiries WHERE id = ?1'
    ).bind(params.id).first();
    if (!row) return json({ ok: false, error: 'Not found' }, 404, cors);
    return json({ ok: true, item: row }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

export async function onRequestPatch({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }
  if (!body || typeof body.status !== 'string') return json({ error: 'status required' }, 400, cors);
  const allowed = ['new', 'read', 'replied', 'archived'];
  if (!allowed.includes(body.status)) return json({ error: 'invalid status' }, 400, cors);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  try {
    const res = await env.DB.prepare('UPDATE inquiries SET status = ?1 WHERE id = ?2').bind(body.status, params.id).run();
    return json({ ok: true, changes: res.meta && res.meta.changes || 0 }, 200, cors);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500, cors);
  }
}

function json(data, status, headers) { return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } }); }
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}
