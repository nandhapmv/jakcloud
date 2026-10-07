import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MENU_ITEMS, CATEGORIES, type MenuItem } from "../models/menu.model.js";
import { config } from "../config/index.js";
import { getPool, isDatabaseConnected } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "menu.json");

// In-memory cache for live menu items
let activeMenuItems: MenuItem[] = loadInitialMenu();

function loadInitialMenu(): MenuItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read menu data file, falling back to default:", err);
  }
  return [...MENU_ITEMS];
}

async function persistMenuItems(items: MenuItem[]): Promise<void> {
  activeMenuItems = items;

  // 1. Persist to JSON file
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write menu items to file:", err);
  }

  // 2. Persist to MySQL if connected
  if (isDatabaseConnected()) {
    const pool = getPool();
    if (pool) {
      try {
        for (const it of items) {
          const proteinId = (it as any).proteinId || it.id;
          const itemId = (it as any).dishId || (it as any).id || `dish-${proteinId}`;
          const badge = (it as any).badge || it.note || "";
          const imgUrl = (it as any).image || "";
          const available = (it as any).available !== false ? 1 : 0;

          await pool.query(
            `INSERT INTO menu_items (id, protein_id, name, category, price, price_with_aloo, badge, description, kcal, kcal_aloo, available, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               name = VALUES(name),
               category = VALUES(category),
               price = VALUES(price),
               price_with_aloo = VALUES(price_with_aloo),
               badge = VALUES(badge),
               description = VALUES(description),
               kcal = VALUES(kcal),
               kcal_aloo = VALUES(kcal_aloo),
               available = VALUES(available),
               image_url = VALUES(image_url)`,
            [
              itemId,
              proteinId,
              it.name,
              it.category || "Signature Trays",
              it.price,
              it.priceWithAloo ?? it.price,
              badge,
              it.description || "",
              it.kcal || 0,
              it.kcalAloo || 0,
              available,
              imgUrl,
            ],
          );
        }
      } catch (dbErr) {
        console.warn("MySQL menu update warning:", dbErr);
      }
    }
  }
}

export async function getMenu(_req: Request, res: Response) {
  // If MySQL is active, attempt to read fresh data
  if (isDatabaseConnected()) {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query("SELECT * FROM menu_items ORDER BY id ASC");
        if (Array.isArray(rows) && rows.length > 0) {
          const dbItems = rows.map((r: any) => ({
            id: r.protein_id || r.id,
            dishId: r.id,
            proteinId: r.protein_id,
            name: r.name,
            category: r.category,
            price: Number(r.price),
            priceWithAloo: Number(r.price_with_aloo),
            note: r.badge || "",
            badge: r.badge || "",
            description: r.description || "",
            kcal: Number(r.kcal) || 0,
            kcalAloo: Number(r.kcal_aloo) || 0,
            available: Boolean(r.available),
            image: r.image_url || "",
          }));
          activeMenuItems = dbItems as any;
        }
      } catch (err) {
        console.warn("Could not query menu_items from DB, using cache:", err);
      }
    }
  }

  return res.json({
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
    items: activeMenuItems,
  });
}

export function getMenuItem(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const item = activeMenuItems.find(
    (m) =>
      m.id === id ||
      (m as any).proteinId === id ||
      (m as any).dishId === id,
  );
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  return res.json(item);
}

export async function updateMenuItem(req: Request, res: Response) {
  const idParam = req.params.id;
  const targetId = Array.isArray(idParam) ? idParam[0] : idParam;
  const updates = req.body;

  let foundIndex = activeMenuItems.findIndex(
    (m) =>
      m.id === targetId ||
      (m as any).proteinId === targetId ||
      (m as any).dishId === targetId ||
      m.name.toLowerCase() === (updates.name || "").toLowerCase(),
  );

  let updatedItem: any;

  if (foundIndex >= 0) {
    updatedItem = {
      ...activeMenuItems[foundIndex],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : activeMenuItems[foundIndex].price,
      priceWithAloo:
        updates.priceWithAloo !== undefined
          ? Number(updates.priceWithAloo)
          : (activeMenuItems[foundIndex].priceWithAloo ?? activeMenuItems[foundIndex].price),
      kcal: updates.kcal !== undefined ? Number(updates.kcal) : activeMenuItems[foundIndex].kcal,
      kcalAloo: updates.kcalAloo !== undefined ? Number(updates.kcalAloo) : activeMenuItems[foundIndex].kcalAloo,
    };
    activeMenuItems[foundIndex] = updatedItem;
  } else {
    // If not found, create new item entry
    const genProteinId = updates.proteinId || targetId.replace(/^dish-/, "");
    updatedItem = {
      id: genProteinId,
      dishId: targetId,
      proteinId: genProteinId,
      name: updates.name || "Special Dum Biryani",
      category: updates.category || "Signature Trays",
      price: Number(updates.price) || 99.99,
      priceWithAloo: Number(updates.priceWithAloo) || Number(updates.price) || 106.99,
      note: updates.badge || "Handi Dum",
      badge: updates.badge || "",
      description: updates.description || "",
      kcal: Number(updates.kcal) || 1700,
      kcalAloo: Number(updates.kcalAloo) || 1850,
      available: updates.available !== false,
      image: updates.image || "",
    };
    activeMenuItems.push(updatedItem);
  }

  await persistMenuItems(activeMenuItems);

  return res.json({
    success: true,
    message: `Menu item "${updatedItem.name}" updated successfully.`,
    item: updatedItem,
  });
}

export async function createMenuItem(req: Request, res: Response) {
  const payload = req.body;
  const proteinId = payload.proteinId || payload.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || `dish-${Date.now()}`;
  const newItem: any = {
    id: proteinId,
    dishId: `dish-${Date.now()}`,
    proteinId,
    name: payload.name || "Handcrafted Dum Biryani",
    category: payload.category || "Signature Trays",
    price: Number(payload.price) || 99.99,
    priceWithAloo: Number(payload.priceWithAloo) || Number(payload.price) || 106.99,
    note: payload.badge || "Handi Dum",
    badge: payload.badge || "",
    description: payload.description || "",
    kcal: Number(payload.kcal) || 1700,
    kcalAloo: Number(payload.kcalAloo) || 1850,
    available: payload.available !== false,
    image: payload.image || "",
  };

  activeMenuItems.push(newItem);
  await persistMenuItems(activeMenuItems);

  return res.status(201).json({
    success: true,
    message: `Menu item "${newItem.name}" created successfully.`,
    item: newItem,
  });
}

export async function deleteMenuItem(req: Request, res: Response) {
  const idParam = req.params.id;
  const targetId = Array.isArray(idParam) ? idParam[0] : idParam;

  const initialLen = activeMenuItems.length;
  activeMenuItems = activeMenuItems.filter(
    (m) =>
      m.id !== targetId &&
      (m as any).proteinId !== targetId &&
      (m as any).dishId !== targetId,
  );

  if (activeMenuItems.length !== initialLen) {
    await persistMenuItems(activeMenuItems);
    return res.json({ success: true, message: "Item deleted successfully." });
  }

  return res.status(404).json({ error: "Item not found" });
}
