import { Router } from "express";
import {
  getMenu,
  getMenuItem,
  updateMenuItem,
  createMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";

export const menuRouter = Router();

menuRouter.get("/", getMenu);
menuRouter.get("/:id", getMenuItem);
menuRouter.put("/:id", updateMenuItem);
menuRouter.post("/", createMenuItem);
menuRouter.delete("/:id", deleteMenuItem);
