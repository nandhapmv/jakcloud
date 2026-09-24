import { Router } from "express";
import { loginAdmin, getCurrentUser } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginAdmin);
authRouter.get("/me", getCurrentUser);
