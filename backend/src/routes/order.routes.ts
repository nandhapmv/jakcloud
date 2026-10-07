import { Router } from "express";
import {
  createOrder,
  getOrder,
  getOrders,
  updateStatus,
  updateOrder,
  deleteOrder,
  getStats,
} from "../controllers/order.controller.js";
import { validateBody, createOrderSchema } from "../middleware/validate.middleware.js";

export const orderRouter = Router();

orderRouter.post("/", validateBody(createOrderSchema), createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/stats", getStats);
orderRouter.get("/:id", getOrder);
orderRouter.patch("/:id/status", updateStatus);
orderRouter.patch("/:id", updateOrder);
orderRouter.put("/:id", updateOrder);
orderRouter.delete("/:id", deleteOrder);
