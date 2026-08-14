// Shared DB helpers for admin product CRUD.
// Translates between D1 row shape and the product JSON shape used by the public site.

const PRODUCT_COLUMNS = [
  'id','slug','name','color','cat','price','compare_at','material','origin',
  'weight_lb','badge','featured','is_new','sizes','colors','gtin','mpn',
  'identifier_exists','condition','availability','primary_image','images',
  'description','active','created_at','updated_at'
];

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    color: row.color,
    cat: row.cat,
    price: Number(row.price),
    compare_at: row.compare_at == null ? null : Number(row.compare_at),
    material: row.material,
    origin: row.origin,
    weight_lb: Number(row.weight_lb),
    badge: row.badge,
    featured: !!row.featured,
    new: !!row.is_new,
    sizes: safeJson(row.sizes, []),
    colors: safeJson(row.colors, []),
    gtin: row.gtin,
    mpn: row.mpn,
    identifier_exists: !!row.identifier_exists,
    condition: row.condition,
    availability: row.availability,
    primary_image: row.primary_image,
    images: safeJson(row.images, []),
    desc: row.description,
    active: !!row.active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function toDb(body) {
  // Convert request body fields to DB-ready values.
  const out = {};
  if (body.id !== undefined) out.id = String(body.id).trim();
  if (body.slug !== undefined) out.slug = String(body.slug).trim();
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.color !== undefined) out.color = String(body.color).trim();
  if (body.cat !== undefined) out.cat = String(body.cat).trim();
  if (body.price !== undefined) out.price = Number(body.price);
  if (body.compare_at !== undefined) out.compare_at = body.compare_at === null || body.compare_at === '' ? null : Number(body.compare_at);
  if (body.material !== undefined) out.material = String(body.material).trim();
  if (body.origin !== undefined) out.origin = String(body.origin).trim();
  if (body.weight_lb !== undefined) out.weight_lb = Number(body.weight_lb);
  if (body.badge !== undefined) out.badge = body.badge ? String(body.badge) : null;
  if (body.featured !== undefined) out.featured = body.featured ? 1 : 0;
  if (body.new !== undefined) out.is_new = body.new ? 1 : 0;
  if (body.sizes !== undefined) out.sizes = JSON.stringify(body.sizes || []);
  if (body.colors !== undefined) out.colors = JSON.stringify(body.colors || []);
  if (body.gtin !== undefined) out.gtin = body.gtin ? String(body.gtin) : null;
  if (body.mpn !== undefined) out.mpn = body.mpn ? String(body.mpn) : null;
  if (body.identifier_exists !== undefined) out.identifier_exists = body.identifier_exists ? 1 : 0;
  if (body.condition !== undefined) out.condition = String(body.condition || 'new');
  if (body.availability !== undefined) out.availability = String(body.availability || 'in_stock');
  if (body.primary_image !== undefined) out.primary_image = String(body.primary_image).trim();
  if (body.images !== undefined) out.images = JSON.stringify(body.images || []);
  if (body.desc !== undefined) out.description = String(body.desc).trim();
  if (body.active !== undefined) out.active = body.active ? 1 : 0;
  return out;
}

function safeJson(s, fallback) {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

function validateRequired(row) {
  const missing = [];
  for (const k of ['id','slug','name','color','cat','price','material','origin','weight_lb','primary_image','description']) {
    if (row[k] === undefined || row[k] === null || row[k] === '') missing.push(k);
  }
  return missing;
}

export { PRODUCT_COLUMNS, fromDb, toDb, validateRequired };
