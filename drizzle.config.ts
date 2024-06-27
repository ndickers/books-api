import { defineConfig } from "drizzle-kit";
import "dotenv/config";
export default defineConfig({
  dialect: "postgresql", // "mysql" | "sqlite" | "postgresql"
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migration",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
