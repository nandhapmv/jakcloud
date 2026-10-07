import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

export const customerRouter = Router();

customerRouter.get("/", getCustomers);
customerRouter.post("/", createCustomer);
customerRouter.put("/:id", updateCustomer);
customerRouter.patch("/:id", updateCustomer);
customerRouter.delete("/:id", deleteCustomer);
