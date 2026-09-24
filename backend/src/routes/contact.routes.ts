import { Router } from "express";
import { handleContactMessage, getContactMessages } from "../controllers/contact.controller.js";
import { validateBody, contactSchema } from "../middleware/validate.middleware.js";

export const contactRouter = Router();

contactRouter.post("/", validateBody(contactSchema), handleContactMessage);
contactRouter.get("/", getContactMessages);
