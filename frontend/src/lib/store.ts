import { useEffect, useState, useCallback } from "react";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import heroBiryaniImg from "@/assets/hero-biryani.jpg";
import { BUSINESS } from "./menu";

// ==========================================
// 1. DATA TYPES & INTERFACES
// ==========================================

export type ProteinId = "chicken" | "mutton" | "beef" | "pork" | "paneer" | "prawn" | string;

export interface DynamicMenuItem {
  id: string;
  proteinId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  priceWithAloo: number;
  image: string;
  available: boolean;
  traySize: string;
  serves?: string;
  meatWeight: string;
  riceWeight: string;
  kcal: number;
  kcalAloo?: number;
  badge?: string;
  spiciness: "Mild" | "Medium" | "Extra Spicy";
  dailyLimit: number;
  traysSoldWeek: number;
  isHalalCertified?: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "dum_cooking"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItemDetail {
  proteinId: string;
  name: string;
  aloo: boolean;
  extraSpicy: boolean;
  notes?: string | undefined;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string | undefined;
  city?: string | undefined;
  zipCode?: string | undefined;
  deliveryInstructions?: string | undefined;
}

export interface DynamicOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfilmentType: "pickup" | "delivery";
  fulfilmentDate: string;
  fulfilmentTime: string;
  customer: CustomerInfo;
  items: OrderItemDetail[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "Cash on Pickup" | "Cash on Delivery" | "Instant UPI QR" | "Razorpay / Card Gateway" | "WhatsApp Direct Order" | "Credit Card" | "Staff Direct";
  paymentStatus: "Paid Online" | "Cash on Delivery" | "Cash on Pickup" | "Pending Payment";
  specialInstructions?: string;
  staffNotes?: string;
  assignedDriver?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenSettings {
  dailyTrayLimit: number;
  orderCutoffHour: number; // e.g. 15 for 3:00 PM
  orderCutoffTime?: string; // e.g. "14:00" or "15:00"
  strictCutoffEnforced?: boolean;
  bookingHorizonDays: number; // 7 (1 week), 10, or 30 (1 month)
  isKitchenOpen: boolean;
  emergencyPauseReason?: string;
  closedWeekdays: number[]; // e.g. [3] for Wednesday
  deliveryFee: number;
  freeDeliveryTrayThreshold: number;
  alooCharge: number;
  deliveryRadiusMiles: number;
  heroAnnouncement: string;
  announcementActive: boolean;
  salesTaxRate: number;
  dateLimits?: Record<string, number> | undefined;
}

export interface ProteinMatrixItem {
  id: string;
  name: string;
  cutType: string;
  halalCertified: boolean;
  inStock: boolean;
  supplier: string;
  storageTemp: string;
  separateCookingVessel: boolean;
  notes: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  vipTier: "Standard" | "Royal Patron" | "Spice King VIP" | "Black Card";
  lastOrderDate: string;
  address?: string | undefined;
  staffNotes?: string | undefined;
}

// ==========================================
// 2. INITIAL SEED DATA
// ==========================================

export const INITIAL_MENU_ITEMS: DynamicMenuItem[] = [
  {
    id: "dish-chicken",
    proteinId: "chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    description:
      "Our house flagship slow-cooked Dum biryani. 1.6–1.8 kg marinated bone-in chicken thighs layered with saffron aged basmati rice, fried onions, and roasted cashews, sealed with whole wheat dough.",
    price: 101.99,
    priceWithAloo: 108.99,
    image: chickenImg,
    available: true,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.6 kg Halal Marinated Chicken",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1714,
    kcalAloo: 1871,
    badge: "Top Seller",
    spiciness: "Medium",
    dailyLimit: 12,
    traysSoldWeek: 48,
    isHalalCertified: true,
  },
  {
    id: "dish-mutton",
    proteinId: "mutton",
    name: "Hyderabadi Shahi Mutton Dum Biryani",
    category: "Royal & Occasion",
    description:
      "The authentic Nizami celebration tray. Succulent bone-in baby goat mutton cuts slow-cooked on dum for 4 hours with heavy saffron, cloves, black cardamom, and pure desi ghee.",
    price: 157.99,
    priceWithAloo: 164.99,
    image: muttonImg,
    available: true,
    traySize: "Serves 4–5 Diners (Feast Tray)",
    meatWeight: "1.8 kg Halal Baby Goat Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 2054,
    kcalAloo: 2211,
    badge: "Chef's Signature",
    spiciness: "Extra Spicy",
    dailyLimit: 8,
    traysSoldWeek: 34,
    isHalalCertified: true,
  },
  {
    id: "dish-beef",
    proteinId: "beef",
    name: "Slow-Braised Spiced Beef Dum Biryani",
    category: "Signature Trays",
    description:
      "Prime tender beef cuts slow-cooked long and low until caramelized spiced juices settle deeply through every single fragrant basmati grain.",
    price: 122.99,
    priceWithAloo: 129.99,
    image: dumHandiImg,
    available: true,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.7 kg Halal Prime Beef Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1952,
    kcalAloo: 2109,
    badge: "Bold & Hearty",
    spiciness: "Medium",
    dailyLimit: 8,
    traysSoldWeek: 28,
    isHalalCertified: true,
  },
  {
    id: "dish-paneer",
    proteinId: "paneer",
    name: "Royal Shahi Paneer Dum Biryani (Veg)",
    category: "Shahi Vegetarian",
    description:
      "Fresh golden paneer cubes slow-simmered with aromatic saffron gravy, baby potatoes, roasted cashews, caramelized crispy onions, and fresh mint leaves.",
    price: 98.99,
    priceWithAloo: 105.99,
    image: paneerImg,
    available: true,
    traySize: "Serves 4–5 Diners (Veg Handi)",
    meatWeight: "1.2 kg Fresh Artisanal Paneer",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1540,
    kcalAloo: 1697,
    badge: "Vegetarian Royal",
    spiciness: "Medium",
    dailyLimit: 6,
    traysSoldWeek: 21,
    isHalalCertified: false,
  },
  {
    id: "dish-prawn",
    proteinId: "prawn",
    name: "Jumbo King Tiger Prawn Dum Biryani",
    category: "Seafood Specialties",
    description:
      "Wild-caught jumbo king tiger prawns seared in coastal roasted spice ghee masala, layered over aromatic yellow basmati, finished with lime zest and star anise.",
    price: 139.99,
    priceWithAloo: 146.99,
    image: prawnImg,
    available: true,
    traySize: "Serves 4–5 Diners (Deluxe Handi)",
    meatWeight: "1.5 kg Wild Tiger Prawns",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1620,
    kcalAloo: 1777,
    badge: "Coastal Specialty",
    spiciness: "Extra Spicy",
    dailyLimit: 5,
    traysSoldWeek: 16,
    isHalalCertified: true,
  },
  {
    id: "dish-pork",
    proteinId: "pork",
    name: "Springfield Signature Pork Dum Biryani",
    category: "Signature Trays",
    description:
      "Slow-cooked succulent pork shoulder prepared in dedicated segregated vessels with a deep roasted masala base, desi ghee, fresh mint, and toasted spices.",
    price: 108.99,
    priceWithAloo: 115.99,
    image: heroBiryaniImg,
    available: true,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.6 kg Pork Shoulder Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1952,
    kcalAloo: 2109,
    badge: "Segregated Kitchen Vessel",
    spiciness: "Medium",
    dailyLimit: 6,
    traysSoldWeek: 19,
    isHalalCertified: false,
  },
];

export const INITIAL_ORDERS: DynamicOrder[] = [];

export const INITIAL_KITCHEN_SETTINGS: KitchenSettings = {
  dailyTrayLimit: 25, // Default 10 orders per day
  orderCutoffHour: 15, // 3:00 PM (15:00) cutoff
  orderCutoffTime: "15:00",
  strictCutoffEnforced: true,
  bookingHorizonDays: 7, // 7 days (1 week) default horizon
  isKitchenOpen: true,
  emergencyPauseReason: "",
  closedWeekdays: [], // Open 7 days a week
  deliveryFee: 10,
  freeDeliveryTrayThreshold: 5,
  alooCharge: 7, // Free aloo ($0)
  deliveryRadiusMiles: 10,
  heroAnnouncement: "🔥 Made-to-Order Authentic Hyderabadi Dum Biryani · 10 Handi Trays Daily Limit · Order by 3:00 PM",
  announcementActive: true,
  salesTaxRate: 0,
};

export const INITIAL_PROTEINS: ProteinMatrixItem[] = [
  {
    id: "prot_chicken",
    name: "Chicken (100% Zabiha Halal)",
    cutType: "Bone-in Whole Thigh & Leg Quarters (1.6–1.8kg)",
    halalCertified: true,
    inStock: true,
    supplier: "Midwest Halal Poultry Farms, MO",
    storageTemp: "34°F (0–2°C) Chilled",
    separateCookingVessel: false,
    notes: "Fresh daily batch marinated in fresh curd, ginger-garlic and green cardamom.",
  },
  {
    id: "prot_mutton",
    name: "Baby Goat Mutton (100% Zabiha Halal)",
    cutType: "Tender Shoulder & Rib Cuts (1.8kg)",
    halalCertified: true,
    inStock: true,
    supplier: "Ozarks Halal Meats, MO",
    storageTemp: "33°F (-0.5°C) Chilled",
    separateCookingVessel: false,
    notes: "Aged young goat cuts braised in pure desi ghee and saffron.",
  },
  {
    id: "prot_beef",
    name: "Prime Beef (100% Zabiha Halal)",
    cutType: "Boneless Prime Chuck & Shank (1.7kg)",
    halalCertified: true,
    inStock: true,
    supplier: "Missouri Grass-Fed Halal Cattle Co.",
    storageTemp: "34°F (1°C) Chilled",
    separateCookingVessel: false,
    notes: "Slow braised for maximum juice extraction into rice grains.",
  },
  {
    id: "prot_paneer",
    name: "Royal Artisanal Paneer (Vegetarian)",
    cutType: "Fresh Malai Pressed Cubes (1.2kg)",
    halalCertified: false,
    inStock: true,
    supplier: "Heritage Dairy Co-op, Springfield",
    storageTemp: "36°F (2°C) Refrigerated",
    separateCookingVessel: true,
    notes: "Strictly prepared in dedicated 100% vegetarian copper handis.",
  },
  {
    id: "prot_prawn",
    name: "Jumbo King Tiger Prawns",
    cutType: "Wild-Caught Cleaned & Deveined (1.5kg)",
    halalCertified: true,
    inStock: true,
    supplier: "Gulf Coast Seafood Reserve",
    storageTemp: "-4°F (-20°C) Flash Deep Frozen",
    separateCookingVessel: true,
    notes: "Quick roasted in coastal spice blend before gentle dum steam.",
  },
  {
    id: "prot_pork",
    name: "Ozarks Shoulder Pork",
    cutType: "Smoked Shoulder Cuts (1.6kg)",
    halalCertified: false,
    inStock: true,
    supplier: "Ozarks Family Farm",
    storageTemp: "34°F (1°C) Chilled",
    separateCookingVessel: true,
    notes: "Cooked exclusively in isolated segregated prep kitchen with dedicated cookware.",
  },
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [];

// ==========================================
// 3. REACTIVE STORAGE LAYER
// ==========================================

const KEYS = {
  MENU: "jakloud_menu_v2",
  ORDERS: "jakloud_orders_v2",
  SETTINGS: "jakloud_settings_v2",
  PROTEINS: "jakloud_proteins_v2",
  CUSTOMERS: "jakloud_customers_v2",
};

const EVENT_NAME = "jakloud_store_sync";

function notifySync(key: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
  }
}

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const parsed = JSON.parse(raw) as T;
    // Automatically purge old mock orders
    if (key === KEYS.ORDERS && Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (o: any) =>
          o.id &&
          !o.id.startsWith("ord_10") &&
          !o.id.startsWith("ord_demo") &&
          o.customer?.name !== "Dr. Bradley Hayes" &&
          o.customer?.name !== "Marcus Vance" &&
          o.customer?.name !== "Sophia Martinez" &&
          o.customer?.name !== "Chef Reception Sample"
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        return filtered as unknown as T;
      }
    }
    // Automatically purge old mock customers
    if (key === KEYS.CUSTOMERS && Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (c: any) =>
          c.id &&
          c.id !== "cust_1" &&
          c.id !== "cust_2" &&
          c.id !== "cust_3" &&
          c.name !== "Dr. Bradley Hayes" &&
          c.name !== "Marcus Vance" &&
          c.name !== "Sophia Martinez" &&
          c.name !== "Rajesh & Priya Sharma"
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        return filtered as unknown as T;
      }
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySync(key);
  } catch (err) {
    console.error(`Failed to store key ${key}`, err);
  }
}

