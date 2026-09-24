import { Request, Response } from "express";
import { saveContactMessage, listContactMessages } from "../models/contact.model.js";

export async function handleContactMessage(req: Request, res: Response) {
  try {
    const { name, email, phone, subject, message } = req.body;

    const saved = await saveContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    });

    console.log(`[Contact Message] From ${name} (${email}): ${message.slice(0, 50)}...`);

    return res.status(201).json({
      message: "Thank you for reaching out! We have received your message and will respond shortly.",
      referenceId: saved.id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit message";
    return res.status(500).json({ error: msg });
  }
}

export function getContactMessages(_req: Request, res: Response) {
  const messages = listContactMessages();
  return res.json({
    count: messages.length,
    messages,
  });
}
