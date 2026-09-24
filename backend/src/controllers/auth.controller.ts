import { Request, Response } from "express";

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@jakloud.com",
  password: process.env.ADMIN_PASSWORD || "spiceking2026",
  name: "Master Chef Kartheek",
  role: "Kitchen Administrator",
};

export function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password
  ) {
    // Return token & user info
    const token = `jak_token_${Date.now()}_${Buffer.from(email).toString("base64")}`;

    return res.json({
      message: "Welcome to JAKLOUD Spice King Kitchen Portal",
      token,
      user: {
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
      },
    });
  }

  return res.status(401).json({
    error: "Invalid email or password. Please check your credentials.",
  });
}

export function getCurrentUser(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  return res.json({
    user: {
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role,
    },
  });
}
