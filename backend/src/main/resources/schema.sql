CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_te VARCHAR(150),
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    name_te VARCHAR(200),
    price DECIMAL(10,2) NOT NULL,
    is_veg BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 4,
    occupied BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,            -- DINE_IN or DELIVERY
    room_id INT NULL,
    customer_name VARCHAR(120),
    customer_phone VARCHAR(30),
    address VARCHAR(500),
    payment_method VARCHAR(30),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'NEW',     -- NEW, ACCEPTED, READY, DELIVERED, CANCELLED
    items_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    guests INT NOT NULL,
    booking_time DATETIME NOT NULL,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id INT PRIMARY KEY,
    pin VARCHAR(10) NOT NULL
);
