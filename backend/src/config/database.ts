import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'complaint_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'complaint_portal'}`);
  await connection.query(`USE ${process.env.DB_NAME || 'complaint_portal'}`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User',
      contact_info VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      staff_id INT,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category ENUM('plumbing', 'electrical', 'facility', 'maintenance', 'cleaning', 'security', 'internet', 'parking', 'noise', 'water', 'ac', 'elevator', 'garbage', 'pest', 'lighting', 'heating', 'ventilation', 'fire-safety', 'structural', 'landscaping', 'furniture', 'appliances', 'doors-windows', 'flooring', 'other') NOT NULL,
      status ENUM('Open', 'Assigned', 'In-progress', 'Pending', 'On-hold', 'Rejected', 'Resolved', 'Closed') DEFAULT 'Open',
      attachments VARCHAR(500),
      resolution_notes TEXT,
      feedback_rating INT CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
      feedback_comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // FCM tokens table for push notifications
  await connection.query(`
    CREATE TABLE IF NOT EXISTS fcm_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Notifications table for notification history
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      complaint_id INT,
      type ENUM('status_change', 'assignment', 'feedback', 'system') DEFAULT 'system',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
    )
  `);

  // Chat messages table for in-app messaging
  await connection.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id INT NOT NULL,
      sender_id INT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add location columns to complaints if not exists
  try {
    await connection.query(`ALTER TABLE complaints ADD COLUMN latitude DECIMAL(10, 8) NULL`);
    await connection.query(`ALTER TABLE complaints ADD COLUMN longitude DECIMAL(11, 8) NULL`);
    await connection.query(`ALTER TABLE complaints ADD COLUMN location_address VARCHAR(500) NULL`);
  } catch (e) {
    // Columns may already exist
  }

  // Add address columns to users if not exists
  try {
    await connection.query(`ALTER TABLE users ADD COLUMN address VARCHAR(500) NULL`);
    await connection.query(`ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8) NULL`);
    await connection.query(`ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8) NULL`);
  } catch (e) {
    // Columns may already exist
  }

  await connection.end();
  console.log('Database initialized successfully');
};
