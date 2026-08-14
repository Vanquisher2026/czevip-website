 // Cloudflare Pages Function - creates a Stripe Checkout Session
 // Env vars required: STRIPE_SECRET_KEY, STRIPE_CURRENCY (default USD), PUBLIC_SITE_URL
 export async function onRequestPost({ request, env }) {
   const cors = {
     'Access-Control-Allow-Origin': env.PUBLIC_SITE_URL || 'https://czevip.com',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type'
   };
   if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
   if (!env.STRIPE_SECRET_KEY) {
     return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
       status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
     });
   }
   let body;
   try { body = await request.json(); } catch (e) {
     return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
       status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
     });
   }
   const items = Array.isArray(body.items) ? body.items : [];
   if (!items.length) {
     return new Response(JSON.stringify({ error: 'Cart is empty' }), {
       status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
     });
   }
   const currency = (env.STRIPE_CURRENCY || 'usd').toLowerCase();
   const params = new URLSearchParams();
   params.set('mode', 'payment');
   params.set('success_url', (env.PUBLIC_SITE_URL || 'https://czevip.com') + '/cart.html?status=success');
   params.set('cancel_url', (env.PUBLIC_SITE_URL || 'https://czevip.com') + '/cart.html?status=cancel');
   let i = 0;
   for (const it of items) {
     params.set(`line_items[${i}][quantity]`, String(it.qty || 1));
     params.set(`line_items[${i}][price_data][currency]`, currency);
     params.set(`line_items[${i}][price_data][product_data][name]`, `${it.name} - ${it.color || ''}${it.size ? ' / ' + it.size : ''}`);
     params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round((it.price || 0) * 100)));
     i++;
   }
   try {
     const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: params.toString()
     });
     const session = await res.json();
     if (!res.ok) throw new Error(session.error && session.error.message || 'Stripe error');
     return new Response(JSON.stringify({ url: session.url }), {
       status: 200, headers: { ...cors, 'Content-Type': 'application/json' }
     });
   } catch (e) {
     return new Response(JSON.stringify({ error: String(e.message || e) }), {
       status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
     });
   }
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
