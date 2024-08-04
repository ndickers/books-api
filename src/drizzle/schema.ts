import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userName: varchar("username", { length: 256 }).notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ many, one }) => ({
  books: many(books),
  auth: one(auth, {
    fields: [users.id],
    references: [auth.userId],
  }),
}));

export const auth = pgTable("authentication", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  password: varchar("password").notNull(),
});
export const authRelations = relations(auth, ({ one }) => ({
  users: one(users, {
    fields: [auth.userId],
    references: [users.id],
  }),
}));

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  author: varchar("author", { length: 256 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const booksRelations = relations(books, ({ one }) => ({
  users: one(users, {
    fields: [books.user_id],
    references: [users.id],
  }),
}));

export type TSUser = typeof users.$inferSelect;
export type TIUser = typeof users.$inferInsert;

export type TSAuth = typeof auth.$inferSelect;
export type TIAuth = typeof auth.$inferInsert;

export type TSBook = typeof books.$inferSelect;
export type TIBook = typeof books.$inferInsert;
