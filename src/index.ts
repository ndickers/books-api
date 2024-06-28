import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { bookRoute } from "./books/book.route";

const app = new Hono();

app.route("/api", bookRoute);

const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

