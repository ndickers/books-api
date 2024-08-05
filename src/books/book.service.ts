import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { books, TSBook, TIBook } from "../drizzle/schema";

export async function serveUsersBook(id: number): Promise<TSBook[] | null> {
  return await db.query.books.findMany({
    where: eq(books.user_id, id),
  });
}

export async function addBookToDB(
  book: TIBook
): Promise<{ id: number }[] | null> {
  return await db.insert(books).values(book).returning({
    id: books.id,
  });
}

export async function updateService(
  id: number,
  book: TIBook
): Promise<{ id: number }[] | null> {
  return await db.update(books).set(book).where(eq(books.id, id)).returning({
    id: books.id,
  });
}

export async function deleteService(
  id: number
): Promise<{ id: number }[] | null> {
  return await db
    .delete(books)
    .where(eq(books.id, id))
    .returning({ id: books.id });
}
