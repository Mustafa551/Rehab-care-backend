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

async function fixMedicationTimeColumns() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected successfully');

    // Check if medication_administrations table exists
    const checkTable = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'medication_administrations'
    `);

    if (checkTable.recordset.length > 0) {
      console.log('Updating medication_administrations table time columns...');
      
      // Alter the scheduledTime column from TIME to NVARCHAR(8)
      await pool.request().query(`
        ALTER TABLE medication_administrations 
        ALTER COLUMN scheduledTime NVARCHAR(8) NOT NULL
      `);
      
      // Alter the administeredTime column from TIME to NVARCHAR(8)
      await pool.request().query(`
        ALTER TABLE medication_administrations 
        ALTER COLUMN administeredTime NVARCHAR(8) NULL
      `);
      
      console.log('Time columns updated successfully!');
    } else {
      console.log('medication_administrations table does not exist, will be created with correct schema');
    }

  } catch (error) {
    console.error('Error fixing medication time columns:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

fixMedicationTimeColumns();