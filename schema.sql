-- JAKLOUD Spice King Dum Biryani
-- Database Schema for Hostinger MySQL (u573776957_Jackloud)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Table: admin_users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(64) NOT NULL DEFAULT 'head_chef_admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `admin_users` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
('admin_master_1', 'Master Chef Kartheek', 'admin@jakloud.com', 'spiceking2026', 'head_chef_admin');

-- --------------------------------------------------------
-- 2. Table: menu_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` VARCHAR(64) NOT NULL,
  `protein_id` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Signature Trays',
  `price` DECIMAL(10,2) NOT NULL,
  `price_with_aloo` DECIMAL(10,2) NOT NULL,
  `badge` VARCHAR(128) DEFAULT '',
  `description` TEXT,
  `kcal` INT DEFAULT 0,
  `kcal_aloo` INT DEFAULT 0,
  `available` TINYINT(1) DEFAULT 1,
  `image_url` VARCHAR(255) DEFAULT '',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `menu_items` (`id`, `protein_id`, `name`, `category`, `price`, `price_with_aloo`, `badge`, `description`, `kcal`, `kcal_aloo`) VALUES
('menu_1', 'chicken', 'Royal Chicken Dum Biryani', 'Signature Trays', 101.99, 108.99, 'House Specialty', '1.6-1.8 kg marinated bone-in chicken thighs layered with aged saffron basmati rice.', 2850, 3007),
('menu_2', 'mutton', 'Hyderabadi Shahi Mutton Dum', 'Royal & Occasion', 157.99, 164.99, 'Royal Heritage', 'Tender bone-in baby goat marinated in royal Nizami spices and saffron basmati.', 3120, 3277),
('menu_3', 'beef', 'Slow-Braised Spiced Beef Dum', 'Signature Trays', 122.99, 129.99, 'Bold & Hearty', 'Prime tender beef cooked long and low so rich spiced juices infuse every grain.', 3050, 3207),
('menu_4', 'pork', 'Springfield Signature Pork Dum', 'Signature Trays', 114.99, 121.99, 'Chef Specialty', 'Slow-braised spiced pork cuts layered on dum in dedicated separate vessels.', 2980, 3137),
('menu_5', 'paneer', 'Royal Shahi Paneer Dum (Veg)', 'Shahi Vegetarian', 89.99, 96.99, 'Shahi Vegetarian', 'Fresh cottage cheese cubes simmered in saffron milk, cashews, and aromatic spices.', 2420, 2577),
('menu_6', 'prawns', 'Jumbo King Tiger Prawns Dum', 'Seafood Specialties', 149.99, 156.99, 'Coastal Gold', 'Succulent jumbo king prawns marinated in coastal spices and saffron basmati.', 2650, 2807);

-- --------------------------------------------------------
-- 3. Table: customers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `address` VARCHAR(255) DEFAULT '',
  `city` VARCHAR(128) DEFAULT 'Springfield',
  `zip_code` VARCHAR(32) DEFAULT '',
  `delivery_instructions` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cust_phone` (`phone`),
  KEY `idx_cust_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table: orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL,
  `order_number` VARCHAR(64) NOT NULL UNIQUE,
  `status` ENUM('pending','confirmed','dum_cooking','preparing','ready','completed','cancelled') DEFAULT 'confirmed',
  `fulfilment_type` ENUM('pickup','delivery') NOT NULL DEFAULT 'pickup',
  `fulfilment_date` VARCHAR(64) NOT NULL,
  `fulfilment_time` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(128) NOT NULL,
  `customer_email` VARCHAR(128) NOT NULL,
  `customer_phone` VARCHAR(64) NOT NULL,
  `customer_address` VARCHAR(255) DEFAULT '',
  `customer_city` VARCHAR(128) DEFAULT '',
  `customer_zip` VARCHAR(32) DEFAULT '',
  `delivery_instructions` TEXT,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(128) DEFAULT 'Instant UPI QR',
  `payment_status` VARCHAR(64) DEFAULT 'pending',
  `special_instructions` TEXT,
  `staff_notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table: order_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `protein_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `aloo` TINYINT(1) DEFAULT 0,
  `extra_spicy` TINYINT(1) DEFAULT 0,
  `notes` TEXT,
  `qty` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `line_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_fk` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table: contact_messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `phone` VARCHAR(64) DEFAULT '',
  `subject` VARCHAR(255) DEFAULT '',
  `message` TEXT NOT NULL,
  `status` VARCHAR(32) DEFAULT 'unread',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table: settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(64) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('orderCutoffHour', '14'),
('deliveryFee', '10.00'),
('alooCharge', '7.00'),
('maxDailyTrays', '25'),
('businessPhone', '417-897-9754'),
('businessEmail', 'sales@jakloud.com'),
('businessAddress', '3625 S Bedford Ave., Springfield, MO 65809');

-- --------------------------------------------------------
-- 8. Table: daily_control
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `daily_control` (
  `control_date` DATE NOT NULL,
  `trays_booked` INT DEFAULT 0,
  `max_capacity` INT DEFAULT 25,
  `is_closed` TINYINT(1) DEFAULT 0,
  `closure_reason` VARCHAR(255) DEFAULT '',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`control_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
