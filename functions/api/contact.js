 // Cloudflare Pages Function - generic contact form
 // Persists inquiry to D1 (binding: DB) and emails via Resend if RESEND_API_KEY is set
 export async function onRequestPost({ request, env }) {
   const cors = {
     'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type'
   };
   if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
   const ip = request.headers.get('cf-connecting-ip') || '';
   const ua = request.headers.get('user-agent') || '';
   let body;
   try { body = await request.json(); } catch (e) {
     return json({ error: 'Invalid JSON' }, 400, cors);
   }
   if (!body.email || !body.message) return json({ error: 'Missing fields' }, 400, cors);
   const record = {
     kind: 'contact',
     name: String(body.name || '').slice(0, 200),
     email: String(body.email).slice(0, 200),
     payload: JSON.stringify(body).slice(0, 8000)
   };
   await persist(env.DB, record, ip, ua);
   await notify(env, 'Contact: ' + record.name, record);
   return json({ ok: true }, 200, cors);
 }
 export async function onRequestOptions({ request, env }) {
   return new Response(null, {
     status: 204,
     headers: {
       'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type'
     }
   });
 }
 async function persist(DB, r, ip, ua) {
   if (!DB) return;
   try {
     await DB.prepare(
       'INSERT INTO inquiries (kind, name, email, payload, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
     ).bind(r.kind, r.name, r.email, r.payload, ip, ua).run();
   } catch (e) {}
 }
 async function notify(env, subject, r) {
   if (!env.RESEND_API_KEY || !env.NOTIFY_TO) return;
   try {
     await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
       body: JSON.stringify({
         from: env.NOTIFY_FROM || 'CZEVIP Site <noreply@czevip.com>',
         to: [env.NOTIFY_TO],
         subject: subject,
         text: 'New inquiry from ' + r.name + ' <' + r.email + '>\n\n' + r.payload
       })
     });
   } catch (e) {}
 }
 function json(data, status, headers) {
   return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
 }
