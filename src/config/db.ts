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

  // Create staff table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff' AND xtype='U')
    CREATE TABLE staff (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(255) NOT NULL,
      role NVARCHAR(50) NOT NULL CHECK (role IN ('nurse', 'doctor')),
      email NVARCHAR(255) UNIQUE NOT NULL,
      phone NVARCHAR(20) NOT NULL,
      isOnDuty BIT DEFAULT 1,
      photoUrl NVARCHAR(MAX),
      specialization NVARCHAR(50) NULL CHECK (specialization IS NULL OR specialization IN ('cardiologist', 'endocrinologist', 'pulmonologist', 'psychiatrist', 'general', 'oncologist', 'neurologist')),
      nurseType NVARCHAR(20) NULL CHECK (nurseType IS NULL OR nurseType IN ('fresh', 'bscn')),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE()
    )
  `);

  // Create patients table - matching frontend exactly
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='patients' AND xtype='U')
    CREATE TABLE patients (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(255) NOT NULL,
      email NVARCHAR(255) UNIQUE NOT NULL,
      phone NVARCHAR(20) NOT NULL,
      dateOfBirth DATE NOT NULL,
      medicalCondition NVARCHAR(MAX) NOT NULL,
      assignedDoctorId INT NULL,
      status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
      -- New comprehensive registration fields
      age INT NULL,
      gender NVARCHAR(10) NULL CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
      address NVARCHAR(MAX) NULL,
      emergencyContact NVARCHAR(255) NULL,
      diseases NVARCHAR(MAX) NULL, -- JSON string of disease IDs
      assignedNurses NVARCHAR(MAX) NULL, -- JSON string of nurse IDs
      initialDeposit DECIMAL(10,2) NULL,
      roomType NVARCHAR(20) NULL CHECK (roomType IS NULL OR roomType IN ('general', 'semi-private', 'private')),
      roomNumber INT NULL,
      admissionDate DATE NULL,
      -- Medical tracking fields
      currentMedications NVARCHAR(MAX) NULL, -- JSON string
      lastAssessmentDate DATE NULL,
      dischargeStatus NVARCHAR(20) NULL CHECK (dischargeStatus IS NULL OR dischargeStatus IN ('continue', 'ready', 'pending')),
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (assignedDoctorId) REFERENCES staff(id) ON DELETE SET NULL
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

