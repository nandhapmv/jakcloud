import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import { getPool, isDatabaseConnected } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export interface KitchenSettings {
  dailyTrayLimit: number;
  orderCutoffHour: number;
  bookingHorizonDays: number;
  isKitchenOpen: boolean;
  emergencyPauseReason?: string;
  closedWeekdays: number[];
  deliveryFee: number;
  freeDeliveryTrayThreshold: number;
  alooCharge: number;
  deliveryRadiusMiles: number;
  heroAnnouncement: string;
  announcementActive: boolean;
  salesTaxRate: number;
  dateLimits?: Record<string, number>;
  blockedDates?: string[];
}

const DEFAULT_SETTINGS: KitchenSettings = {
  dailyTrayLimit: 25,
  orderCutoffHour: config.business.cutoffHour || 15,
  bookingHorizonDays: 7,
  isKitchenOpen: true,
  emergencyPauseReason: "",
  closedWeekdays: [3], // Wednesday
  deliveryFee: config.business.deliveryFee || 10.0,
  freeDeliveryTrayThreshold: 3,
  alooCharge: config.business.alooCharge || 7.0,
  deliveryRadiusMiles: 10,
  heroAnnouncement: "Artisanal Dum Biryani slow-cooked in sealed clay handis. Limited to 25 trays daily.",
  announcementActive: true,
  salesTaxRate: 0,
  dateLimits: {},
  blockedDates: [],
};

let activeSettings: KitchenSettings = loadSettingsFromFile();

function loadSettingsFromFile(): KitchenSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn("Could not read settings from file:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

export function getKitchenSettings(): KitchenSettings {
  return activeSettings;
}

export async function syncSettingsFromDatabase(): Promise<KitchenSettings> {
  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      const [rows] = (await pool.query("SELECT setting_key, setting_value FROM settings")) as any;
      if (Array.isArray(rows) && rows.length > 0) {
        const dbUpdates: Partial<KitchenSettings> = {};
        for (const row of rows) {
          const key = row.setting_key;
          const val = row.setting_value;
          if (key === "dailyTrayLimit" || key === "maxDailyTrays") {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) dbUpdates.dailyTrayLimit = num;
          } else if (key === "orderCutoffHour") {
            const num = parseInt(val, 10);
            if (!isNaN(num)) dbUpdates.orderCutoffHour = num;
          } else if (key === "bookingHorizonDays") {
            const num = parseInt(val, 10);
            if (!isNaN(num)) dbUpdates.bookingHorizonDays = num;
          } else if (key === "isKitchenOpen") {
            dbUpdates.isKitchenOpen = val === "true" || val === "1";
          } else if (key === "deliveryFee") {
            const num = parseFloat(val);
            if (!isNaN(num)) dbUpdates.deliveryFee = num;
          } else if (key === "alooCharge") {
            const num = parseFloat(val);
            if (!isNaN(num)) dbUpdates.alooCharge = num;
          } else if (key === "salesTaxRate") {
            const num = parseFloat(val);
            if (!isNaN(num)) dbUpdates.salesTaxRate = num;
          } else if (key === "heroAnnouncement") {
            dbUpdates.heroAnnouncement = val;
          } else if (key === "emergencyPauseReason") {
            dbUpdates.emergencyPauseReason = val;
          } else if (key === "blockedDates") {
            try {
              const parsed = typeof val === "string" ? JSON.parse(val) : val;
              if (Array.isArray(parsed)) dbUpdates.blockedDates = parsed;
            } catch {}
          }
        }
        activeSettings = { ...activeSettings, ...dbUpdates };
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          fs.writeFileSync(SETTINGS_FILE, JSON.stringify(activeSettings, null, 2), "utf-8");
        } catch {}
      }
    } catch (err: any) {
      console.warn("Could not sync settings from MySQL:", err.message);
    }
  }
  return activeSettings;
}

export async function saveKitchenSettings(updates: Partial<KitchenSettings>): Promise<KitchenSettings> {
  const sanitizedUpdates: Partial<KitchenSettings> = { ...updates };
  if (sanitizedUpdates.dailyTrayLimit !== undefined) {
    const num = Number(sanitizedUpdates.dailyTrayLimit);
    if (!isNaN(num) && num > 0) sanitizedUpdates.dailyTrayLimit = num;
  }
  if (sanitizedUpdates.orderCutoffHour !== undefined) {
    sanitizedUpdates.orderCutoffHour = Number(sanitizedUpdates.orderCutoffHour);
  }
  if (sanitizedUpdates.bookingHorizonDays !== undefined) {
    sanitizedUpdates.bookingHorizonDays = Number(sanitizedUpdates.bookingHorizonDays);
  }
  if (sanitizedUpdates.deliveryFee !== undefined) {
    const fee = Number(sanitizedUpdates.deliveryFee);
    if (!isNaN(fee) && fee >= 0) {
      sanitizedUpdates.deliveryFee = fee;
    }
  }

  activeSettings = { ...activeSettings, ...sanitizedUpdates };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(activeSettings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write settings to file:", err);
  }

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      for (const [key, val] of Object.entries(sanitizedUpdates)) {
        await pool.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
          [key, typeof val === "object" ? JSON.stringify(val) : String(val)],
        );
      }

      // Sync maxDailyTrays and daily_control table for compatibility
      if (sanitizedUpdates.dailyTrayLimit !== undefined) {
        await pool.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES ('maxDailyTrays', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
          [String(sanitizedUpdates.dailyTrayLimit)],
        );
        await pool.query(
          "INSERT INTO daily_control (control_date, max_capacity, is_closed) VALUES (CURDATE(), ?, ?) ON DUPLICATE KEY UPDATE max_capacity = VALUES(max_capacity)",
          [sanitizedUpdates.dailyTrayLimit, activeSettings.isKitchenOpen ? 0 : 1],
        );
      }
    } catch (err: any) {
      console.warn("MySQL settings save warning:", err.message);
    }
  }

  return activeSettings;
}
