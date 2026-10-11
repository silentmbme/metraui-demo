export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Make the product landing page the default entry point while preserving
    // direct access to the dashboard and all other static pages.
    if (url.pathname === "/") {
      url.pathname = "/landing/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
