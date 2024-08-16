import {
  addBookToDB,
  updateService,
  serveUsersBook,
  deleteService,
} from "./book.service";
import { TSBook, TIBook } from "../drizzle/schema";
import { Context } from "hono";
import * as v from "valibot";

export async function getUserBooks(c: Context) {
  const id: number = Number(c.req.param("id"));
  const book = await serveUsersBook(id);
  try {
    if (book?.length === 0) {
      return c.json({ message: "The book does not exist" }, 404);
    }
    if (book === null) {
      return c.json({ message: "Server error. Couldn't fetch the book" }, 404);
    }
    return c.json({ data: book });
  } catch (error) {
    return c.json({ error }, 404);
  }
}

export async function addBook(c: Context) {
  const bookSchema = v.object({
    user_id: v.number("Enter user id"),
    title: v.string("Enter book title"),
    author: v.string("Enter book author"),
    year: v.number("Enter publication year"),
  });
  const bookDetails: TIBook = await c.req.json();
  const results = v.safeParse(bookSchema, bookDetails, { abortEarly: true });
  if (!results.success) {
    return c.json({ error: results.issues[0].message }, 404);
  }
  const addedBook = await addBookToDB(results.output);
  try {
    if (addedBook?.length === 0) {
      return c.json({ message: "Book was unable to be added" }, 404);
    }
    if (addedBook === null) {
      return c.json({ message: "Server error" });
    }
    return c.json({ message: "Book added successfully", data: addedBook });
  } catch (error) {
    return c.json({ error });
  }
}

export async function updateBook(c: Context) {
  const id = Number(c.req.param("id"));
  const bookDetail: TIBook = await c.req.json();
  const bookUpdated = await updateService(id, bookDetail);
  try {
    if (bookUpdated === null) {
      return c.json({ message: "Server error, Unable to update book" }, 500);
    }
    if (bookUpdated?.length === 0) {
      return c.json({ message: "The book does not exist" }, 404);
    }
    return c.json({ bookUpdated });
  } catch (error) {
    return c.json({ error }, 404);
  }
}

export async function deleteBook(c: Context) {
  const id = Number(c.req.param("id"));
  //Book deleted succesfully
  try {
    const delatedBook = await deleteService(id);
    if (deleteBook === null) {
      return c.json({ error: "Server error, unable to delete book" }, 500);
    }
    if (delatedBook?.length === 0) {
      return c.json({ message: "Book does not exist" }, 404);
    } else {
      return c.json({ message: "Book deleted successfully" });
    }
  } catch (error) {
    return c.json({ error }, 404);
  }
}
