export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Send first-time visitors to the product landing page while preserving
    // direct access to the dashboard and all other static pages.
    if (url.pathname === "/") {
      url.pathname = "/landing/";
      return Response.redirect(url.toString(), 302);
    }

    return env.ASSETS.fetch(request);
  },
};
