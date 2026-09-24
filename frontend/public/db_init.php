<?php
/**
 * JAKLOUD Database Initialization & Auto-Migration Script
 * Run this directly in your browser: https://jakloud.com/db_init.php
 */

header('Content-Type: application/json; charset=utf-8');

$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'u573776957_Jackloud';
$db_pass = getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'Jackloud@123');
$db_name = getenv('DB_NAME') ?: 'u573776957_Jackloud';

$response = [
    'success' => false,
    'host' => $db_host,
    'database' => $db_name,
    'user' => $db_user,
    'tables_created' => [],
    'errors' => []
];

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 1. Admin Users Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            email VARCHAR(128) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(64) NOT NULL DEFAULT 'head_chef_admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $response['tables_created'][] = 'admin_users';

    // 2. Menu Items Table
    $pdo->exec("
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
    ");
    $response['tables_created'][] = 'menu_items';

    // 3. Customers Table
    $pdo->exec("
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
    ");
    $response['tables_created'][] = 'customers';

    // 4. Orders Table
    $pdo->exec("
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
    ");
    $response['tables_created'][] = 'orders';

    // 5. Order Items Table
    $pdo->exec("
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
    ");
    $response['tables_created'][] = 'order_items';

    // 6. Contact Messages Table
    $pdo->exec("
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
    ");
    $response['tables_created'][] = 'contact_messages';

    // 7. Settings Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(64) PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $response['tables_created'][] = 'settings';

    // 8. Daily Control Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS daily_control (
            control_date DATE PRIMARY KEY,
            trays_booked INT DEFAULT 0,
            max_capacity INT DEFAULT 25,
            is_closed TINYINT(1) DEFAULT 0,
            closure_reason VARCHAR(255) DEFAULT '',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $response['tables_created'][] = 'daily_control';

    // Seed default admin
    $pdo->exec("
        INSERT IGNORE INTO admin_users (id, name, email, password_hash, role)
        VALUES ('admin_master_1', 'Master Chef Kartheek', 'admin@jakloud.com', 'spiceking2026', 'head_chef_admin');
    ");

    // Seed default settings
    $pdo->exec("
        INSERT IGNORE INTO settings (setting_key, setting_value)
        VALUES 
            ('orderCutoffHour', '14'),
            ('deliveryFee', '10.00'),
            ('alooCharge', '7.00'),
            ('maxDailyTrays', '25'),
            ('businessPhone', '417-897-9754'),
            ('businessEmail', 'sales@jakloud.com'),
            ('businessAddress', '3625 S Bedford Ave., Springfield, MO 65809');
    ");

    $response['success'] = true;
    $response['message'] = 'All 8 database tables verified, created, and seeded successfully!';

} catch (PDOException $e) {
    $response['success'] = false;
    $response['errors'][] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
