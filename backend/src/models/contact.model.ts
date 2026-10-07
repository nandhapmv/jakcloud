import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPool, isDatabaseConnected } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
}

let contactMessages: ContactMessage[] = loadContactsFromFile();

function loadContactsFromFile(): ContactMessage[] {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      const raw = fs.readFileSync(CONTACTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Could not read contacts from file:", err);
  }
  return [];
}

function persistContactsToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contactMessages, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write contacts to file:", err);
  }
}

export async function saveContactMessage(msg: Omit<ContactMessage, "id" | "createdAt">): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    ...msg,
    createdAt: new Date().toISOString(),
  };
  contactMessages.unshift(newMsg);
  persistContactsToFile();

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
