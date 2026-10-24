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
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `price_with_aloo` DECIMAL(10,2) NOT NULL,
  `badge` VARCHAR(128) DEFAULT '',
  `image_url` LONGTEXT DEFAULT NULL,
  `available` TINYINT(1) DEFAULT 1,
  `tray_size` VARCHAR(128) DEFAULT 'Serves 4–5 Diners (Family Handi)',
  `serves` VARCHAR(128) DEFAULT 'Serves 4–5',
  `meat_weight` VARCHAR(128) DEFAULT '',
  `rice_weight` VARCHAR(128) DEFAULT '1.0 kg Raw Aged Basmati',
  `kcal` INT DEFAULT 1700,
  `kcal_aloo` INT DEFAULT 1850,
  `spiciness` VARCHAR(32) DEFAULT 'Medium',
  `daily_limit` INT DEFAULT 10,
  `trays_sold_week` INT DEFAULT 0,
  `is_halal_certified` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `menu_items` 
  (`id`, `protein_id`, `name`, `category`, `description`, `price`, `price_with_aloo`, `badge`, `image_url`, `available`, `tray_size`, `serves`, `meat_weight`, `rice_weight`, `kcal`, `kcal_aloo`, `spiciness`, `daily_limit`, `trays_sold_week`, `is_halal_certified`) 
VALUES
  ('dish-chicken', 'chicken', 'Royal Chicken Dum Biryani', 'Signature Trays', 'Our house flagship slow-cooked Dum biryani. 1.6–1.8 kg marinated bone-in chicken thighs layered with saffron aged basmati rice, fried onions, and roasted cashews, sealed with whole wheat dough.', 101.99, 108.99, 'Top Seller', '', 1, 'Serves 4–5 Diners (Family Handi)', 'Serves 4–5', '1.6 kg Halal Marinated Chicken', '1.0 kg Raw Aged Basmati', 1714, 1871, 'Medium', 12, 48, 1),
  ('dish-mutton', 'mutton', 'Hyderabadi Shahi Mutton Dum Biryani', 'Royal & Occasion', 'The authentic Nizami celebration tray. Succulent bone-in baby goat mutton cuts slow-cooked on dum for 4 hours with heavy saffron, cloves, black cardamom, and pure desi ghee.', 157.99, 164.99, 'Chef Signature', '', 1, 'Serves 4–5 Diners (Feast Tray)', 'Serves 4–5', '1.8 kg Halal Baby Goat Cuts', '1.0 kg Raw Aged Basmati', 2054, 2211, 'Extra Spicy', 8, 34, 1),
  ('dish-beef', 'beef', 'Slow-Braised Spiced Beef Dum Biryani', 'Signature Trays', 'Prime tender beef cuts slow-cooked long and low until caramelized spiced juices settle deeply through every single fragrant basmati grain.', 122.99, 129.99, 'Bold & Hearty', '', 1, 'Serves 4–5 Diners (Family Handi)', 'Serves 4–5', '1.7 kg Halal Prime Beef Cuts', '1.0 kg Raw Aged Basmati', 1952, 2109, 'Medium', 8, 28, 1),
  ('dish-paneer', 'paneer', 'Royal Shahi Paneer Dum Biryani (Veg)', 'Shahi Vegetarian', 'Fresh golden paneer cubes slow-simmered with aromatic saffron gravy, baby potatoes, roasted cashews, caramelized crispy onions, and fresh mint leaves.', 98.99, 105.99, 'Vegetarian Royal', '', 1, 'Serves 4–5 Diners (Veg Handi)', 'Serves 4–5', '1.2 kg Fresh Artisanal Paneer', '1.0 kg Raw Aged Basmati', 1540, 1697, 'Medium', 6, 21, 0),
  ('dish-prawn', 'prawn', 'Jumbo King Tiger Prawn Dum Biryani', 'Seafood Specialties', 'Wild-caught jumbo king tiger prawns seared in coastal roasted spice ghee masala, layered over aromatic yellow basmati, finished with lime zest and star anise.', 139.99, 146.99, 'Coastal Specialty', '', 1, 'Serves 4–5 Diners (Deluxe Handi)', 'Serves 4–5', '1.5 kg Wild Tiger Prawns', '1.0 kg Raw Aged Basmati', 1620, 1777, 'Extra Spicy', 5, 16, 1),
  ('dish-pork', 'pork', 'Springfield Signature Pork Dum Biryani', 'Signature Trays', 'Slow-cooked succulent pork shoulder prepared in dedicated segregated vessels with a deep roasted masala base, desi ghee, fresh mint, and toasted spices.', 108.99, 115.99, 'Segregated Kitchen Vessel', '', 1, 'Serves 4–5 Diners (Family Handi)', 'Serves 4–5', '1.6 kg Pork Shoulder Cuts', '1.0 kg Raw Aged Basmati', 1952, 2109, 'Medium', 6, 19, 0);

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
  `order_id` VARCHAR(64) DEFAULT NULL,
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
  `payment_id` VARCHAR(128) DEFAULT NULL,
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
('preferredContactMethod', 'Email / Phone / Text'),
('businessAddress', '3625 S Bedford Ave., Springfield, MO 65809'),
('pickupAddress', '3625 S Bedford Ave., Springfield, MO 65809'),
('currentLocation', 'Springfield, Missouri'),
('pickupArea', 'Springfield, Missouri'),
('deliveryArea', 'within 10 miles of Springfield from 65809 zip code');

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
