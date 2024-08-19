import { Hono } from "hono";
import {
  registerUser,
  confirmUserRegister,
  loginUser,
  resetNewPassword,
  provideEmail,
} from "./auth.contoller";

export const authRoutes = new Hono();

authRoutes.post("/register", registerUser);

authRoutes.post("/confirmation", confirmUserRegister);

authRoutes.post("/reset-password", provideEmail);
authRoutes.put("/new-password", resetNewPassword);

authRoutes.post("/login", loginUser);
