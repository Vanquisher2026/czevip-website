// Admin AI regenerate: writes a fresh description to D1 using Workers AI.
// POST { id }                                    -> regenerate one product
// POST { all: true, scope?: 'active' | 'all' }   -> regenerate all (rate-limited)
//
// Auth via admin session (requireAuth). Requires CF_AI_TOKEN + CF_ACCOUNT_ID.
import { requireAuth } from './_session.js';
import { fromDb } from './_db.js';

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };
}

function buildPrompt(p) {
  const lines = [
    'Brand: CZEVIP (Brooklyn-based heritage hat maker, hand-embroidered caps, wool felt fedoras, toquilla panamas, merino berets, OEM/private-label).',
    'Voice: confident, slightly literary, specific to the product, never generic. 90-130 words. No emojis, no hashtags, no filler phrases like "timeless elegance" or "must-have".',
    'Sourcing facts: hand-embroidered caps sit in the DTC family collection; OEM bulk orders use machine embroidery to keep unit cost down. Do not contradict this.',
    '',
    'Product:',
    '- ID: ' + (p.id || 'hat'),
    '- Name: ' + (p.name || 'hat'),
    '- Category: ' + (p.cat || 'cap'),
    p.color ? '- Color: ' + p.color : '',
    p.material ? '- Material: ' + p.material : '',
    p.origin ? '- Origin: ' + p.origin : '',
    p.price != null ? '- Price: $' + p.price + ' USD' : '',
    p.badge ? '- Collection / badge: ' + p.badge : '',
    p.weight_lb ? '- Weight: ' + p.weight_lb + ' lb' : '',
    '',
    'Write a single product description paragraph suitable for an e-commerce PDP. Cover: what it is, who it is for, how it is made, what makes it different. End with a sentence on care or sizing.'
  ].filter(Boolean);
  return lines.join('\n');
}

async function callAI(env, prompt) {
  const url = 'https://api.cloudflare.com/client/v4/accounts/' + env.CF_ACCOUNT_ID + '/ai/run/@cf/meta/llama-3.1-8b-instruct';
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.CF_AI_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are an expert copywriter for a US heritage hat brand called CZEVIP. You write product descriptions that are specific, evocative, and never use filler phrases.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 280
    })
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error('AI upstream ' + r.status + ': ' + t.slice(0, 200));
  }
  const data = await r.json();
  const text = data && data.result && data.result.response ? String(data.result.response).trim() : '';
  if (!text) throw new Error('AI returned empty');
  return text;
}

async function regenerateOne(env, id) {
  const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?1').bind(id).first();
  if (!row) return { id, ok: false, error: 'not found' };
  const p = fromDb(row);
  const prompt = buildPrompt(p);
  let text;
  try { text = await callAI(env, prompt); }
  catch (e) { return { id, ok: false, error: String(e.message || e) }; }
  await env.DB.prepare(
    'UPDATE products SET description = ?1, updated_at = unixepoch() WHERE id = ?2'
  ).bind(text, id).run();
  return { id, ok: true, description: text };
}

export async function onRequest({ request, env }) {
  const c = cors(env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: c });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, c);

  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;

  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400, c); }
  if (!body || typeof body !== 'object') return json({ error: 'Body required' }, 400, c);

  if (!env.CF_AI_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'AI not configured (CF_AI_TOKEN / CF_ACCOUNT_ID missing)' }, 503, c);
  }
  if (!env.DB) return json({ error: 'DB not configured' }, 503, c);

  // Single product
  if (body.id) {
    const r = await regenerateOne(env, String(body.id));
    return json({ ok: r.ok, ...r }, r.ok ? 200 : 500, c);
  }

  // Batch
  if (body.all === true) {
    const scope = body.scope === 'all' ? 'all' : 'active';
    const where = scope === 'all' ? '1=1' : 'active = 1';
    const rows = await env.DB.prepare(
      'SELECT id FROM products WHERE ' + where + ' ORDER BY featured DESC, id'
    ).all();
    const list = (rows.results || []).map(r => r.id);
    const results = [];
    let ok = 0, failed = 0;
    for (const id of list) {
      const r = await regenerateOne(env, id);
      results.push(r);
      if (r.ok) ok++; else failed++;
      // 1s gap stays under the 10k neurons/day free tier and avoids CF 429.
      await new Promise(res => setTimeout(res, 1000));
    }
    return json({ ok: true, total: list.length, regenerated: ok, failed, results }, 200, c);
  }

  return json({ error: 'Provide id or all:true' }, 400, c);
}
