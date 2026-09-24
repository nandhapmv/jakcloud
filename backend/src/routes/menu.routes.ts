import { Router } from "express";
import { getMenu, getMenuItem } from "../controllers/menu.controller.js";

export const menuRouter = Router();

menuRouter.get("/", getMenu);
menuRouter.get("/:id", getMenuItem);
