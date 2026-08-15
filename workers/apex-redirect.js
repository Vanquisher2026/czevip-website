// Cloudflare Worker: apex -> www redirect
// 301 redirects czevip.com/* to https://www.czevip.com/<path>

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = 'https://www.czevip.com' + url.pathname + url.search;
    return Response.redirect(target, 301);
  }
};