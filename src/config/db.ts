import sql from 'mssql';
import { hashPassword } from '../utils/helper';

const dbConfig: sql.config = {
  server: process.env.DB_HOST || 'DESKTOP-0JS10FN\\SQLEXPRESS',
  database: process.env.DB_NAME || 'RehabCare',
  port: parseInt(process.env.DB_PORT || '1433'),
  user:'rehabUser',
  password: 'Password123!',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // Set to true if using Azure SQL
    trustServerCertificate: true, // Set to false in production
    trustedConnection: true // Use Windows Authentication
  }
};

let pool: sql.ConnectionPool | null = null;

export const getDb = (): sql.ConnectionPool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return pool;
};

export const connectDb = async (): Promise<void> => {
  try {
    console.log('Starting database connection...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    
    console.log('Successfully connected to MSSQL database');
    
    await initializeTables();
  } catch (error) {
    console.error('MSSQL connection error:', error);
    throw error;
  }
};

const initializeTables = async (): Promise<void> => {
  const database = getDb();

  // Create users table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
      id INT IDENTITY(1,1) PRIMARY KEY,
      email NVARCHAR(255) UNIQUE NOT NULL,
      firstName NVARCHAR(255),
      lastName NVARCHAR(255),
      password NVARCHAR(MAX) NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE()
    )
  `);

  // Create FCM tokens table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='fcm_tokens' AND xtype='U')
    CREATE TABLE fcm_tokens (
      id INT IDENTITY(1,1) PRIMARY KEY,
      userId INT NOT NULL,
      deviceId NVARCHAR(255) NOT NULL,
      fcmToken NVARCHAR(MAX) NOT NULL,
      platform NVARCHAR(50),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create staff table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff' AND xtype='U')
    CREATE TABLE staff (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(255) NOT NULL,
      role NVARCHAR(50) NOT NULL CHECK (role IN ('nurse', 'caretaker', 'therapist', 'doctor')),
      email NVARCHAR(255) UNIQUE NOT NULL,
      phone NVARCHAR(20) NOT NULL,
      isOnDuty BIT DEFAULT 1,
      photoUrl NVARCHAR(MAX),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE()
    )
  `);

  // Create admin user if it doesn't exist
  await createAdminUser();

  console.log('Database tables initialized successfully');
};

const createAdminUser = async (): Promise<void> => {
  const database = getDb();
  
  // Check if admin user already exists
  const request = database.request();
  request.input('email', sql.NVarChar, 'admin@rehab.com');
  const result = await request.query('SELECT * FROM users WHERE email = @email');
  
  if (result.recordset.length === 0) {
    // Create admin user
    const hashedPassword = await hashPassword('Admin12345!');
    const adminRequest = database.request();
    adminRequest.input('email', sql.NVarChar, 'admin@rehab.com');
    adminRequest.input('firstName', sql.NVarChar, 'Rehab');
    adminRequest.input('lastName', sql.NVarChar, 'Admin');
    adminRequest.input('password', sql.NVarChar, hashedPassword);
    
    await adminRequest.query(`
      INSERT INTO users (email, firstName, lastName, password)
      VALUES (@email, @firstName, @lastName, @password)
    `);
    
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
};

export const closeDb = async (): Promise<void> => {
  if (!pool) {
    return;
  }
  await pool.close();
  pool = null;
  console.log('Database connection closed');
};

