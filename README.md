# Cloudflare Workers Serverless Support System

A full-stack, multi-Worker serverless support application built and tested locally on Kali Linux using **Cloudflare Workers**, **Wrangler CLI**, **D1 (Serverless SQLite)**, **Service Bindings**, **Static Assets**, **Workers Cache API**, **Cron Triggers**, and **Vitest**.

## Architecture

1. **`my-first-worker`** — Edge serverless Worker deployed to Cloudflare's global network.
2. **`support-api`** — REST API (`GET /`, `GET /tickets`, `POST /tickets`) backed by **Cloudflare D1** SQLite storage, protected with bearer-token secret authentication, automated **Vitest** integration tests (`@cloudflare/vitest-pool-workers`), and hourly **Cron Triggers**.
3. **`support-gateway`** — Public-facing API Gateway & Help Center UI powered by **Workers Static Assets**, **Workers Cache API** (`caches.default`), and zero-latency **Service Bindings** (`env.SUPPORT_API`) to communicate internally with `support-api`.

## Key Features Implemented

- **Serverless REST API & D1 Persistence:** Full CRUD ticket creation and retrieval with parameterized SQL queries.
- **Security & Secret Management:** Public environment variables in `wrangler.jsonc` and encrypted secrets (`ADMIN_API_KEY`) managed via Wrangler Secrets.
- **Microservices via Service Bindings:** Internal Worker-to-Worker RPC/HTTP routing without public network overhead.
- **Edge Caching & Observability:** Cache-Control headers with `X-Cache: HIT/MISS` verification, live log streaming (`wrangler tail`), gradual version traffic splitting, and instant rollbacks.
- **Automated Testing:** Integration test suite running directly inside the `workerd` runtime via Vitest.
