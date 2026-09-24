import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "*"],
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || "u573776957_Jackloud",
    password: process.env.DB_PASSWORD || process.env.DB_PASS || "Jackloud@123",
    name: process.env.DB_NAME || "u573776957_Jackloud",
  },
  business: {
    name: "JAKLOUD Spice King Dum Biryani",
    phone: "417-897-9754",
    email: "sales@jakloud.com",
    address: "3625 S Bedford Ave., Springfield, MO 65809",
    cutoffHour: 14, // 2:00 PM
    deliveryFee: 10.0,
    alooCharge: 7.0,
    taxRate: 0.086, // 8.6%
  },
};
