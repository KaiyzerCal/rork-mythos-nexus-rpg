// Cloudflare Workers don't have Node's "process"
(globalThis as any).process ??= { env: {} };
// Cloudflare Workers do not provide Node's "process". Some libs expect it.
// Provide a minimal shim so references to process.env won't crash.
const g = globalThis as any;
if (!g.process) g.process = { env: {} };
if (!g.process.env) g.process.env = {};

import app from "./hono";

// Cloudflare Workers entry
export default {
  async fetch(request: Request, env: any, ctx: any) {
    // expose env safely (optional, but useful)
    (globalThis as any).env = env;
    return app.fetch(request, env, ctx);
  },
};

