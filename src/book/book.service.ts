import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { books, TSBook, TIBook } from "../drizzle/schema";

export async function getAllBooks(): Promise<TSBook[] | null> {
  return await db.query.books.findMany();
}

export async function getOneBook(id: number): Promise<TSBook[] | null> {
  return await db.query.books.findMany({
    where: eq(books.id, id),
  });
}

export async function addBookToDB(book: TIBook) {
  return await db.insert(books).values(book).returning({
    id: books.id,
    title: books.title,
    author: books.author,
    year: books.year,
  });
}

export async function updateService(
  id: number,
  book: TIBook
): Promise<TSBook[] | null> {
  return await db
    .update(books)
    .set(book)
    .where(eq(books.id, id))
    .returning({
      id: books.id,
      title: books.title,
      author: books.author,
      year: books.year,
    });
}

export async function deleteService(id: number) {
  return await db.delete(books).where(eq(books.id, id));
}