// ==========================================
// 4. CORE STORE OBJECT (CRUD API)
// ==========================================

const API_BASE_URL = typeof window !== "undefined"
  ? ((import.meta.env["VITE_API_URL"] as string | undefined) || "")
  : "http://localhost:5000";

function syncBackendMenuItem(id: string, updates: any) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn("Backend sync failed:", e));
}

function syncBackendCreateMenuItem(item: any) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  }).catch((e) => console.warn("Backend sync failed:", e));
}

function syncBackendDeleteMenuItem(id: string) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/menu/${id}`, {
    method: "DELETE",
  }).catch((e) => console.warn("Backend sync failed:", e));
}

function syncBackendCreateOrder(order: any) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: order.items,
      fulfilmentType: order.fulfilmentType,
      fulfilmentDate: order.fulfilmentDate,
      fulfilmentTime: order.fulfilmentTime,
      customer: order.customer,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      specialInstructions: order.specialInstructions,
    }),
  }).catch((e) => console.warn("Backend sync create order failed:", e));
}

function syncBackendUpdateOrderStatus(id: string, status: string) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).catch((e) => console.warn("Backend sync update order status failed:", e));
}

function syncBackendUpdateOrder(id: string, updates: any) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn("Backend sync update order failed:", e));
}

function syncBackendDeleteOrder(id: string) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).catch((e) => console.warn("Backend sync delete order failed:", e));
}

function syncBackendSettings(updates: any) {
  if (typeof window === "undefined") return;
  fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).catch((e) => console.warn("Backend sync settings failed:", e));
}

export function normalizeDateKey(input: string | Date | undefined | null): string {
  if (!input) return "";
  if (input instanceof Date && !isNaN(input.getTime())) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(input).trim();
  if (!str) return "";

  // 1. Direct match for standard YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  // 2. Relative keywords: "today" / "tomorrow"
  const lower = str.toLowerCase();
  const now = new Date();
  if (lower === "today" || lower.startsWith("today")) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (lower === "tomorrow" || lower.startsWith("tomorrow")) {
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    const y = tmrw.getFullYear();
    const m = String(tmrw.getMonth() + 1).padStart(2, "0");
    const d = String(tmrw.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // 3. Match month name and day, e.g. "Thursday, October 15", "October 15", "Oct 15, 2026"
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const textMatch = str.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:[,\s]+(\d{4}))?/i);
  if (textMatch && textMatch[1] && textMatch[2]) {
    const mPrefix = textMatch[1].slice(0, 3).toLowerCase();
    const mIdx = monthNames.indexOf(mPrefix);
    if (mIdx !== -1) {
      let year = textMatch[3] ? parseInt(textMatch[3], 10) : now.getFullYear();
      if (!textMatch[3] && mIdx < now.getMonth() - 6) {
        year += 1;
      }
      const month = String(mIdx + 1).padStart(2, "0");
      const day = String(parseInt(textMatch[2], 10)).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  // 4. Fallback try Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return lower;
}

export const jakloudStore = {
  async syncWithBackend(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const [ordersRes, settingsRes, customersRes, menuRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/api/settings`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/api/customers`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/api/menu`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (menuRes && Array.isArray(menuRes.items) && menuRes.items.length > 0) {
        this.saveMenu(menuRes.items);
      }
      if (ordersRes && Array.isArray(ordersRes.orders)) {
        this.saveOrders(ordersRes.orders);
      }
      if (settingsRes) {
        this.saveSettings(settingsRes);
      }
      if (customersRes && Array.isArray(customersRes.customers)) {
        this.saveCustomers(customersRes.customers);
      }
    } catch (err) {
      console.warn("Backend store sync error:", err);
    }
  },

  // MENU OPERATIONS
  getMenu(): DynamicMenuItem[] {
    return getStored<DynamicMenuItem[]>(KEYS.MENU, INITIAL_MENU_ITEMS);
  },

  saveMenu(items: DynamicMenuItem[]) {
    setStored(KEYS.MENU, items);
  },

  addMenuItem(item: Omit<DynamicMenuItem, "id" | "traysSoldWeek">): DynamicMenuItem {
    const current = this.getMenu();
    const newItem: DynamicMenuItem = {
      ...item,
      id: `dish-${Date.now()}`,
      traysSoldWeek: 0,
    };
    this.saveMenu([newItem, ...current]);
    syncBackendCreateMenuItem(newItem);
    return newItem;
  },

  updateMenuItem(id: string, updates: Partial<DynamicMenuItem>): DynamicMenuItem | null {
    const current = this.getMenu();
    let updated: DynamicMenuItem | null = null;
    const next = current.map((it) => {
      if (it.id === id || it.proteinId === id) {
        updated = { ...it, ...updates };
        return updated;
      }
      return it;
    });
    if (updated) {
      this.saveMenu(next);
      syncBackendMenuItem(id, updates);
    }
    return updated;
  },

  deleteMenuItem(id: string): boolean {
    const current = this.getMenu();
    const next = current.filter((it) => it.id !== id && it.proteinId !== id);
    if (next.length !== current.length) {
      this.saveMenu(next);
      syncBackendDeleteMenuItem(id);
      return true;
    }
    return false;
  },

  toggleMenuItemAvailability(id: string): boolean {
    const current = this.getMenu();
    let newStatus = false;
    const next = current.map((it) => {
      if (it.id === id || it.proteinId === id) {
        newStatus = !it.available;
        return { ...it, available: newStatus };
      }
      return it;
    });
    this.saveMenu(next);
    syncBackendMenuItem(id, { available: newStatus });
    return newStatus;
  },

  // ORDER OPERATIONS
  getOrders(): DynamicOrder[] {
    return getStored<DynamicOrder[]>(KEYS.ORDERS, INITIAL_ORDERS);
  },

  saveOrders(orders: DynamicOrder[]) {
    // Deduplicate orders by id and orderNumber to eliminate any duplicate entries
    const seen = new Set<string>();
    const uniqueOrders = orders.filter((o) => {
      const key = `${o.id || ""}_${o.orderNumber || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setStored(KEYS.ORDERS, uniqueOrders);
  },

  createOrder(payload: {
    items: OrderItemDetail[];
    fulfilmentType: "pickup" | "delivery";
    fulfilmentDate: string;
    fulfilmentTime: string;
    customer: CustomerInfo;
    paymentMethod?: DynamicOrder["paymentMethod"] | undefined;
    paymentStatus?: DynamicOrder["paymentStatus"] | undefined;
    specialInstructions?: string | undefined;
  }): DynamicOrder {
    const settings = this.getSettings();
    if (!settings.isKitchenOpen) {
      throw new Error("Kitchen ordering is currently closed by the Master Chef.");
    }

    // Cutoff validation
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const cutoffHour = settings.orderCutoffHour || 15;
    let cutoffMinute = 0;
    if (settings.orderCutoffTime && settings.orderCutoffTime.includes(":")) {
      const parts = settings.orderCutoffTime.split(":");
      cutoffMinute = parseInt(parts[1] || "0", 10);
    }
    const cutoffMins = cutoffHour * 60 + cutoffMinute;
    const isPastCutoff = currentMins >= cutoffMins;

    const cutoffHour12 = cutoffHour > 12 ? cutoffHour - 12 : cutoffHour === 0 ? 12 : cutoffHour;
    const cutoffAmPm = cutoffHour >= 12 ? "PM" : "AM";
    const cutoffLabel = `${cutoffHour12}:${String(cutoffMinute).padStart(2, "0")} ${cutoffAmPm}`;

    if (isPastCutoff) {
      const fDate = (payload.fulfilmentDate || "").toLowerCase();
      const isToday = fDate.includes("today") || normalizeDateKey(payload.fulfilmentDate) === normalizeDateKey(now);
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      const isTomorrow = fDate.includes("tomorrow") || normalizeDateKey(payload.fulfilmentDate) === normalizeDateKey(tmrw);

      if (isToday || isTomorrow) {
        throw new Error(
          `Today's order cutoff time (${cutoffLabel}) has passed. Orders for this batch cannot be accepted.`
        );
      }
    }

    const totalTrays = payload.items.reduce((sum, i) => sum + (Number(i.qty) || 1), 0);
    const cap = this.getCapacityForDate(payload.fulfilmentDate);
    if (cap.isSoldOut || cap.remainingSlots <= 0) {
      throw new Error(`The kitchen is completely sold out for ${payload.fulfilmentDate}. Please select another date.`);
    }
    if (totalTrays > cap.remainingSlots) {
      throw new Error(
        `Only ${cap.remainingSlots} slot${cap.remainingSlots > 1 ? "s" : ""} left for ${payload.fulfilmentDate}. Cannot book ${totalTrays} trays.`
      );
    }

    const subtotal = payload.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const deliveryFee = payload.fulfilmentType === "delivery"
      ? (totalTrays >= settings.freeDeliveryTrayThreshold ? 0 : settings.deliveryFee)
      : 0;
    const tax = 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    const current = this.getOrders();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}${m}${d}`;
    const prefix = `JK-${dateStr}-`;

    let maxSeq = 0;
    for (const ord of current) {
      if (ord.orderNumber && ord.orderNumber.startsWith(prefix)) {
        const seqNum = parseInt(ord.orderNumber.slice(prefix.length), 10);
        if (!isNaN(seqNum) && seqNum > 0 && seqNum < 1000 && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }

    if (maxSeq === 0) {
      const todayYMD = `${y}-${m}-${d}`;
      const sameDayOrders = current.filter((o) => {
        const orderDateStr = o.createdAt ? o.createdAt.slice(0, 10) : "";
        return orderDateStr === todayYMD;
      });
      if (sameDayOrders.length > 0) {
        maxSeq = sameDayOrders.length;
      }
    }

    const nextSeq = maxSeq + 1;
    const orderNumber = `${prefix}${String(nextSeq).padStart(3, "0")}`;

    const newOrder: DynamicOrder = {
      id: orderNumber,
      orderNumber,
      status: "confirmed",
      fulfilmentType: payload.fulfilmentType,
      fulfilmentDate: payload.fulfilmentDate,
      fulfilmentTime: payload.fulfilmentTime,
      customer: payload.customer,
      items: payload.items,
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod: payload.paymentMethod || "Instant UPI QR",
      paymentStatus: payload.fulfilmentType === "pickup" ? "Cash on Pickup" : "Paid Online",
      specialInstructions: payload.specialInstructions || "",
      staffNotes: "Live order received via customer web portal.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveOrders([newOrder, ...current]);

    // Update customer CRM
    this.recordCustomerOrder(newOrder);
    syncBackendCreateOrder(newOrder);

    return newOrder;
  },

  addExistingOrder(order: DynamicOrder): void {
    const current = this.getOrders();
    const existingIndex = current.findIndex(
      (o) => (o.id && o.id === order.id) || (o.orderNumber && o.orderNumber === order.orderNumber),
    );
    if (existingIndex >= 0) {
      current[existingIndex] = order;
      this.saveOrders(current);
    } else {
      this.saveOrders([order, ...current]);
      this.recordCustomerOrder(order);
    }
  },

  updateOrderStatus(orderId: string, status: OrderStatus): DynamicOrder | null {
    const current = this.getOrders();
    let updated: DynamicOrder | null = null;
    const next = current.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updated = { ...o, status, updatedAt: new Date().toISOString() };
        return updated;
      }
      return o;
    });
    if (updated) {
      this.saveOrders(next);
      syncBackendUpdateOrderStatus(orderId, status);
    }
    return updated;
  },

  updateOrderNotes(orderId: string, staffNotes: string, assignedDriver?: string): DynamicOrder | null {
    const current = this.getOrders();
    let updated: DynamicOrder | null = null;
    const next = current.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updated = {
          ...o,
          staffNotes,
          ...(assignedDriver !== undefined ? { assignedDriver } : {}),
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return o;
    });
    if (updated) {
      this.saveOrders(next);
      syncBackendUpdateOrder(orderId, { staffNotes, assignedDriver });
    }
    return updated;
  },

  deleteOrder(orderId: string): boolean {
    const current = this.getOrders();
    const next = current.filter((o) => o.id !== orderId && o.orderNumber !== orderId);
    if (next.length !== current.length) {
      this.saveOrders(next);
      syncBackendDeleteOrder(orderId);
      return true;
    }
    return false;
  },

  // KITCHEN & CAPACITY SETTINGS
  getSettings(): KitchenSettings {
    const s = getStored<KitchenSettings>(KEYS.SETTINGS, INITIAL_KITCHEN_SETTINGS);
    const merged = { ...INITIAL_KITCHEN_SETTINGS, ...s, salesTaxRate: 0 };
    if (!merged.dailyTrayLimit) {
      merged.dailyTrayLimit = 25;
      merged.orderCutoffHour = 15;
      merged.bookingHorizonDays = 7;
      setStored(KEYS.SETTINGS, merged);
    }
    return merged;
  },

  updateSettings(updates: Partial<KitchenSettings>): KitchenSettings {
    const current = this.getSettings();
    const next = { ...current, ...updates };
    setStored(KEYS.SETTINGS, next);
    syncBackendSettings(updates);
    return next;
  },

  saveSettings(settings: Partial<KitchenSettings>): KitchenSettings {
    const current = this.getSettings();
    const next = { ...current, ...settings };
    setStored(KEYS.SETTINGS, next);
    return next;
  },



  // PROTEINS & HALAL MATRIX
  getProteins(): ProteinMatrixItem[] {
    return getStored<ProteinMatrixItem[]>(KEYS.PROTEINS, INITIAL_PROTEINS);
  },

  saveProteins(proteins: ProteinMatrixItem[]) {
    setStored(KEYS.PROTEINS, proteins);
  },

  updateProtein(id: string, updates: Partial<ProteinMatrixItem>): ProteinMatrixItem | null {
    const current = this.getProteins();
    let updated: ProteinMatrixItem | null = null;
    const next = current.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    if (updated) {
      this.saveProteins(next);
    }
    return updated;
  },

  // CUSTOMER CRM
  getCustomers(): CustomerRecord[] {
    return getStored<CustomerRecord[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  saveCustomers(customers: CustomerRecord[]) {
    setStored(KEYS.CUSTOMERS, customers);
  },

  recordCustomerOrder(order: DynamicOrder) {
    const current = this.getCustomers();
    const email = order.customer.email.toLowerCase().trim();
    const phone = order.customer.phone.trim();
    const existing = current.find(
      (c) => (c.email.toLowerCase().trim() === email && email !== "") || (c.phone === phone && phone !== ""),
    );

    if (existing) {
      const next = current.map((c) => {
        if (c.id === existing.id) {
          const totalOrders = c.totalOrders + 1;
          const totalSpend = Math.round((c.totalSpend + order.total) * 100) / 100;
          let vipTier: CustomerRecord["vipTier"] = c.vipTier;
          if (totalSpend >= 2000 || totalOrders >= 8) vipTier = "Black Card";
          else if (totalSpend >= 1000 || totalOrders >= 5) vipTier = "Spice King VIP";
          else if (totalSpend >= 300 || totalOrders >= 2) vipTier = "Royal Patron";

          return {
            ...c,
            totalOrders,
            totalSpend,
            vipTier,
            lastOrderDate: "Just now",
            address: order.customer.address || c.address,
          };
        }
        return c;
      });
      this.saveCustomers(next);
    } else {
      const newCustomer: CustomerRecord = {
        id: `cust_${Date.now()}`,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        totalOrders: 1,
        totalSpend: order.total,
        vipTier: order.total >= 300 ? "Royal Patron" : "Standard",
        lastOrderDate: "Just now",
        address: order.customer.address,
        staffNotes: "New customer via web checkout.",
      };
      this.saveCustomers([newCustomer, ...current]);
    }
  },

  updateCustomer(id: string, updates: Partial<CustomerRecord>): CustomerRecord | null {
    const current = this.getCustomers();
    let updated: CustomerRecord | null = null;
    const next = current.map((c) => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });
    if (updated) {
      this.saveCustomers(next);
    }
    return updated;
  },

  // COMPUTED STATS
  getComputedStats() {
    const orders = this.getOrders();
    const active = orders.filter((o) => o.status !== "cancelled" && o.status !== "completed");
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
    const totalTrays = orders.reduce(
      (sum, o) => sum + (o.status !== "cancelled" ? o.items.reduce((s, i) => s + i.qty, 0) : 0),
      0,
    );
    const activeOrders = active.length;
    const readyOrders = orders.filter((o) => o.status === "ready").length;

    // Today's trays calculation
    const todayOrders = orders.filter((o) => {
      const isToday = o.fulfilmentDate.toLowerCase().includes("today") ||
        (new Date(o.createdAt).toDateString() === new Date().toDateString());
      return isToday && o.status !== "cancelled";
    });
    const todayTraysBooked = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTrays,
      totalOrders: orders.length,
      activeOrders,
      readyOrders,
      todayTraysBooked,
    };
  },

  // CAPACITY & TRAFFIC LIGHT COMPUTATION FOR DUM DATES
  getCapacityForDate(target: string | Date) {
    const settings = this.getSettings();
    const targetKey = normalizeDateKey(target);

    // Limit set by admin for this specific date, or global dailyTrayLimit, fallback 10
    const dateLimit = targetKey && settings.dateLimits ? settings.dateLimits[targetKey] : undefined;
    const limit = dateLimit !== undefined ? Number(dateLimit) : Number(settings.dailyTrayLimit) || 10;

    const orders = this.getOrders();
    const matchingOrders = orders.filter((o) => {
      if (o.status === "cancelled") return false;
      const orderDateKey = normalizeDateKey(o.fulfilmentDate);
      return orderDateKey !== "" && orderDateKey === targetKey;
    });

    const bookedCount = matchingOrders.reduce((sum, o) => {
      const trays = Array.isArray(o.items) && o.items.length > 0
        ? o.items.reduce((acc, item) => acc + (Number(item.qty) || 1), 0)
        : 1;
      return sum + trays;
    }, 0);

    const remainingSlots = Math.max(0, limit - bookedCount);
    const percent = limit > 0 ? Math.min(100, Math.round((bookedCount / limit) * 100)) : 100;

    // Traffic light logic proportional to the configured limit:
    let status: "green" | "yellow" | "red" | "sold_out" = "green";
    let statusLabel = "Slots Available";
    let statusColor = "#10b981"; // Emerald green

    if (remainingSlots <= 0) {
      status = "sold_out";
      statusLabel = "Sold Out Today";
      statusColor = "#ef4444";
    } else if (remainingSlots <= Math.max(1, Math.round(limit * 0.25))) {
      status = "red";
      statusLabel = "Limited Slots";
      statusColor = "#f43f5e";
    } else if (remainingSlots <= Math.max(2, Math.round(limit * 0.5))) {
      status = "yellow";
      statusLabel = "Filling Fast";
      statusColor = "#eab308";
    } else {
      status = "green";
      statusLabel = "Slots Available";
      statusColor = "#10b981";
    }

    return {
      dateStr: typeof target === "string" ? target : target.toISOString(),
      targetKey,
      limit,
      bookedCount,
      remainingSlots,
      percent,
      status,
      statusLabel,
      statusColor,
      isSoldOut: remainingSlots <= 0,
    };
  },
};

// ==========================================
// 5. REACT HOOKS FOR REAL-TIME SYNC
// ==========================================

export function useDynamicMenu() {
  const [items, setItems] = useState<DynamicMenuItem[]>(() => jakloudStore.getMenu());

  const reload = useCallback(() => {
    setItems(jakloudStore.getMenu());
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          jakloudStore.saveMenu(data.items);
          reload();
        }
      })
      .catch((err) => console.warn("Failed to fetch fresh menu:", err));
  }, [reload]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      if (!ce.detail || ce.detail.key === KEYS.MENU) {
        reload();
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return {
    items,
    availableItems: items.filter((i) => i.available),
    addMenuItem: (item: Omit<DynamicMenuItem, "id" | "traysSoldWeek">) => {
      const created = jakloudStore.addMenuItem(item);
      reload();
      return created;
    },
    updateMenuItem: (id: string, updates: Partial<DynamicMenuItem>) => {
      const updated = jakloudStore.updateMenuItem(id, updates);
      reload();
      return updated;
    },
    deleteMenuItem: (id: string) => {
      const res = jakloudStore.deleteMenuItem(id);
      reload();
      return res;
    },
    toggleAvailability: (id: string) => {
      const res = jakloudStore.toggleMenuItemAvailability(id);
      reload();
      return res;
    },
    reload,
  };
}

export function useDynamicOrders() {
  const [orders, setOrders] = useState<DynamicOrder[]>(() => jakloudStore.getOrders());
  const [stats, setStats] = useState(() => jakloudStore.getComputedStats());

  const reload = useCallback(() => {
    setOrders(jakloudStore.getOrders());
    setStats(jakloudStore.getComputedStats());
  }, []);

  useEffect(() => {
    jakloudStore.syncWithBackend().then(() => reload());
  }, [reload]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      if (!ce.detail || ce.detail.key === KEYS.ORDERS || ce.detail.key === KEYS.SETTINGS) {
        reload();
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return {
    orders,
    stats,
    createOrder: (payload: Parameters<typeof jakloudStore.createOrder>[0]) => {
      const ord = jakloudStore.createOrder(payload);
      reload();
      return ord;
    },
    updateStatus: (orderId: string, status: OrderStatus) => {
      const ord = jakloudStore.updateOrderStatus(orderId, status);
      reload();
      return ord;
    },
    updateNotes: (orderId: string, notes: string, driver?: string) => {
      const ord = jakloudStore.updateOrderNotes(orderId, notes, driver);
      reload();
      return ord;
    },
    deleteOrder: (orderId: string) => {
      const res = jakloudStore.deleteOrder(orderId);
      reload();
      return res;
    },
    reload,
  };
}

export function useKitchenSettings() {
  const [settings, setSettings] = useState<KitchenSettings>(() => jakloudStore.getSettings());

  const reload = useCallback(() => {
    setSettings(jakloudStore.getSettings());
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      if (!ce.detail || ce.detail.key === KEYS.SETTINGS) {
        reload();
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return {
    settings,
    updateSettings: (updates: Partial<KitchenSettings>) => {
      const s = jakloudStore.updateSettings(updates);
      reload();
      return s;
    },
    reload,
  };
}

export function useDynamicProteins() {
  const [proteins, setProteins] = useState<ProteinMatrixItem[]>(() => jakloudStore.getProteins());

  const reload = useCallback(() => {
    setProteins(jakloudStore.getProteins());
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      if (!ce.detail || ce.detail.key === KEYS.PROTEINS) {
        reload();
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return {
    proteins,
    updateProtein: (id: string, updates: Partial<ProteinMatrixItem>) => {
      const p = jakloudStore.updateProtein(id, updates);
      reload();
      return p;
    },
    reload,
  };
}

export function useDynamicCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => jakloudStore.getCustomers());

  const reload = useCallback(() => {
    setCustomers(jakloudStore.getCustomers());
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      if (!ce.detail || ce.detail.key === KEYS.CUSTOMERS) {
        reload();
      }
    };
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return {
    customers,
    updateCustomer: (id: string, updates: Partial<CustomerRecord>) => {
      const c = jakloudStore.updateCustomer(id, updates);
      reload();
      return c;
    },
    reload,
  };
}
