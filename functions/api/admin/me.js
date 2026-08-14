// Admin me: returns current user info if session valid, else 401.
import { parseCookies, getSession, COOKIE } from './_session.js';

export async function onRequestGet({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
  const cookies = parseCookies(request.headers.get('Cookie'));
  const session = await getSession(env, cookies[COOKIE]);
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ authenticated: true, user: 'admin' }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' }
  });
}

export async function onRequestOptions({ request, env }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}
