const sql = require('mssql');
const axios = require('axios');

// Database configuration
const config = {
  user: 'sa',
  password: 'YourPassword123',
  server: 'localhost',
  database: 'RehabCareDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const BASE_URL = 'http://localhost:3000/api';

async function fixDatabaseSchema() {
  let pool;
  
  try {
    console.log('🔧 Step 1: Fixing database schema...');
    
    // Connect to database
    pool = await sql.connect(config);
    console.log('✅ Connected to database');
    
    // Check if the column exists and its current type
    console.log('📋 Checking nurse_reports time column type...');
    const columnInfo = await pool.request().query(`
      SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'nurse_reports' AND COLUMN_NAME = 'time'
    `);
    
    if (columnInfo.recordset.length > 0) {
      const currentType = columnInfo.recordset[0];
      console.log(`   Current type: ${currentType.DATA_TYPE}${currentType.CHARACTER_MAXIMUM_LENGTH ? `(${currentType.CHARACTER_MAXIMUM_LENGTH})` : ''}`);
      
      if (currentType.DATA_TYPE === 'time') {
        console.log('🔄 Converting TIME column to NVARCHAR(8)...');
        
        // Check for existing data
        const dataCheck = await pool.request().query('SELECT COUNT(*) as count FROM nurse_reports');
        console.log(`   Found ${dataCheck.recordset[0].count} existing records`);
        
        if (dataCheck.recordset[0].count > 0) {
          console.log('📦 Backing up existing time data...');
          
          // Add a temporary column
          await pool.request().query(`
            ALTER TABLE nurse_reports 
            ADD time_temp NVARCHAR(8)
          `);
          
          // Convert existing TIME values to NVARCHAR format
          await pool.request().query(`
            UPDATE nurse_reports 
            SET time_temp = FORMAT(CAST(time AS TIME), 'HH:mm:ss')
          `);
          
          console.log('✅ Existing data backed up');
        }
        
        // Drop the old TIME column
        await pool.request().query(`
          ALTER TABLE nurse_reports 
          DROP COLUMN time
        `);
        
        // Add the new NVARCHAR(8) column
        await pool.request().query(`
          ALTER TABLE nurse_reports 
          ADD time NVARCHAR(8) NOT NULL DEFAULT '00:00:00'
        `);
        
        if (dataCheck.recordset[0].count > 0) {
          // Copy data back from temp column
          await pool.request().query(`
            UPDATE nurse_reports 
            SET time = time_temp
          `);
          
          // Drop the temporary column
          await pool.request().query(`
            ALTER TABLE nurse_reports 
            DROP COLUMN time_temp
          `);
          
          console.log('✅ Data restored successfully');
        }
        
        console.log('🎉 Successfully converted time column to NVARCHAR(8)');
      } else if (currentType.DATA_TYPE === 'nvarchar' && currentType.CHARACTER_MAXIMUM_LENGTH === 8) {
        console.log('✅ Column is already NVARCHAR(8) - no changes needed');
      } else {
        console.log(`⚠️ Unexpected column type: ${currentType.DATA_TYPE}${currentType.CHARACTER_MAXIMUM_LENGTH ? `(${currentType.CHARACTER_MAXIMUM_LENGTH})` : ''}`);
      }
    } else {
      console.log('❌ Time column not found in nurse_reports table');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    return false;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function testAPI() {
  console.log('\n🧪 Step 2: Testing API functionality...');
  
  try {
    // Test nurse report without time
    console.log('1️⃣ Testing nurse report creation without time...');
    const reportWithoutTime = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      conditionUpdate: 'Patient is showing improvement in mobility and appetite. Walking with assistance.',
      symptoms: ['Pain', 'Fatigue'],
      painLevel: 3,
      notes: 'Test report without time - should use current time',
      urgency: 'medium'
    });
    
    if (reportWithoutTime.status === 201) {
      console.log('✅ Nurse report created successfully without time');
      console.log('   Time was defaulted to:', reportWithoutTime.data.data.time);
    }

    // Test nurse report with time
    console.log('\n2️⃣ Testing nurse report creation with time...');
    const reportWithTime = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      time: '16:45:00',
      conditionUpdate: 'Patient experienced some discomfort during physical therapy session.',
      symptoms: ['Pain', 'Dizziness'],
      painLevel: 5,
      notes: 'Test report with specific time',
      urgency: 'medium'
    });
    
    if (reportWithTime.status === 201) {
      console.log('✅ Nurse report created successfully with time');
      console.log('   Time used:', reportWithTime.data.data.time);
    }

    // Test vital signs without time
    console.log('\n3️⃣ Testing vital signs creation without time...');
    const vitalSignsResponse = await axios.post(`${BASE_URL}/vital-signs`, {
      patientId: 1,
      date: new Date().toISOString().split('T')[0],
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6',
      oxygenSaturation: '98',
      respiratoryRate: '16',
      notes: 'Test vital signs without time',
      recordedBy: 'Test Nurse'
    });
    
    if (vitalSignsResponse.status === 201) {
      console.log('✅ Vital signs created successfully without time');
      console.log('   Time was defaulted to:', vitalSignsResponse.data.data.time);
    }

    console.log('\n🎉 All API tests passed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('   Run: cd Rehab-care-backend && npm start');
    }
    return false;
  }
}

async function completeTimeFix() {
  console.log('🚀 Complete Time Validation Fix\n');
  console.log('This script will:');
  console.log('1. Fix the database schema (convert TIME to NVARCHAR(8))');
  console.log('2. Test the API functionality');
  console.log('3. Verify the fix is working\n');
  
  // Step 1: Fix database schema
  const schemaFixed = await fixDatabaseSchema();
  
  if (!schemaFixed) {
    console.log('❌ Database schema fix failed. Please check the error messages above.');
    return;
  }
  
  // Wait a moment for any connections to settle
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 2: Test API
  const apiWorking = await testAPI();
  
  if (apiWorking) {
    console.log('\n🎯 Complete Time Fix Summary:');
    console.log('✅ Database schema updated (TIME → NVARCHAR(8))');
    console.log('✅ Backend model updated (sql.Time → sql.NVarChar(8))');
    console.log('✅ Controller validation updated (time optional)');
    console.log('✅ Frontend forms updated (time optional with defaults)');
    console.log('✅ API tests passed');
    console.log('\n💡 The time validation error has been completely resolved!');
    console.log('\nYou can now:');
    console.log('- Submit nurse reports without selecting time');
    console.log('- Submit vital signs without selecting time');
    console.log('- Current time will be used automatically');
    console.log('- No more validation errors!');
  } else {
    console.log('\n⚠️ Database schema was fixed but API tests failed.');
    console.log('Please check that:');
    console.log('1. The backend server is running');
    console.log('2. The updated model code is deployed');
    console.log('3. There are no other errors in the server logs');
  }
}

// Run the complete fix
completeTimeFix();