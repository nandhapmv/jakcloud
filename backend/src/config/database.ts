import mysql from "mysql2/promise";
import { config } from "./index.js";

let pool: mysql.Pool | null = null;
let isDbReady = false;
let dbError: string | null = null;

export function getPool(): mysql.Pool | null {
  return pool;
}

export function isDatabaseConnected(): boolean {
  return isDbReady;
}

export function getDatabaseStatus() {
  return {
    connected: isDbReady,
    database: config.database.name,
    user: config.database.user,
    host: config.database.host,
    error: dbError,
  };
}

export async function initDatabase(): Promise<boolean> {
  try {
    console.log(`🔌 Connecting to MySQL database '${config.database.name}' on ${config.database.host}:${config.database.port}...`);

    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connection established successfully!");
    connection.release();

    // Auto-create all required tables
    await createTablesIfNotExist();

    isDbReady = true;
    dbError = null;
    return true;
  } catch (err: any) {
    dbError = err.message || "Unknown database connection error";
    isDbReady = false;
    console.warn(`⚠️ MySQL Database initialization note: ${dbError}`);
    console.log("ℹ️ Running with persistent store & fallback until MySQL is active.");
    return false;
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;

  console.log("🛠️ Checking and auto-creating database tables if not exist...");

  // 1. Admin Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(128) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(64) NOT NULL DEFAULT 'head_chef_admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Menu Items Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id VARCHAR(64) PRIMARY KEY,
      protein_id VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      category VARCHAR(64) NOT NULL DEFAULT 'Signature Trays',
      price DECIMAL(10,2) NOT NULL,
      price_with_aloo DECIMAL(10,2) NOT NULL,
      badge VARCHAR(128) DEFAULT '',
      description TEXT,
      kcal INT DEFAULT 0,
      kcal_aloo INT DEFAULT 0,
      available TINYINT(1) DEFAULT 1,
      image_url VARCHAR(255) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. Customers Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(128) NOT NULL,
      phone VARCHAR(64) NOT NULL,
      address VARCHAR(255) DEFAULT '',
      city VARCHAR(128) DEFAULT 'Springfield',
      zip_code VARCHAR(32) DEFAULT '',
      delivery_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cust_phone (phone),
      INDEX idx_cust_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Orders Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      order_number VARCHAR(64) NOT NULL UNIQUE,
      status ENUM('pending', 'confirmed', 'dum_cooking', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'confirmed',
      fulfilment_type ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
      fulfilment_date VARCHAR(64) NOT NULL,
      fulfilment_time VARCHAR(64) NOT NULL,
      customer_name VARCHAR(128) NOT NULL,
      customer_email VARCHAR(128) NOT NULL,
      customer_phone VARCHAR(64) NOT NULL,
      customer_address VARCHAR(255) DEFAULT '',
      customer_city VARCHAR(128) DEFAULT '',
      customer_zip VARCHAR(32) DEFAULT '',
      delivery_instructions TEXT,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      payment_method VARCHAR(128) DEFAULT 'Instant UPI QR',
      payment_status VARCHAR(64) DEFAULT 'pending',
      special_instructions TEXT,
      staff_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_status (status),
      INDEX idx_order_date (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5. Order Items Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      protein_id VARCHAR(64) NOT NULL,
      name VARCHAR(128) NOT NULL,
      aloo TINYINT(1) DEFAULT 0,
      extra_spicy TINYINT(1) DEFAULT 0,
      notes TEXT,
      qty INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      line_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 6. Contact Messages Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      email VARCHAR(128) NOT NULL,
      phone VARCHAR(64) DEFAULT '',
      subject VARCHAR(255) DEFAULT '',
      message TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 7. Settings / Configuration Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 8. Daily Control Table (25 Trays Limit Management)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_control (
      control_date DATE PRIMARY KEY,
      trays_booked INT DEFAULT 0,
      max_capacity INT DEFAULT 25,
      is_closed TINYINT(1) DEFAULT 0,
      closure_reason VARCHAR(255) DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed default admin user if not exists
  await pool.query(`
    INSERT IGNORE INTO admin_users (id, name, email, password_hash, role)
    VALUES (
      'admin_master_1',
      'Master Chef Kartheek',
      'admin@jakloud.com',
      'spiceking2026',
      'head_chef_admin'
    );
  `);

  // Seed default settings if empty
  await pool.query(`
    INSERT IGNORE INTO settings (setting_key, setting_value)
    VALUES 
      ('orderCutoffHour', '14'),
      ('deliveryFee', '10.00'),
      ('alooCharge', '7.00'),
      ('maxDailyTrays', '25'),
      ('businessPhone', '417-897-9754'),
      ('businessEmail', 'sales@jakloud.com'),
      ('businessAddress', '3625 S Bedford Ave., Springfield, MO 65809');
  `);

  console.log("✅ All MySQL database tables verified and initialized!");
}
