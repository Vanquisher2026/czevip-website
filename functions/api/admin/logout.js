// Admin logout: clear session and cookie.
import { clearCookie, destroySession, parseCookies, COOKIE } from './_session.js';

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
  const cookies = parseCookies(request.headers.get('Cookie'));
  await destroySession(env, cookies[COOKIE]);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() }
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
