import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userName: varchar("username", { length: 256 }),
  email: text("email"),
  password: text("password"),
});

// export const userRelations = relations(users, ({ many }) => ({
//   books: many(books),
// }));

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  // user_id: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 256 }),
  author: varchar("author", { length: 256 }),
  year: integer("year"),
});

// export const bookRelations = relations(books, ({ one }) => ({
//   users: one(users, {
//     fields: [books.userId],
//     references: [users.id],
//   }),
// }));

export type TSUser = typeof users.$inferSelect;
export type TIUser = typeof users.$inferInsert;

export type TSBook = typeof books.$inferSelect;
export type TIBook = typeof books.$inferInsert;
