export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Cached public health check endpoint
    if (url.pathname === "/gateway-health" && request.method === "GET") {
      const cache = caches.default;
      let response = await cache.match(request);

      if (response) {
        const hitHeaders = new Headers(response.headers);
        hitHeaders.set("X-Cache", "HIT");
        return new Response(response.body, {
          status: response.status,
          headers: hitHeaders,
        });
      }

      response = Response.json(
        {
          gateway: "online",
          connectedService: "support-api",
          cachedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=60",
            "X-Cache": "MISS",
          },
        }
      );

      ctx.waitUntil(cache.put(request, response.clone()));
      return response;
    }

    // 2. Forward /tickets API calls to support-api via Service Binding
    if (url.pathname.startsWith("/tickets")) {
      return env.SUPPORT_API.fetch(request);
    }

    // 3. Serve the static Help Center UI for everything else
    return env.ASSETS.fetch(request);
  },
};
