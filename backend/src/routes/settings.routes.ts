import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

export const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.put("/", updateSettings);
settingsRouter.patch("/", updateSettings);
