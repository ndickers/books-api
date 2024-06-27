import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { bookRoute } from "./book/book.route";
const app = new Hono();

app.route("/", bookRoute);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});





