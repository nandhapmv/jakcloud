import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { menuRouter } from "./menu.routes.js";
import { orderRouter } from "./order.routes.js";
import { contactRouter } from "./contact.routes.js";
import { authRouter } from "./auth.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/contact", contactRouter);
