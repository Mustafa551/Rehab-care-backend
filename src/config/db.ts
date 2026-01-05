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
      -- Discharge-specific fields
      dischargeNotes NVARCHAR(MAX) NULL,
      finalBillAmount DECIMAL(10,2) NULL,
      dischargeDate DATE NULL,
      dischargedBy NVARCHAR(100) NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (assignedDoctorId) REFERENCES staff(id) ON DELETE SET NULL
    )
  `);

  // Create vital_signs table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vital_signs' AND xtype='U')
    CREATE TABLE vital_signs (
      id INT IDENTITY(1,1) PRIMARY KEY,
      patientId INT NOT NULL,
      date DATE NOT NULL,
      time NVARCHAR(8) NOT NULL,
      bloodPressure NVARCHAR(20) NOT NULL,
      heartRate NVARCHAR(10) NOT NULL,
      temperature NVARCHAR(10) NOT NULL,
      oxygenSaturation NVARCHAR(10) NULL,
      respiratoryRate NVARCHAR(10) NULL,
      notes NVARCHAR(MAX) NULL,
      recordedBy NVARCHAR(255) NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Create nurse_reports table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='nurse_reports' AND xtype='U')
    CREATE TABLE nurse_reports (
      id INT IDENTITY(1,1) PRIMARY KEY,
      patientId INT NOT NULL,
      reportedBy NVARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      conditionUpdate NVARCHAR(MAX) NOT NULL,
      symptoms NVARCHAR(MAX) NULL, -- JSON string of symptoms
      painLevel INT NULL CHECK (painLevel >= 0 AND painLevel <= 10),
      notes NVARCHAR(MAX) NULL,
      urgency NVARCHAR(10) NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
      reviewedByDoctor BIT DEFAULT 0,
      doctorResponse NVARCHAR(MAX) NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Create patient_conditions table (doctor assessments)
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='patient_conditions' AND xtype='U')
    CREATE TABLE patient_conditions (
      id INT IDENTITY(1,1) PRIMARY KEY,
      patientId INT NOT NULL,
      assessedBy NVARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      condition NVARCHAR(MAX) NOT NULL,
      notes NVARCHAR(MAX) NULL,
      medications NVARCHAR(MAX) NULL, -- JSON string of medications
      vitals NVARCHAR(MAX) NULL, -- JSON string of vital signs
      dischargeRecommendation NVARCHAR(20) DEFAULT 'continue' CHECK (dischargeRecommendation IN ('continue', 'discharge')),
      dischargeNotes NVARCHAR(MAX) NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      updatedAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Create medications table
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medications' AND xtype='U')
    CREATE TABLE medications (
      id INT IDENTITY(1,1) PRIMARY KEY,
      patientId INT NOT NULL,
      prescribedBy NVARCHAR(255) NOT NULL,
      medicationName NVARCHAR(255) NOT NULL,
      dosage NVARCHAR(100) NOT NULL,
      frequency NVARCHAR(100) NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NULL,
      notes NVARCHAR(MAX) NULL,
      isActive BIT DEFAULT 1,
      createdAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Create medication_administrations table with proper foreign key constraints
  await database.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medication_administrations' AND xtype='U')
    CREATE TABLE medication_administrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      medicationId INT NOT NULL,
      patientId INT NOT NULL,
      scheduledTime NVARCHAR(8) NOT NULL,
      administeredTime NVARCHAR(8) NULL,
      administered BIT DEFAULT 0,
      administeredBy NVARCHAR(255) NULL,
      notes NVARCHAR(MAX) NULL,
      date DATE NOT NULL,
      createdAt DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (medicationId) REFERENCES medications(id) ON DELETE CASCADE,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE NO ACTION
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

