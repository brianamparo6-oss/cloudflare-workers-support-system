export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        status: "Support API is running",
        contact: env.SUPPORT_EMAIL,
        maxTickets: env.MAX_TICKETS,
      });
    }

    if (url.pathname === "/tickets" && request.method === "GET") {
      const authHeader = request.headers.get("Authorization");
      if (authHeader !== `Bearer ${env.ADMIN_API_KEY}`) {
        return Response.json({ error: "Unauthorized: Invalid or missing API key" }, { status: 401 });
      }
      const { results } = await env.support_db
        .prepare("SELECT * FROM tickets ORDER BY created_at DESC")
        .all();
      return Response.json({ count: results.length, tickets: results });
    }

    if (url.pathname === "/tickets" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.name || !body.issue) {
          return Response.json({ error: "Both 'name' and 'issue' fields are required." }, { status: 400 });
        }
        const newTicket = {
          id: crypto.randomUUID(),
          name: body.name,
          issue: body.issue,
          status: "open",
          created_at: new Date().toISOString(),
        };
        await env.support_db
          .prepare("INSERT INTO tickets (id, name, issue, status, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(newTicket.id, newTicket.name, newTicket.issue, newTicket.status, newTicket.created_at)
          .run();
        return Response.json({ message: "Ticket created", ticket: newTicket }, { status: 201 });
      } catch (err) {
        return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    return Response.json({ error: "Route not found" }, { status: 404 });
  },

  // Background Cron Trigger handler
  async scheduled(controller, env, ctx) {
    const { results } = await env.support_db
      .prepare("SELECT COUNT(*) AS open_count FROM tickets WHERE status = 'open'")
      .all();
    console.log(`[CRON ${controller.cron}] Open support tickets: ${results.open_count}`);
  },
};
