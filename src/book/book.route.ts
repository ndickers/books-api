import { Hono } from "hono";
import {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
} from "./book.controller";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { validate } from "../middleware/validator";
export const bookRoute = new Hono();

const schema = z.object({
  title: z.string(),
  author: z.string(),
  year: z.number(),
});

bookRoute.get("/books", getBooks);
bookRoute.get("/books/:id", getBook);
bookRoute.post("/books", zValidator("json", schema, validate), addBook);
bookRoute.put("/books/:id", updateBook);
bookRoute.delete("/books/:id", deleteBook);
