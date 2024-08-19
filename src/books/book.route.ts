import { Hono } from "hono";
import {
  getUserBooks,
  addBook,
  updateBook,
  deleteBook,
} from "./book.controller";
import { authorize } from "../middleware/authorize";
export const bookRoute = new Hono();

bookRoute.get("/books/:id", authorize, getUserBooks);
bookRoute.post("/books", authorize, addBook);
bookRoute.put("/books/:id", authorize, updateBook);
bookRoute.delete("/books/:id", authorize, deleteBook);
