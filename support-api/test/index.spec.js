import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(async () => {
  await env.support_db
    .prepare(
      "CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, name TEXT NOT NULL, issue TEXT NOT NULL, status TEXT DEFAULT 'open', created_at TEXT NOT NULL)"
    )
    .run();
});

describe("Support Request API with D1", () => {
  it("returns public config variables on GET /", async () => {
    const response = await SELF.fetch("http://example.com/");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.contact).toBe("help@brianamparo.dev");
    expect(data.maxTickets).toBe("100");
  });

  it("blocks GET /tickets without an API key (401)", async () => {
    const response = await SELF.fetch("http://example.com/tickets");
    expect(response.status).toBe(401);
  });

  it("persists a ticket in D1 and retrieves it with valid API key", async () => {
    const postRes = await SELF.fetch("http://example.com/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Brian", issue: "Login bug" }),
    });
    expect(postRes.status).toBe(201);

    const getRes = await SELF.fetch("http://example.com/tickets", {
      headers: { Authorization: `Bearer ${env.ADMIN_API_KEY}` },
    });
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body.count).toBe(1);
    expect(body.tickets[0].name).toBe("Brian");
  });
});
