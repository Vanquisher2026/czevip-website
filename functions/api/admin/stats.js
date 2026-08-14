// Dashboard stats: counts of inquiries by status/kind and products by active.
import { requireAuth } from './_session.js';

export async function onRequestGet({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) {
    return json({ ok: true, db: false, inquiries: { total: 0, by_status: {}, by_kind: {} }, products: { total: 0, active: 0, inactive: 0 } }, 200, cors);
  }
  try {
    const inq = await env.DB.prepare(
      'SELECT status, kind, COUNT(*) as n FROM inquiries GROUP BY status, kind'
    ).all();
    const inqTotals = { total: 0, by_status: {}, by_kind: {} };
    for (const r of inq.results || []) {
      inqTotals.total += r.n;
      inqTotals.by_status[r.status] = (inqTotals.by_status[r.status] || 0) + r.n;
      inqTotals.by_kind[r.kind] = (inqTotals.by_kind[r.kind] || 0) + r.n;
    }
    const prodTotals = await env.DB.prepare(
      'SELECT COUNT(*) as total, SUM(CASE WHEN active=1 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN active=0 THEN 1 ELSE 0 END) as inactive FROM products'
    ).first();
    return json({
      ok: true,
      db: true,
      inquiries: inqTotals,
      products: {
        total: prodTotals.total || 0,
        active: prodTotals.active || 0,
        inactive: prodTotals.inactive || 0
      }
    }, 200, cors);
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
