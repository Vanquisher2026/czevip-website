// One-shot seed: copy products.json into D1. Idempotent (INSERT OR IGNORE).
// Use when D1 is empty so the admin can manage the existing catalog.
import { requireAuth } from './_session.js';
import seed from '../../../products.json';

export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  const cors = corsHeaders(env);
  if (!env.DB) return json({ ok: false, error: 'DB not configured' }, 503, cors);
  const products = (seed && seed.products) || [];
  let inserted = 0, skipped = 0, errors = 0;
  const errorDetails = [];
  for (const p of products) {
    try {
      const sizes = JSON.stringify(p.sizes || []);
      const colors = JSON.stringify(p.colors || []);
      const images = JSON.stringify(p.images || []);
      await env.DB.prepare(`
        INSERT OR IGNORE INTO products (
          id, slug, name, color, cat, price, compare_at, material, origin, weight_lb,
          badge, featured, is_new, sizes, colors, gtin, mpn, identifier_exists,
          condition, availability, primary_image, images, description, active
        ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,1)
      `).bind(
        p.id, p.slug || p.id, p.name, p.color || '', p.cat || 'cap', Number(p.price || 0),
        p.compare_at == null ? null : Number(p.compare_at), p.material || '', p.origin || '',
        Number(p.weight_lb || 0.3), p.badge || null, p.featured ? 1 : 0, p.new ? 1 : 0,
        sizes, colors, p.gtin || null, p.mpn || p.id, p.identifier_exists ? 1 : 0,
        p.condition || 'new', p.availability || 'in_stock', p.primary_image || (p.images && p.images[0]) || '',
        images, p.desc || ''
      ).run();
      const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(p.id).first();
      if (existing) inserted++; else skipped++;
    } catch (e) {
      errors++;
      errorDetails.push({ id: p.id, error: String(e.message || e) });
    }
  }
  return json({ ok: true, scanned: products.length, inserted, skipped, errors, errorDetails }, 200, cors);
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
