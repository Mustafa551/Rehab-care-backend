-- MSSQL Database Setup Script
-- Run this script to create the database and tables

-- Create database (run this as sa user)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'rehabCare_backend')
CREATE DATABASE rehabCare_backend;
GO

USE rehabCare_backend;
GO

-- Create users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) UNIQUE NOT NULL,
  firstName NVARCHAR(255),
  lastName NVARCHAR(255),
  password NVARCHAR(MAX) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Create fcm_tokens table for storing FCM tokens
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='fcm_tokens' AND xtype='U')
CREATE TABLE fcm_tokens (
  id INT IDENTITY(1,1) PRIMARY KEY,
  userId INT NOT NULL,
  deviceId NVARCHAR(255) NOT NULL,
  fcmToken NVARCHAR(MAX) NOT NULL,
  platform NVARCHAR(50),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  CONSTRAINT unique_token UNIQUE (userId, deviceId, fcmToken),
  CONSTRAINT FK_fcm_tokens_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Insert admin user (password: admin123 - will be hashed by the application)
-- Note: This is just for reference, the application will create the admin user automatically
-- with proper password hashing

-- Show tables to confirm creation
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
GO