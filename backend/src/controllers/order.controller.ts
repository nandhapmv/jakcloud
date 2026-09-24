import { Request, Response } from "express";
import {
  calculateOrderTotals,
  generateOrderNumber,
  saveOrder,
  findOrderById,
  findOrderByNumber,
  listAllOrders,
  updateOrderStatus,
  getAdminStats,
  type Order,
  type OrderStatus,
} from "../models/order.model.js";

export function createOrder(req: Request, res: Response) {
  try {
    const { items, fulfilmentType, fulfilmentDate, fulfilmentTime, customer, specialInstructions } = req.body;

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
      specialInstructions: specialInstructions || "",
      createdAt: now,
      updatedAt: now,
    };

    saveOrder(order);

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

  // Support lookup by UUID id or Order Reference Number (e.g. JK-2026-XXXX)
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

export function updateStatus(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { status } = req.body as { status: OrderStatus };

  if (!id || !status) {
    return res.status(400).json({ error: "Order ID and status are required" });
  }

  const validStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const updated = updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({
    message: `Order ${updated.orderNumber} status updated to ${status}`,
    order: updated,
  });
}

export function getStats(_req: Request, res: Response) {
  const stats = getAdminStats();
  return res.json(stats);
}
