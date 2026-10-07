import { Request, Response } from "express";
import { getKitchenSettings, saveKitchenSettings } from "../models/settings.model.js";

export function getSettings(_req: Request, res: Response) {
  const settings = getKitchenSettings();
  return res.json(settings);
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const updated = await saveKitchenSettings(req.body);
    return res.json({ message: "Kitchen settings updated successfully.", settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update settings." });
  }
}
