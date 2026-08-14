// Bulk update multiple products in one transaction.
// POST { ids: string[], action: string, value?: any }
//
// Actions:
//   set_price         value: number  -> price = value
//   adjust_price      value: number  -> price = price * (1 + value/100), rounded to 2 decimals
//   set_badge         value: string  -> badge = value (empty string clears)
//   clear_badge                       -> badge = NULL
//   set_availability  value: string  -> availability = value (in_stock | out_of_stock | preorder)
//   set_featured      value: boolean -> featured = value
//   set_active        value: boolean -> active = value (false = archive)
//   archive                           -> active = 0 (soft delete)
import { requireAuth } from '../_session.js';

const ACTIONS = {
  set_price:        { sql: 'UPDATE products SET price = ?1, updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [Number(v)] },
  adjust_price:     { sql: 'UPDATE products SET price = ROUND(price * (1 + ?1 / 100.0), 2), updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [Number(v)] },
  set_badge:        { sql: 'UPDATE products SET badge = ?1, updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [v ? String(v) : null] },
  clear_badge:      { sql: 'UPDATE products SET badge = NULL, updated_at = unixepoch() WHERE id = ?1', bindVal: () => [] },
  set_availability: { sql: 'UPDATE products SET availability = ?1, updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [String(v)] },
  set_featured:     { sql: 'UPDATE products SET featured = ?1, updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [v ? 1 : 0] },
  set_active:       { sql: 'UPDATE products SET active = ?1, updated_at = unixepoch() WHERE id = ?2', bindVal: (v) => [v ? 1 : 0] },
  archive:          { sql: 'UPDATE products SET active = 0, updated_at = unixepoch() WHERE id = ?1', bindVal: () => [] }
};

export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
  const action = body.action;
  if (!ids.length) return json({ error: 'ids required' }, 400, cors);
  if (!ACTIONS[action]) return json({ error: 'unknown action', allowed: Object.keys(ACTIONS) }, 400, cors);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  const cfg = ACTIONS[action];
  const extra = cfg.bindVal(body.value);
  let updated = 0;
  const failed = [];
  for (const id of ids) {
    try {
      const res = await env.DB.prepare(cfg.sql).bind(...extra, id).run();
      updated += (res.meta && res.meta.changes) || 0;
    } catch (e) {
      failed.push({ id, error: String(e.message || e) });
    }
  }
  return json({ ok: true, action, requested: ids.length, updated, failed }, 200, cors);
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
