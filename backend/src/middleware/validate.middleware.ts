import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const orderItemSchema = z.object({
  proteinId: z.enum(["chicken", "pork", "beef", "mutton"]),
  aloo: z.boolean().default(false),
  extraSpicy: z.boolean().default(false),
  notes: z.string().optional().default(""),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  fulfilmentType: z.enum(["pickup", "delivery"]),
  fulfilmentDate: z.string().min(1, "Fulfilment date is required"),
  fulfilmentTime: z.string().min(1, "Fulfilment time is required"),
  customer: customerSchema,
  specialInstructions: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ error: "Invalid request payload" });
    }
  };
}
