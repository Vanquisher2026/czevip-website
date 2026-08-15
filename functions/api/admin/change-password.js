// Admin password change: requires authenticated session.
// Accepts { current, next }, verifies current matches, persists next to settings.
import { requireAuth, passwordFromDbOrEnv, timingSafeEqual } from './_session.js';

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
  const unauthorized = await requireAuth(request, env);
  if (unauthorized) return unauthorized;

  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }

  const current = String(body.current || '');
  const next = String(body.next || '');
  if (!current || !next) return json({ error: 'Missing current or next' }, 400, cors);
  if (next.length < 10) return json({ error: 'New password must be at least 10 characters' }, 400, cors);
  if (next.length > 128) return json({ error: 'New password too long' }, 400, cors);

  const expected = await passwordFromDbOrEnv(env);
  if (!timingSafeEqual(current, expected)) {
    await new Promise(r => setTimeout(r, 250));
    return json({ error: 'Current password is incorrect' }, 401, cors);
  }

  if (!env.DB) return json({ error: 'Database not configured' }, 500, cors);

  try {
    await env.DB.prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES ('admin_password', ?1, unixepoch()) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()"
    ).bind(next).run();
    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ error: 'Failed to persist: ' + (e.message || String(e)) }, 500, cors);
  }
}

export async function onRequestOptions({ request, env }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}