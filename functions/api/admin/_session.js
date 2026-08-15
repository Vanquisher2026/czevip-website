// Shared session/auth helpers for admin Functions
// Session model: random 32-byte hex token, stored in D1, 7-day TTL.
// Cookie name: czevip_admin, HttpOnly, SameSite=Lax, Secure.

const COOKIE = 'czevip_admin';
const TTL_SECONDS = 7 * 24 * 3600;

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const len = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= ca ^ cb;
  }
  return mismatch === 0;
}

function makeToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function buildCookie(value, maxAge) {
  const parts = [
    COOKIE + '=' + encodeURIComponent(value),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + maxAge,
    'Secure'
  ];
  return parts.join('; ');
}

function clearCookie() {
  return COOKIE + '=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';
}

async function createSession(env) {
  const token = makeToken();
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO admin_sessions (token, expires_at) VALUES (?1, ?2)'
      ).bind(token, expiresAt).run();
    } catch (e) {}
  }
  return { token, expiresAt };
}

async function destroySession(env, token) {
  if (!token || !env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?1').bind(token).run();
  } catch (e) {}
}

async function getSession(env, token) {
  if (!token || !env.DB) return null;
  try {
    const row = await env.DB.prepare(
      'SELECT token, expires_at FROM admin_sessions WHERE token = ?1'
    ).bind(token).first();
    if (!row) return null;
    if (row.expires_at < Math.floor(Date.now() / 1000)) {
      await destroySession(env, token);
      return null;
    }
    return row;
  } catch (e) {
    return null;
  }
}

function passwordFromEnv(env) {
  return env.ADMIN_PASSWORD || 'czevip-admin';
}

async function passwordFromDbOrEnv(env) {
  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        "SELECT value FROM settings WHERE key = 'admin_password'"
      ).first();
      if (row && row.value && row.value.length > 0) return row.value;
    } catch (e) {}
  }
  return passwordFromEnv(env);
}

async function requireAuth(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[COOKIE];
  const session = await getSession(env, token);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}

export {
  COOKIE, TTL_SECONDS,
  parseCookies, buildCookie, clearCookie,
  createSession, destroySession, getSession,
  passwordFromEnv, passwordFromDbOrEnv, timingSafeEqual,
  requireAuth
};
