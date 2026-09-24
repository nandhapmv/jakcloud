import { MENU_ITEMS, type ProteinId } from "./menu.model.js";
import { config } from "../config/index.js";
import { getPool, isDatabaseConnected } from "../config/database.js";

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
  specialInstructions?: string;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory order store
const orders = new Map<string, Order>();

// Seed sample orders for demonstration
const sampleOrders: Order[] = [
  {
    id: "ord_demo_1",
    orderNumber: "JK-2026-8821",
    status: "preparing",
    fulfilmentType: "delivery",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "2:00 PM",
    customer: {
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      phone: "417-555-3921",
      address: "1420 E Sunshine St",
      city: "Springfield",
      zipCode: "65804",
      deliveryInstructions: "Ring bell at side entrance",
    },
    items: [
      {
        proteinId: "mutton",
        name: "Mutton Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Heavy on roasted cashews and fried onions",
        qty: 1,
        unitPrice: 164.99,
        lineTotal: 164.99,
      },
    ],
    subtotal: 164.99,
    tax: 14.19,
    deliveryFee: 10.0,
    total: 174.99,
    specialInstructions: "Occasion order for family celebration.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "ord_demo_2",
    orderNumber: "JK-2026-7452",
    status: "confirmed",
    fulfilmentType: "pickup",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "12:00 PM",
    customer: {
      name: "Ananya Patel",
      email: "ananya.patel@example.com",
      phone: "417-555-8492",
    },
    items: [
      {
        proteinId: "chicken",
        name: "Chicken Dum Biryani",
        aloo: false,
        extraSpicy: false,
        notes: "",
        qty: 2,
        unitPrice: 101.99,
        lineTotal: 203.98,
      },
    ],
    subtotal: 203.98,
    tax: 17.54,
    deliveryFee: 0,
    total: 203.98,
    specialInstructions: "Will arrive right at noon.",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

sampleOrders.forEach((o) => orders.set(o.id, o));

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
  // Always update in-memory cache
  orders.set(order.id, order);

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      // 1. Insert/Update customer
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

      // 2. Insert order
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

      // 3. Insert items
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
  const totalRevenue = all.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
  const totalTrays = all.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  const activeOrders = all.filter((o) => o.status === "confirmed" || o.status === "preparing").length;
  const readyOrders = all.filter((o) => o.status === "ready").length;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalTrays,
    totalOrders: all.length,
    activeOrders,
    readyOrders,
  };
}
