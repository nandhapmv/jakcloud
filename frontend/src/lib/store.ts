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
  notes?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  deliveryInstructions?: string;
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
  orderCutoffHour: number; // e.g. 14 for 2:00 PM
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
  address?: string;
  staffNotes?: string;
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

export const INITIAL_ORDERS: DynamicOrder[] = [
  {
    id: "ord_101",
    orderNumber: "JK-94821",
    status: "preparing",
    fulfilmentType: "delivery",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "2:00 PM",
    customer: {
      name: "Dr. Bradley Hayes",
      phone: "417-897-9754",
      email: "bradley.h@mercyhealth.org",
      address: "1420 E Primrose St., Suite 200",
      city: "Springfield",
      zipCode: "65804",
      deliveryInstructions: "Mercy Medical Mile Building B, 2nd floor reception",
    },
    items: [
      {
        proteinId: "chicken",
        name: "Royal Chicken Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Extra spicy flame, pack extra salan gravy",
        qty: 2,
        unitPrice: 108.99,
        lineTotal: 217.98,
      },
      {
        proteinId: "mutton",
        name: "Hyderabadi Shahi Mutton Dum Biryani",
        aloo: false,
        extraSpicy: false,
        notes: "Nizami goat cuts slow-braised in pure desi ghee",
        qty: 1,
        unitPrice: 157.99,
        lineTotal: 157.99,
      },
    ],
    subtotal: 375.97,
    tax: 32.33,
    deliveryFee: 10.0,
    total: 418.3,
    paymentMethod: "Instant UPI QR",
    paymentStatus: "Paid Online",
    specialInstructions: "Medical staff celebration. Please keep sealed in insulated thermal bags.",
    staffNotes: "VIP repeat patron. Sent extra mint raita complimentary.",
    assignedDriver: "Chef Dispatch Van #1",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "ord_102",
    orderNumber: "JK-94820",
    status: "confirmed",
    fulfilmentType: "pickup",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "12:00 PM",
    customer: {
      name: "Sophia Martinez",
      phone: "417-555-0192",
      email: "sophia.m@gmail.com",
    },
    items: [
      {
        proteinId: "beef",
        name: "Slow-Braised Spiced Beef Dum Biryani",
        aloo: true,
        extraSpicy: false,
        notes: "Medium spice with golden baby potatoes",
        qty: 1,
        unitPrice: 129.99,
        lineTotal: 129.99,
      },
    ],
    subtotal: 129.99,
    tax: 11.18,
    deliveryFee: 0,
    total: 141.17,
    paymentMethod: "Cash on Pickup",
    paymentStatus: "Cash on Pickup",
    specialInstructions: "Counter pickup at 12:00 sharp.",
    staffNotes: "Confirmed pickup slot by phone.",
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "ord_103",
    orderNumber: "JK-94819",
    status: "ready",
    fulfilmentType: "pickup",
    fulfilmentDate: "Today",
    fulfilmentTime: "4:00 PM",
    customer: {
      name: "Rajesh & Priya Sharma",
      phone: "417-501-4421",
      email: "rajesh.sharma@yahoo.com",
    },
    items: [
      {
        proteinId: "mutton",
        name: "Hyderabadi Shahi Mutton Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Extra roasted cashews pack",
        qty: 1,
        unitPrice: 164.99,
        lineTotal: 164.99,
      },
    ],
    subtotal: 164.99,
    tax: 14.19,
    deliveryFee: 0,
    total: 179.18,
    paymentMethod: "Razorpay / Card Gateway",
    paymentStatus: "Paid Online",
    specialInstructions: "Golden handi packaging.",
    staffNotes: "Dum seal intact, resting under heat lamp.",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

export const INITIAL_KITCHEN_SETTINGS: KitchenSettings = {
  dailyTrayLimit: 25,
  orderCutoffHour: 14, // 2:00 PM
  isKitchenOpen: true,
  emergencyPauseReason: "",
  closedWeekdays: [3], // Wednesday
  deliveryFee: 10,
  freeDeliveryTrayThreshold: 5,
  alooCharge: 7,
  deliveryRadiusMiles: 10,
  heroAnnouncement: "🔥 Made-to-Order Authentic Hyderabadi Dum Biryani · 24-Hour Advance Booking Required · 25 Handis Daily Limit",
  announcementActive: true,
  salesTaxRate: 0.086,
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

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust_1",
    name: "Dr. Bradley Hayes",
    email: "bradley.h@mercyhealth.org",
    phone: "417-897-9754",
    totalOrders: 6,
    totalSpend: 1845.5,
    vipTier: "Spice King VIP",
    lastOrderDate: "Yesterday",
    address: "1420 E Primrose St., Suite 200, Springfield, MO",
    staffNotes: "Chief of Surgery at Mercy. Always orders extra spicy + salan.",
  },
  {
    id: "cust_2",
    name: "Sophia Martinez",
    email: "sophia.m@gmail.com",
    phone: "417-555-0192",
    totalOrders: 3,
    totalSpend: 423.51,
    vipTier: "Royal Patron",
    lastOrderDate: "3 days ago",
    address: "Chesterfield Village, Springfield, MO",
    staffNotes: "Prefers pickup at 12:00 PM.",
  },
  {
    id: "cust_3",
    name: "Rajesh & Priya Sharma",
    email: "rajesh.sharma@yahoo.com",
    phone: "417-501-4421",
    totalOrders: 8,
    totalSpend: 2450.0,
    vipTier: "Black Card",
    lastOrderDate: "Today",
    address: "Galloway Creek, Springfield, MO",
    staffNotes: "Host of monthly community feast. Requires golden handi packaging.",
  },
];

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
    return JSON.parse(raw) as T;
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

export const jakloudStore = {
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
    }
    return updated;
  },

  deleteMenuItem(id: string): boolean {
    const current = this.getMenu();
    const next = current.filter((it) => it.id !== id && it.proteinId !== id);
    if (next.length !== current.length) {
      this.saveMenu(next);
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
    return newStatus;
  },

  // ORDER OPERATIONS
  getOrders(): DynamicOrder[] {
    return getStored<DynamicOrder[]>(KEYS.ORDERS, INITIAL_ORDERS);
  },

  saveOrders(orders: DynamicOrder[]) {
    setStored(KEYS.ORDERS, orders);
  },

  createOrder(payload: {
    items: OrderItemDetail[];
    fulfilmentType: "pickup" | "delivery";
    fulfilmentDate: string;
    fulfilmentTime: string;
    customer: CustomerInfo;
    paymentMethod?: DynamicOrder["paymentMethod"];
    specialInstructions?: string;
  }): DynamicOrder {
    const settings = this.getSettings();
    const subtotal = payload.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const totalTrays = payload.items.reduce((sum, i) => sum + i.qty, 0);
    const deliveryFee = payload.fulfilmentType === "delivery"
      ? (totalTrays >= settings.freeDeliveryTrayThreshold ? 0 : settings.deliveryFee)
      : 0;
    const tax = Math.round(subtotal * settings.salesTaxRate * 100) / 100;
    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

    const newOrder: DynamicOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: `JK-${Math.floor(10000 + Math.random() * 90000)}`,
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

    const current = this.getOrders();
    this.saveOrders([newOrder, ...current]);

    // Update customer CRM
    this.recordCustomerOrder(newOrder);

    return newOrder;
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
    }
    return updated;
  },

  deleteOrder(orderId: string): boolean {
    const current = this.getOrders();
    const next = current.filter((o) => o.id !== orderId && o.orderNumber !== orderId);
    if (next.length !== current.length) {
      this.saveOrders(next);
      return true;
    }
    return false;
  },

  // KITCHEN & CAPACITY SETTINGS
  getSettings(): KitchenSettings {
    return getStored<KitchenSettings>(KEYS.SETTINGS, INITIAL_KITCHEN_SETTINGS);
  },

  updateSettings(updates: Partial<KitchenSettings>): KitchenSettings {
    const current = this.getSettings();
    const next = { ...current, ...updates };
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
