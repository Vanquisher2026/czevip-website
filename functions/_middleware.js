// Pages middleware: redirect czevip.com apex to www.czevip.com (301, with path preserved)
// Runs before any other Functions or static asset.

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'czevip.com') {
    const target = 'https://www.czevip.com' + url.pathname + url.search;
    return Response.redirect(target, 301);
  }
  return context.next();
}