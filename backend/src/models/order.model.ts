import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MENU_ITEMS, type ProteinId } from "./menu.model.js";
import { config } from "../config/index.js";
import { getPool, isDatabaseConnected } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

export interface OrderItem {
  proteinId: ProteinId;
  name: string;
  aloo: boolean;
  extraSpicy: boolean;
  notes?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export type FulfilmentType = "pickup" | "delivery";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | "dum_cooking";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  deliveryInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfilmentType: FulfilmentType;
  fulfilmentDate: string;
  fulfilmentTime: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  specialInstructions?: string;
  staffNotes?: string;
  assignedDriver?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory order cache
const orders = new Map<string, Order>();

function loadOrdersFromFile(): void {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((o: Order) => orders.set(o.id, o));
      }
    }
  } catch (err) {
    console.warn("Could not read orders from file:", err);
  }
}

function persistOrdersToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(orders.values());
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write orders to file:", err);
  }
}

// Initial load from real persistent file storage
loadOrdersFromFile();

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JK-${dateStr}-${randomSuffix}`;
}

export function calculateOrderTotals(
  items: { proteinId: ProteinId; aloo: boolean; extraSpicy: boolean; notes?: string; qty: number }[],
  fulfilmentType: FulfilmentType,
): {
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
} {
  const orderItems: OrderItem[] = items.map((item) => {
    const menuItem = MENU_ITEMS.find((m) => m.id === item.proteinId);
    if (!menuItem) {
      throw new Error(`Invalid protein ID: ${item.proteinId}`);
    }
    const unitPrice = item.aloo ? menuItem.priceWithAloo : menuItem.price;
    const lineTotal = Math.round(unitPrice * item.qty * 100) / 100;

    return {
      proteinId: item.proteinId,
      name: menuItem.name,
      aloo: item.aloo,
      extraSpicy: item.extraSpicy,
      notes: item.notes || "",
      qty: item.qty,
      unitPrice,
      lineTotal,
    };
  });

  const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const tax = Math.round(subtotal * config.business.taxRate * 100) / 100;
  const deliveryFee = fulfilmentType === "delivery" ? config.business.deliveryFee : 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  return {
    orderItems,
    subtotal,
    tax,
    deliveryFee,
    total,
  };
}

export async function saveOrder(order: Order): Promise<Order> {
  // 1. Update cache & persistent storage
  orders.set(order.id, order);
  persistOrdersToFile();

  // 2. Persist to MySQL if available
  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      await pool.query(
        `INSERT INTO customers (id, name, email, phone, address, city, zip_code, delivery_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), city=VALUES(city)`,
        [
          `cust_${order.customer.phone.replace(/\D/g, "")}`,
          order.customer.name,
          order.customer.email,
          order.customer.phone,
          order.customer.address || "",
          order.customer.city || "Springfield",
          order.customer.zipCode || "",
          order.customer.deliveryInstructions || "",
        ],
      );

      await pool.query(
        `INSERT INTO orders 
          (id, order_number, status, fulfilment_type, fulfilment_date, fulfilment_time, 
           customer_name, customer_email, customer_phone, customer_address, customer_city, customer_zip, 
           customer_instructions, subtotal, tax, delivery_fee, total, payment_method, payment_status, special_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), total=VALUES(total), updated_at=NOW()`,
        [
          order.id,
          order.orderNumber,
          order.status,
          order.fulfilmentType,
          order.fulfilmentDate,
          order.fulfilmentTime,
          order.customer.name,
          order.customer.email,
          order.customer.phone,
          order.customer.address || "",
          order.customer.city || "",
          order.customer.zipCode || "",
          order.customer.deliveryInstructions || "",
          order.subtotal,
          order.tax,
          order.deliveryFee,
          order.total,
          order.paymentMethod || "Instant UPI QR",
          order.paymentStatus || "pending",
          order.specialInstructions || "",
        ],
      );

      for (const item of order.items) {
        await pool.query(
          `INSERT INTO order_items (id, order_id, protein_id, name, aloo, extra_spicy, notes, qty, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `item_${order.id}_${item.proteinId}_${Date.now()}`,
            order.id,
            item.proteinId,
            item.name,
            item.aloo ? 1 : 0,
            item.extraSpicy ? 1 : 0,
            item.notes || "",
            item.qty,
            item.unitPrice,
            item.lineTotal,
          ],
        );
      }
    } catch (err: any) {
      console.warn("⚠️ MySQL saveOrder warning:", err.message);
    }
  }

  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  const order = orders.get(id) || findOrderByNumber(id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    orders.set(order.id, order);
    persistOrdersToFile();
  }

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      await pool.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ? OR order_number = ?", [
        status,
        id,
        id,
      ]);
    } catch (err: any) {
      console.warn("⚠️ MySQL updateOrderStatus warning:", err.message);
    }
  }

  return order;
}

export async function updateOrderDetails(
  id: string,
  updates: Partial<Order>,
): Promise<Order | undefined> {
  const order = orders.get(id) || findOrderByNumber(id);
  if (order) {
    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    orders.set(order.id, order);
    persistOrdersToFile();
  }
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const order = orders.get(id) || findOrderByNumber(id);
  if (!order) return false;

  orders.delete(order.id);
  persistOrdersToFile();

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      await pool.query("DELETE FROM orders WHERE id = ? OR order_number = ?", [order.id, order.orderNumber]);
    } catch (err: any) {
      console.warn("⚠️ MySQL deleteOrder warning:", err.message);
    }
  }

  return true;
}

export function findOrderById(id: string): Order | undefined {
  return orders.get(id);
}

export function findOrderByNumber(orderNumber: string): Order | undefined {
  for (const order of orders.values()) {
    if (order.orderNumber.toUpperCase() === orderNumber.toUpperCase()) {
      return order;
    }
  }
  return undefined;
}

export function listAllOrders(): Order[] {
  return Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAdminStats() {
  const all = Array.from(orders.values());
  const validOrders = all.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTrays = validOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  const activeOrders = all.filter((o) => o.status === "confirmed" || o.status === "preparing" || o.status === "dum_cooking").length;
  const readyOrders = all.filter((o) => o.status === "ready").length;
  const pickupOrders = validOrders.filter((o) => o.fulfilmentType === "pickup").length;
  const deliveryOrders = validOrders.filter((o) => o.fulfilmentType === "delivery").length;

  // Calculate unique diners
  const uniqueDiners = new Set<string>();
  all.forEach((o) => {
    const key = o.customer.phone || o.customer.email || o.customer.name;
    if (key) uniqueDiners.add(key.toLowerCase().trim());
  });

  // Calculate today's booked trays
  const todayStr = new Date().toDateString();
  const todayOrders = validOrders.filter(
    (o) =>
      o.fulfilmentDate.toLowerCase().includes("today") ||
      new Date(o.createdAt).toDateString() === todayStr,
  );
  const todayTraysBooked = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalTrays,
    totalOrders: all.length,
    activeOrders,
    readyOrders,
    pickupOrders,
    deliveryOrders,
    dinerBase: uniqueDiners.size,
    todayTraysBooked,
  };
}
