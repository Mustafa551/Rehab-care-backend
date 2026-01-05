const sql = require('mssql');

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

async function fixNurseReportsTimeColumn() {
  let pool;
  
  try {
    console.log('🔧 Fixing nurse_reports table time column...');
    
    // Connect to database
    pool = await sql.connect(config);
    console.log('✅ Connected to database');
    
    // Check if the column exists and its current type
    console.log('📋 Checking current column type...');
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
        
        // First, let's see if there's any existing data
        const dataCheck = await pool.request().query('SELECT COUNT(*) as count FROM nurse_reports');
        console.log(`   Found ${dataCheck.recordset[0].count} existing records`);
        
        if (dataCheck.recordset[0].count > 0) {
          console.log('📦 Backing up existing time data...');
          
          // Add a temporary column to store converted time values
          await pool.request().query(`
            ALTER TABLE nurse_reports 
            ADD time_temp NVARCHAR(8)
          `);
          
          // Convert existing TIME values to NVARCHAR format
          await pool.request().query(`
            UPDATE nurse_reports 
            SET time_temp = FORMAT(CAST(time AS TIME), 'HH:mm:ss')
          `);
          
          console.log('✅ Existing data backed up to time_temp column');
        }
        
        // Drop the old TIME column
        console.log('🗑️ Dropping old TIME column...');
        await pool.request().query(`
          ALTER TABLE nurse_reports 
          DROP COLUMN time
        `);
        
        // Add the new NVARCHAR(8) column
        console.log('➕ Adding new NVARCHAR(8) time column...');
        await pool.request().query(`
          ALTER TABLE nurse_reports 
          ADD time NVARCHAR(8) NOT NULL DEFAULT '00:00:00'
        `);
        
        if (dataCheck.recordset[0].count > 0) {
          // Copy data back from temp column
          console.log('📋 Restoring data to new time column...');
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
        
        console.log('🎉 Successfully converted time column from TIME to NVARCHAR(8)');
      } else if (currentType.DATA_TYPE === 'nvarchar' && currentType.CHARACTER_MAXIMUM_LENGTH === 8) {
        console.log('✅ Column is already NVARCHAR(8) - no changes needed');
      } else {
        console.log(`⚠️ Unexpected column type: ${currentType.DATA_TYPE}${currentType.CHARACTER_MAXIMUM_LENGTH ? `(${currentType.CHARACTER_MAXIMUM_LENGTH})` : ''}`);
      }
    } else {
      console.log('❌ Time column not found in nurse_reports table');
    }
    
    // Verify the final state
    console.log('🔍 Verifying final column structure...');
    const finalCheck = await pool.request().query(`
      SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'nurse_reports' AND COLUMN_NAME = 'time'
    `);
    
    if (finalCheck.recordset.length > 0) {
      const finalType = finalCheck.recordset[0];
      console.log(`✅ Final column type: ${finalType.DATA_TYPE}(${finalType.CHARACTER_MAXIMUM_LENGTH}) ${finalType.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    }
    
    console.log('🎯 nurse_reports time column fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing nurse_reports time column:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   1. SQL Server is running');
      console.log('   2. Database credentials are correct');
      console.log('   3. Database "RehabCareDB" exists');
    }
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixNurseReportsTimeColumn();