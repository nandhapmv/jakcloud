import { getPool, isDatabaseConnected } from "../config/database.js";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
}

const contactMessages: ContactMessage[] = [];

export async function saveContactMessage(msg: Omit<ContactMessage, "id" | "createdAt">): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    ...msg,
    createdAt: new Date().toISOString(),
  };
  contactMessages.push(newMsg);

  const pool = getPool();
  if (pool && isDatabaseConnected()) {
    try {
      await pool.query(
        "INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)",
        [newMsg.id, newMsg.name, newMsg.email, newMsg.phone || "", newMsg.subject || "", newMsg.message],
      );
    } catch (err: any) {
      console.warn("⚠️ MySQL saveContactMessage warning:", err.message);
    }
  }

  return newMsg;
}

export function listContactMessages(): ContactMessage[] {
  return [...contactMessages];
}
