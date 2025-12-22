import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rehabCare_backend',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool: mysql.Pool | null = null;

export const getDb = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return pool;
};

export const connectDb = async (): Promise<void> => {
  try {
    console.log('Starting database connection...');
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    
    await initializeTables();
  } catch (error) {
    console.error('MySQL connection error:', error);
    throw error;
  }
};

const initializeTables = async (): Promise<void> => {
  const database = getDb();

  // Create users table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      password TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create fcm_tokens table for storing FCM tokens
  await database.execute(`
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
    )
  `);

  console.log('Database tables initialized successfully');
};

export const closeDb = async (): Promise<void> => {
  if (!pool) {
    return;
  }
  await pool.end();
  pool = null;
  console.log('Database connection closed');
};

