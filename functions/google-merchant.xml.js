// Cloudflare Pages Function - serves Google Merchant Center feed
// Reads products from D1; falls back to products.json
import data from '../products.json';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fmtMoney(n) {
  return Number(n).toFixed(2) + ' USD';
}

function toGmcXml(products) {
  const now = new Date().toISOString();
  const items = products.map(p => {
    const img = p.primary_image || (p.images && p.images[0]) || '';
    const desc = p.desc || '';
    const link = 'https://www.czevip.com/product.html?id=' + encodeURIComponent(p.id);
    const id = esc(p.id);
    const name = esc(p.name) + (p.color ? ' - ' + esc(p.color) : '');
    const hasSale = p.compare_at && Number(p.compare_at) > 0;
    const hasMpn = p.mpn && p.mpn.length;
    const hasGtin = p.gtin && p.gtin.length;
    const avail = esc(p.availability || 'in_stock');
    const cond = esc(p.condition || 'new');
    const brand = 'CZEVIP';
    const group = esc(p.cat || p.id);
    return [
      '<item>',
      '<g:id>' + id + '</g:id>',
      '<title>' + name + '</title>',
      '<description>' + esc(desc) + '</description>',
      '<link>' + esc(link) + '</link>',
      '<g:image_link>https://www.czevip.com/' + esc(img) + '</g:image_link>',
      '<g:price>' + fmtMoney(p.price) + '</g:price>',
      hasSale ? '<g:sale_price>' + fmtMoney(p.compare_at) + '</g:sale_price>' : '',
      '<g:availability>' + avail + '</g:availability>',
      '<g:condition>' + cond + '</g:condition>',
      '<g:brand>' + brand + '</g:brand>',
      hasMpn ? '<g:mpn>' + esc(p.mpn) + '</g:mpn>' : '',
      hasGtin ? '<g:gtin>' + esc(p.gtin) + '</g:gtin>' : '',
      '<g:identifier_exists>' + (p.identifier_exists ? 'yes' : 'no') + '</g:identifier_exists>',
      '<g:item_group_id>' + group + '</g:item_group_id>',
      '<g:shipping><g:country>US</g:country><g:service>Standard</g:service><g:price>0.00 USD</g:price></g:shipping>',
      '</item>'
    ].join('');
  }).join('');

  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n'
    + '<channel>\n'
    + '<title>CZEVIP</title>\n'
    + '<link>https://www.czevip.com/</link>\n'
    + '<description>Heritage hand-embroidered caps and lifestyle headwear. Free US shipping over $50.</description>\n'
    + '<last_build_date>' + now + '</last_build_date>\n'
    + items + '\n'
    + '</channel>\n'
    + '</rss>\n';
}

export async function onRequest({ env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=900, must-revalidate'
  };
  let products = [];
  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        'SELECT id, slug, name, color, cat, price, compare_at, badge, is_new AS "new", sizes, colors, primary_image, images, description AS desc, mpn, gtin, identifier_exists, condition, availability FROM products WHERE active = 1 ORDER BY featured DESC, id'
      ).all();
      if (results && results.length) {
        products = results.map(r => ({
          ...r,
          sizes: r.sizes ? JSON.parse(r.sizes) : [],
          colors: r.colors ? JSON.parse(r.colors) : [],
          images: r.images ? JSON.parse(r.images) : [],
          price: Number(r.price),
          compare_at: r.compare_at == null ? null : Number(r.compare_at)
        }));
      }
    } catch (e) {}
  }
  if (!products.length) {
    products = (data.products || []);
  }
  return new Response(toGmcXml(products), { headers: { ...cors, 'Content-Type': 'application/xml; charset=utf-8' } });
}
