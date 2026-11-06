CREATE DATABASE IF NOT EXISTS portofolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portofolio_db;

-- Hero Title & Description
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Pengalaman / Proyek
CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VACHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Keahlian
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Init seed data
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero_title', 'Software Engineer & Game Developer'),
('hero_description', 'Makan Seblak')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO skills (name, category) VALUES
('PHP', 'Backend'),
('MqSQL', 'Database'),
('React', 'Frontend')
ON DUPLICATE KEY UPDATE name = VALUES(name);