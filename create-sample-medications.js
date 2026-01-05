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

async function createSampleMedications() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected successfully');

    // Get first patient ID
    const patientResult = await pool.request().query('SELECT TOP 1 id FROM patients WHERE status = \'active\'');
    
    if (patientResult.recordset.length === 0) {
      console.log('No active patients found. Please create a patient first.');
      return;
    }

    const patientId = patientResult.recordset[0].id;
    console.log('Creating medications for patient ID:', patientId);

    // Create sample medications
    const medications = [
      {
        medicationName: 'Paracetamol',
        dosage: '500mg',
        frequency: '3 times daily',
        prescribedBy: 'Dr. Smith'
      },
      {
        medicationName: 'Ibuprofen',
        dosage: '200mg',
        frequency: '2 times daily',
        prescribedBy: 'Dr. Smith'
      },
      {
        medicationName: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Smith'
      }
    ];

    const today = new Date().toISOString().split('T')[0];

    for (const med of medications) {
      // Create medication
      const medResult = await pool.request()
        .input('patientId', sql.Int, patientId)
        .input('prescribedBy', sql.NVarChar, med.prescribedBy)
        .input('medicationName', sql.NVarChar, med.medicationName)
        .input('dosage', sql.NVarChar, med.dosage)
        .input('frequency', sql.NVarChar, med.frequency)
        .input('startDate', sql.Date, new Date(today))
        .query(`
          INSERT INTO medications (patientId, prescribedBy, medicationName, dosage, frequency, startDate, isActive)
          OUTPUT INSERTED.id
          VALUES (@patientId, @prescribedBy, @medicationName, @dosage, @frequency, @startDate, 1)
        `);

      const medicationId = medResult.recordset[0].id;
      console.log(`Created medication: ${med.medicationName} (ID: ${medicationId})`);

      // Create medication administrations for today
      const times = ['08:00', '14:00', '20:00'];
      
      for (let i = 0; i < (med.frequency.includes('3') ? 3 : med.frequency.includes('2') ? 2 : 1); i++) {
        await pool.request()
          .input('medicationId', sql.Int, medicationId)
          .input('patientId', sql.Int, patientId)
          .input('scheduledTime', sql.NVarChar(8), times[i] || '08:00')
          .input('date', sql.Date, new Date(today))
          .query(`
            INSERT INTO medication_administrations (medicationId, patientId, scheduledTime, date, administered)
            VALUES (@medicationId, @patientId, @scheduledTime, @date, 0)
          `);
      }
    }

    console.log('Sample medications and administrations created successfully!');

  } catch (error) {
    console.error('Error creating sample medications:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

createSampleMedications();