import {
  getAllBooks,
  getOneBook,
  addBookToDB,
  updateService,
  deleteService,
} from "./book.service";
import { TSBook, TIBook } from "../drizzle/schema";
import { Context } from "hono";
export async function getBooks(c: Context) {
  try {
    const books: TSBook[] | null = await getAllBooks();
    if (books === null) {
      return c.json({ message: "Service cannot be reached" }, 404);
    }
    if (books?.length === 0) {
      return c.json({ message: "There is no book currently" });
    }
    return c.json({ data: books });
  } catch (error) {
    return c.json({ error }, 404);
  }
}

export async function getBook(c: Context) {
  const id: number = Number(c.req.param("id"));
  const book: TSBook[] | null = await getOneBook(id);
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
  const bookDetails: TIBook = await c.req.json();
  const addedBook = await addBookToDB(bookDetails);
  try {
    if (addedBook?.length === 0) {
      return c.json({ message: "Book was unable to be added" }, 404);
    }
    if (addedBook === null) {
      return c.json({ error: "Server error" }, 404);
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
      return c.json(
        { message: "You trying to update what does not exist" },
        404
      );
    }
    if (bookUpdated?.length === 0) {
      return c.json(
        { message: "You can't update book that does not exist" },
        404
      );
    }
    return c.json({ bookUpdated });
  } catch (error) {
    return c.json({ error }, 404);
  }
}

export async function deleteBook(c: Context) {
  const id = Number(c.req.param("id"));
  const delatedBook = await deleteService(id);
  try {
    if (delatedBook.rowCount === 1) {
      return c.json({ message: "Book deleted succesfully" });
    } else if (delatedBook.rowCount === 0) {
      return c.json({ message: "Book does not exist" }, 404);
    }
  } catch (error) {
    return c.json({ error }, 404);
  }
}
