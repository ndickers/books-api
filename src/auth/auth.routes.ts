import { Hono } from "hono";
import { registerUser, confirmUserRegister, loginUser } from "./auth.contoller";

export const authRoutes = new Hono();

authRoutes.post("/register", registerUser);

authRoutes.get("/confirmation", confirmUserRegister);

authRoutes.post("/login", loginUser);
