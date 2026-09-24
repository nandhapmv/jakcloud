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

export function saveContactMessage(msg: Omit<ContactMessage, "id" | "createdAt">): ContactMessage {
  const newMsg: ContactMessage = {
    id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    ...msg,
    createdAt: new Date().toISOString(),
  };
  contactMessages.push(newMsg);
  return newMsg;
}

export function listContactMessages(): ContactMessage[] {
  return [...contactMessages];
}
