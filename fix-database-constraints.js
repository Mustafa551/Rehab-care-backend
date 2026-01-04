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

async function fixDatabaseConstraints() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected successfully');

    // Drop the problematic table if it exists
    console.log('Dropping medication_administrations table if exists...');
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='medication_administrations' AND xtype='U')
      DROP TABLE medication_administrations
    `);

    // Recreate the table with proper constraints
    console.log('Creating medication_administrations table with fixed constraints...');
    await pool.request().query(`
      CREATE TABLE medication_administrations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        medicationId INT NOT NULL,
        patientId INT NOT NULL,
        scheduledTime TIME NOT NULL,
        administeredTime TIME NULL,
        administered BIT DEFAULT 0,
        administeredBy NVARCHAR(255) NULL,
        notes NVARCHAR(MAX) NULL,
        date DATE NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (medicationId) REFERENCES medications(id) ON DELETE CASCADE,
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE NO ACTION
      )
    `);

    console.log('Database constraints fixed successfully!');
  } catch (error) {
    console.error('Error fixing database constraints:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

fixDatabaseConstraints();