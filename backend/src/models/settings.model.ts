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
  salesTaxRate: config.business.taxRate || 0.086,
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

export async function saveKitchenSettings(updates: Partial<KitchenSettings>): Promise<KitchenSettings> {
  activeSettings = { ...activeSettings, ...updates };

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
      for (const [key, val] of Object.entries(updates)) {
        await pool.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
          [key, typeof val === "object" ? JSON.stringify(val) : String(val)],
        );
      }
    } catch (err: any) {
      console.warn("MySQL settings save warning:", err.message);
    }
  }

  return activeSettings;
}
