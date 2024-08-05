import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import "dotenv/config";

export async function authorize(c: Context, next: Next) {
  const token = c.req.header("Authorization");

  if (!token) {
    return c.json({ message: "You're not authorized" }, 404);
  }
  try {
    jwt.verify(token, process.env.SECRET as string);
    await next();
  } catch (error) {
    return c.json({ message: "Invalid token" }, 404);
  }
}
