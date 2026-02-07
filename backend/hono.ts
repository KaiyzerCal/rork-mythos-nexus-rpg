import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use(
<<<<<<< HEAD
  "/api/trpc/*",
  trpcServer({
=======
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
    router: appRouter,
    createContext,
  })
);

<<<<<<< HEAD
app.get("/", (c) => c.json({ ok: true, service: "mythos-nexus-api" }));

export default app;

=======
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
>>>>>>> d22fac4cbc76f066be704c062f82130f6208762e
