// Admin login: validate password, create session, set HttpOnly cookie.
import { buildCookie, createSession, passwordFromEnv, passwordFromDbOrEnv, timingSafeEqual, TTL_SECONDS } from './_session.js';

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
  let body;
  try { body = await request.json(); } catch (e) {
    return json({ error: 'Invalid JSON' }, 400, cors);
  }
  const submitted = String(body.password || '');
  const expected = await passwordFromDbOrEnv(env);
  if (!submitted || !timingSafeEqual(submitted, expected)) {
    // Constant-time-ish delay even on failure to discourage brute force.
    await new Promise(r => setTimeout(r, 250));
    return json({ error: 'Invalid password' }, 401, cors);
  }
  const { token, expiresAt } = await createSession(env);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...cors,
      'Content-Type': 'application/json',
      'Set-Cookie': buildCookie(token, TTL_SECONDS)
    }
  });
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

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
