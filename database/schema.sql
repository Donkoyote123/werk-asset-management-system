-- WERK Asset Management System Database Schema
-- Compatible with MySQL/MariaDB for InfinityFree hosting

CREATE DATABASE IF NOT EXISTS werk_assets;
USE werk_assets;

-- Users table for all system users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    official_email VARCHAR(100) UNIQUE NOT NULL,
    system_username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('system_admin', 'asset_manager', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Asset categories table
CREATE TABLE asset_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    tag_number VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('available', 'assigned', 'returned', 'maintenance', 'retired') DEFAULT 'available',
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE RESTRICT
);

-- Asset assignments table (tracks current and historical assignments)
CREATE TABLE asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_by INT NOT NULL,
    date_assigned DATE NOT NULL,
    date_returned DATE NULL,
    return_condition TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- System logs table for audit trail
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default asset categories
INSERT INTO asset_categories (name, description) VALUES
('Laptops', 'Desktop and laptop computers'),
('Mobile Devices', 'Smartphones and tablets'),
('Peripherals', 'Keyboards, mice, monitors, etc.'),
('Network Equipment', 'Routers, switches, access points'),
('Office Equipment', 'Printers, scanners, projectors'),
('Furniture', 'Desks, chairs, cabinets'),
('Software Licenses', 'Software applications and licenses'),
('Vehicles', 'Company vehicles and equipment');

-- Insert default system admin user
INSERT INTO users (name, id_number, official_email, system_username, password_hash, role) VALUES
('System Administrator', 'ADMIN001', 'admin@werk.com', 'Admin.Asset@werk', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'system_admin');

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assignments_active ON asset_assignments(is_active);
CREATE INDEX idx_assignments_user ON asset_assignments(user_id);
CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_created ON system_logs(created_at);
