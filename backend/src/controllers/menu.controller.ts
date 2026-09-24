import { Request, Response } from "express";
import { MENU_ITEMS, CATEGORIES } from "../models/menu.model.js";
import { config } from "../config/index.js";

export function getMenu(_req: Request, res: Response) {
  res.json({
    business: {
      name: config.business.name,
      phone: config.business.phone,
      email: config.business.email,
      address: config.business.address,
      cutoffHour: config.business.cutoffHour,
      deliveryFee: config.business.deliveryFee,
      alooCharge: config.business.alooCharge,
    },
    categories: CATEGORIES,
    items: MENU_ITEMS,
  });
}

export function getMenuItem(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const item = MENU_ITEMS.find((m) => m.id === id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  return res.json(item);
}
