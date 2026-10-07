import { Request, Response } from "express";
import {
  listAllCustomers,
  saveCustomer,
  deleteCustomer as removeCustomer,
  type CustomerRecord,
} from "../models/customer.model.js";

export function getCustomers(_req: Request, res: Response) {
  const customers = listAllCustomers();
  return res.json({
    count: customers.length,
    customers,
  });
}

export function createCustomer(req: Request, res: Response) {
  const { name, email, phone, address, city, zipCode, dietaryNotes, adminNotes, status } = req.body;
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: "Customer name and phone or email are required." });
  }

  const id = `cust_${Date.now()}`;
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0]!.slice(0, 2).toUpperCase() : (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();

  const record: CustomerRecord = {
    id,
    name,
    email: email || "",
    phone: phone || "",
    totalOrders: 0,
    totalSpent: 0,
    status: status || "Standard Patron",
    joinDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    avatarInitials: initials,
    avatarBg: "bg-gold/15 border-gold/40",
    avatarText: "text-gold",
    address: address || "",
    city: city || "Springfield",
    zipCode: zipCode || "",
    dietaryNotes: dietaryNotes || "",
    adminNotes: adminNotes || "",
  };

  const saved = saveCustomer(record);
  return res.status(201).json({ message: "Customer added successfully.", customer: saved });
}

export function updateCustomer(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) return res.status(400).json({ error: "Customer ID is required." });

  const existing = listAllCustomers().find((c) => c.id === id);
  if (!existing) return res.status(404).json({ error: "Customer not found." });

  const updated: CustomerRecord = {
    ...existing,
    ...req.body,
  };

  saveCustomer(updated);
  return res.json({ message: "Customer profile updated.", customer: updated });
}

export function deleteCustomer(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) return res.status(400).json({ error: "Customer ID is required." });

  const deleted = removeCustomer(id);
  if (!deleted) return res.status(404).json({ error: "Customer not found." });

  return res.json({ message: "Customer removed successfully." });
}
