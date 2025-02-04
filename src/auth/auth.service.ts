import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { auth, TIAuth, TIUser, users } from "../drizzle/schema";

export async function getOneUser(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      createdAt: false,
      updatedAt: false,
    },
  });
}
export async function getUserPass(id: number) {
  return await db.query.auth.findFirst({
    where: eq(auth.userId, id),
    columns: {
      password: true,
    },
  });
}

export async function updatePass(
  pass: string,
  userId: number
): Promise<{ id: number }[] | null> {
  return await db
    .update(auth)
    .set({ password: pass })
    .where(eq(auth.userId, userId))
    .returning({ id: auth.id });
}

export async function createUser(details: TIUser) {
  return await db
    .insert(users)
    .values(details)
    .returning({ id: users.id, email: users.email, username: users.userName });
}

export async function createUserAuth(credentials: TIAuth) {
  return await db
    .insert(auth)
    .values(credentials)
    .returning({ password: auth.password });
}

export async function removeUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}
