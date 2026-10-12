export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Send first-time visitors to the product landing page while preserving
    // direct access to the dashboard and all other static pages.
    if (url.pathname === "/") {
      url.pathname = "/landing/";
      return Response.redirect(url.toString(), 302);
    }

    // Cloudflare may canonicalize /index.html to /. Keep a stable, explicit
    // URL for the Sales dashboard so it is not sent through the landing-page
    // redirect above.
    if (url.pathname === "/sales-dashboard" || url.pathname === "/sales-dashboard/") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    return env.ASSETS.fetch(request);
  },
};
