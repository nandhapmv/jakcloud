import { Router } from "express";
import { initDatabase, getDatabaseStatus, getPool } from "../config/database.js";

export const dbRouter = Router();

// Check DB Connection Status & Table Counts
dbRouter.get("/status", async (_req, res) => {
  const status = getDatabaseStatus();
  const pool = getPool();

  let tables: string[] = [];
  let counts: Record<string, number> = {};

  if (pool && status.connected) {
    try {
      const [rows] = await pool.query<any[]>("SHOW TABLES");
      tables = rows.map((r) => Object.values(r)[0] as string);

      for (const table of tables) {
        try {
          const [countResult] = await pool.query<any[]>(`SELECT COUNT(*) as count FROM \`${table}\``);
          counts[table] = countResult[0]?.count || 0;
        } catch {
          // ignore table count error
        }
      }
    } catch (err: any) {
      status.error = err.message;
    }
  }

  res.json({
    database: status,
    tables,
    counts,
    timestamp: new Date().toISOString(),
  });
});

// Trigger Auto-Creation of Tables
dbRouter.all("/init", async (_req, res) => {
  try {
    const success = await initDatabase();
    const status = getDatabaseStatus();
    res.json({
      success,
      message: success
        ? "MySQL Database tables verified and initialized successfully!"
        : "Database initialization failed or MySQL not yet ready.",
      status,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Database auto-migration failed",
    });
  }
});
