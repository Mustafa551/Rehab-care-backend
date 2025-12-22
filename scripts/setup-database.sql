-- MySQL Database Setup Script
-- Run this script to create the database and tables

-- Create database (run this as root user)
CREATE DATABASE IF NOT EXISTS rehabCare_backend;
USE action_backend;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create fcm_tokens table for storing FCM tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  deviceId VARCHAR(255) NOT NULL,
  fcmToken TEXT NOT NULL,
  platform VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_token (userId, deviceId, fcmToken(255)),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Show tables to confirm creation
SHOW TABLES;