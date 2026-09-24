import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "./config/index.js";
import { apiRouter } from "./routes/api.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const port = config.port;

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origins
      if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, adjust as needed
      }
    },
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api", apiRouter);

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "JAKLOUD Spice King Dum Biryani API",
    documentation: "/api/health, /api/menu, /api/orders, /api/contact",
    status: "online",
  });
});

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 JAKLOUD Spice King Backend running on http://localhost:${port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});
