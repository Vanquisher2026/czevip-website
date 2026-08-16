// Admin AI describe: POST {name, cat, material, origin, color, price, badge} returns generated product description.
// Uses Cloudflare Workers AI (Llama 3.1 8B). Auth via admin session.
import { requireAuth } from './_session.js';

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

function buildPrompt(body) {
  const lines = [
    'Brand: CZEVIP (Brooklyn-based heritage hat maker, hand-embroidered caps, wool felt fedoras, toquilla panamas, merino berets).',
    'Voice: confident, slightly literary, specific to the product, never generic. 90-130 words. No emojis, no hashtags.',
    '',
    'Product:',
    '- Name: ' + (body.name || 'hat'),
    '- Category: ' + (body.cat || 'cap'),
    body.color ? '- Color: ' + body.color : '',
    body.material ? '- Material: ' + body.material : '',
    body.origin ? '- Origin: ' + body.origin : '',
    body.price ? '- Price: $' + body.price + ' USD' : '',
    body.badge ? '- Collection / badge: ' + body.badge : '',
    '',
    'Write a single product description paragraph suitable for an e-commerce PDP. Cover: what it is, who it is for, how it is made, what makes it different. End with a sentence on care or sizing.'
  ].filter(Boolean);
  return lines.join('\n');
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
  if (!body || !body.name) return json({ error: 'name required' }, 400, c);

  if (!env.CF_AI_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'AI not configured (CF_AI_TOKEN / CF_ACCOUNT_ID missing)' }, 503, c);
  }

  const prompt = buildPrompt(body);
  const aiUrl = 'https://api.cloudflare.com/client/v4/accounts/' + env.CF_ACCOUNT_ID + '/ai/run/@cf/meta/llama-3.1-8b-instruct';
  const aiBody = JSON.stringify({
    messages: [
      { role: 'system', content: 'You are an expert copywriter for a US heritage hat brand called CZEVIP. You write product descriptions that are specific, evocative, and never use filler phrases like "timeless elegance" or "must-have".' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 280
  });

  try {
    const aiRes = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.CF_AI_TOKEN,
        'Content-Type': 'application/json'
      },
      body: aiBody
    });
    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => '');
      return json({ error: 'AI upstream failed', status: aiRes.status, detail: errText.slice(0, 300) }, 502, c);
    }
    const aiData = await aiRes.json();
    const text = aiData && aiData.result && aiData.result.response ? String(aiData.result.response).trim() : '';
    if (!text) return json({ error: 'AI returned empty' }, 502, c);
    return json({ ok: true, description: text }, 200, c);
  } catch (e) {
    return json({ error: 'AI request error: ' + String(e.message || e) }, 502, c);
  }
}
