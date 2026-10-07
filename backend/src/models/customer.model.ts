import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { listAllOrders } from "./order.model.js";
import { getPool, isDatabaseConnected } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  favoriteProtein?: string;
  preferredFulfilment?: string;
  lastOrderDate?: string;
  status: "Standard Patron" | "VIP Royal" | "Master Patron" | "Corporate";
  joinDate: string;
  avatarInitials: string;
  avatarBg: string;
  avatarText: string;
  spicePreference?: string;
  dietaryNotes?: string;
  adminNotes?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

const customers = new Map<string, CustomerRecord>();

function loadCustomersFromFile(): void {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((c: CustomerRecord) => customers.set(c.id, c));
      }
    }
  } catch (err) {
    console.warn("Could not read customers from file:", err);
  }
}

function persistCustomersToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(customers.values());
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write customers to file:", err);
  }
}

loadCustomersFromFile();

function getInitials(name: string): string {
  if (!name) return "PT";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function listAllCustomers(): CustomerRecord[] {
  // Sync customers dynamically from actual orders
  const allOrders = listAllOrders();

  allOrders.forEach((o) => {
    const phone = o.customer.phone?.trim() || "";
    const email = o.customer.email?.toLowerCase().trim() || "";
    const id = phone ? `cust_${phone.replace(/\D/g, "")}` : (email ? `cust_${email.replace(/[^a-z0-9]/g, "")}` : o.id);

    const existing = customers.get(id);
    if (!existing) {
      const initials = getInitials(o.customer.name);
      const newCustomer: CustomerRecord = {
        id,
        name: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone,
        totalOrders: 1,
        totalSpent: o.total,
        favoriteProtein: o.items[0]?.name || "Chicken Dum Biryani",
        preferredFulfilment: o.fulfilmentType === "pickup" ? "Pickup" : "Delivery",
        lastOrderDate: o.fulfilmentDate || new Date(o.createdAt).toLocaleDateString(),
        status: o.total > 200 ? "VIP Royal" : "Standard Patron",
        joinDate: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        avatarInitials: initials,
        avatarBg: "bg-gold/15 border-gold/40",
        avatarText: "text-gold",
        address: o.customer.address || "",
        city: o.customer.city || "Springfield",
        zipCode: o.customer.zipCode || "",
        adminNotes: o.customer.deliveryInstructions || "",
      };
      customers.set(id, newCustomer);
    } else {
      // Re-aggregate totals from all orders of this customer
      const customerOrders = allOrders.filter(
        (co) =>
          (phone && co.customer.phone === phone) ||
          (email && co.customer.email?.toLowerCase() === email),
      );
      existing.totalOrders = customerOrders.length;
      existing.totalSpent = Math.round(customerOrders.reduce((sum, co) => sum + co.total, 0) * 100) / 100;
      existing.lastOrderDate = customerOrders[0]?.fulfilmentDate || existing.lastOrderDate;
      if (existing.totalSpent > 300) existing.status = "VIP Royal";
      customers.set(id, existing);
    }
  });

  persistCustomersToFile();

  return Array.from(customers.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export function saveCustomer(record: CustomerRecord): CustomerRecord {
  customers.set(record.id, record);
  persistCustomersToFile();

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    pool.query(
      `INSERT INTO customers (id, name, email, phone, address, city, zip_code, delivery_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), phone=VALUES(phone), address=VALUES(address), city=VALUES(city)`,
      [
        record.id,
        record.name,
        record.email,
        record.phone,
        record.address || "",
        record.city || "Springfield",
        record.zipCode || "",
        record.adminNotes || "",
      ],
    ).catch((err) => console.warn("MySQL customer save warning:", err));
  }

  return record;
}

export function deleteCustomer(id: string): boolean {
  const deleted = customers.delete(id);
  if (deleted) {
    persistCustomersToFile();
    const pool = getPool();
    if (pool && isDatabaseConnected()) {
      pool.query("DELETE FROM customers WHERE id = ?", [id]).catch(() => {});
    }
  }
  return deleted;
}
