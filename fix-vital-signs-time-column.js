const sql = require('mssql');

const dbConfig = {
  server: 'DESKTOP-0JS10FN\\SQLEXPRESS',
  database: 'RehabCare',
  port: 1433,
  user: 'rehabUser',
  password: 'Password123!',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true
  }
};

async function fixVitalSignsTimeColumn() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected successfully');

    // Check if vital_signs table exists
    const checkTable = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'vital_signs'
    `);

    if (checkTable.recordset.length > 0) {
      console.log('Updating vital_signs table time column...');
      
      // Alter the time column from TIME to NVARCHAR(8)
      await pool.request().query(`
        ALTER TABLE vital_signs 
        ALTER COLUMN time NVARCHAR(8) NOT NULL
      `);
      
      console.log('Time column updated successfully!');
    } else {
      console.log('vital_signs table does not exist, will be created with correct schema');
    }

  } catch (error) {
    console.error('Error fixing vital signs time column:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

fixVitalSignsTimeColumn();