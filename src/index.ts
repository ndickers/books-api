import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { cors } from "hono/cors";
import { bookRoute } from "./books/book.route";
import { authRoutes } from "./auth/auth.routes";

const app = new Hono();

app.use(cors());
app.route("/api", bookRoute);
app.route("/", authRoutes);

const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
