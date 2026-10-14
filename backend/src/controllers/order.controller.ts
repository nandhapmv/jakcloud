import { Request, Response } from "express";
import {
  calculateOrderTotals,
  generateOrderNumber,
  saveOrder,
  findOrderById,
  findOrderByNumber,
  listAllOrders,
  updateOrderStatus,
  updateOrderDetails,
  deleteOrder as removeOrder,
  getAdminStats,
  type Order,
  type OrderStatus,
} from "../models/order.model.js";
import { getKitchenSettings } from "../models/settings.model.js";

function normalizeDateKey(input: string | Date | undefined | null): string {
  if (!input) return "";
  if (input instanceof Date && !isNaN(input.getTime())) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(input).trim();
  if (!str) return "";

  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

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

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return lower;
}

export async function createOrder(req: Request, res: Response) {
  try {
    const { items, fulfilmentType, fulfilmentDate, fulfilmentTime, customer, specialInstructions, paymentMethod, paymentStatus, paymentId } = req.body;

    // Validate kitchen open state and date capacity limit
    const settings = getKitchenSettings();
    if (!settings.isKitchenOpen) {
      return res.status(400).json({ error: "Kitchen is currently closed for online orders." });
    }

    const requestedTrays = items.reduce((sum: number, it: any) => sum + (Number(it.qty) || 1), 0);
    const targetKey = normalizeDateKey(fulfilmentDate);
    const dateLimit =
      targetKey && settings.dateLimits && settings.dateLimits[targetKey] !== undefined
        ? Number(settings.dateLimits[targetKey])
        : Number(settings.dailyTrayLimit) || 10;

    const existingOrders = listAllOrders();
    const bookedTrays = existingOrders
      .filter((o) => o.status !== "cancelled" && normalizeDateKey(o.fulfilmentDate) === targetKey)
      .reduce((sum, o) => sum + o.items.reduce((s, it) => s + (Number(it.qty) || 1), 0), 0);

    const remainingSlots = Math.max(0, dateLimit - bookedTrays);
    if (remainingSlots <= 0) {
      return res.status(400).json({
        error: `Kitchen is completely sold out for ${fulfilmentDate}. Please choose another date.`,
      });
    }
    if (requestedTrays > remainingSlots) {
      return res.status(400).json({
        error: `Only ${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} remaining for ${fulfilmentDate}. You requested ${requestedTrays} trays.`,
      });
    }

    const { orderItems, subtotal, tax, deliveryFee, total } = calculateOrderTotals(
      items,
      fulfilmentType,
    );

    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderNumber = generateOrderNumber();

    const order: Order = {
      id: orderId,
      orderNumber,
      status: "confirmed",
      fulfilmentType,
      fulfilmentDate,
      fulfilmentTime,
      customer,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || "Razorpay Online",
      paymentStatus: paymentStatus || "pending",
      paymentId: paymentId || (paymentMethod?.match(/\((pay_[a-zA-Z0-9]+)\)/)?.[1]),
      specialInstructions: specialInstructions || "",
      createdAt: now,
      updatedAt: now,
    };

    await saveOrder(order);

    console.log(`[Order Created] ${orderNumber} for ${customer.name} - Total: $${total}`);

    return res.status(201).json({
      message: "Order placed successfully! We have received your booking.",
      order,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process order";
    return res.status(400).json({ error: message });
  }
}

export function getOrder(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    return res.status(400).json({ error: "Order ID or order number is required" });
  }

  const order = findOrderById(id) || findOrderByNumber(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json(order);
}

export function getOrders(_req: Request, res: Response) {
  const orders = listAllOrders();
  return res.json({
    count: orders.length,
    orders,
  });
}

export async function updateStatus(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { status } = req.body as { status: OrderStatus };

  if (!id || !status) {
    return res.status(400).json({ error: "Order ID and status are required" });
  }

  const validStatuses: OrderStatus[] = ["pending", "confirmed", "dum_cooking", "preparing", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({
    message: `Order ${updated.orderNumber} status updated to ${status}`,
    order: updated,
  });
}

export async function updateOrder(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  const updated = await updateOrderDetails(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({
    message: `Order ${updated.orderNumber} updated successfully.`,
    order: updated,
  });
}

export async function deleteOrder(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  const success = await removeOrder(id);
  if (!success) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({ message: "Order removed successfully." });
}

export function getStats(_req: Request, res: Response) {
  const stats = getAdminStats();
  return res.json(stats);
}
