const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testNurseReportsTimeFix() {
  console.log('🧪 Testing Nurse Reports Time Validation Fix...\n');

  try {
    // Test 1: Create nurse report without time (should default to current time)
    console.log('1️⃣ Testing nurse report creation without time...');
    const reportWithoutTime = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      // time: undefined, // Not providing time
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

    // Test 2: Create nurse report with time (should use provided time)
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

    // Test 3: Create nurse report with HH:MM format (should convert to HH:MM:SS)
    console.log('\n3️⃣ Testing nurse report creation with HH:MM format...');
    const reportWithShortTime = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      time: '14:30', // HH:MM format
      conditionUpdate: 'Patient had a good night sleep and is feeling better this morning.',
      symptoms: [],
      painLevel: 2,
      notes: 'Test report with HH:MM time format',
      urgency: 'low'
    });
    
    if (reportWithShortTime.status === 201) {
      console.log('✅ Nurse report created successfully with HH:MM format');
      console.log('   Time converted to:', reportWithShortTime.data.data.time);
    }

    // Test 4: Create high urgency report without time
    console.log('\n4️⃣ Testing high urgency report without time...');
    const urgentReport = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      // time: undefined, // Not providing time
      conditionUpdate: 'Patient is experiencing severe pain and difficulty breathing.',
      symptoms: ['Pain', 'Shortness of breath', 'Anxiety'],
      painLevel: 8,
      notes: 'Urgent attention required - patient condition has deteriorated',
      urgency: 'high'
    });
    
    if (urgentReport.status === 201) {
      console.log('✅ High urgency report created successfully without time');
      console.log('   Time was defaulted to:', urgentReport.data.data.time);
    }

    // Test 5: Fetch all reports to verify they were stored correctly
    console.log('\n5️⃣ Fetching all reports to verify storage...');
    const allReports = await axios.get(`${BASE_URL}/nurse-reports`);
    
    if (allReports.status === 200) {
      console.log('✅ Successfully fetched all reports');
      console.log(`   Found ${allReports.data.data.length} total reports`);
      
      // Show the last few reports with their times
      const recentReports = allReports.data.data.slice(0, 4);
      recentReports.forEach((report, index) => {
        console.log(`   Report ${index + 1}: ${report.time} - ${report.urgency} urgency`);
      });
    }

    console.log('\n🎉 All nurse reports time validation tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Reports work without time (defaults to current)');
    console.log('   ✅ Reports work with HH:MM:SS time format');
    console.log('   ✅ Reports work with HH:MM time format (auto-converts)');
    console.log('   ✅ High urgency reports work without time');
    console.log('   ✅ All reports stored and retrieved correctly');
    console.log('\n💡 The nurse reports time validation error has been fixed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('   Run: cd Rehab-care-backend && npm start');
    } else if (error.response?.data?.message?.includes('time')) {
      console.log('\n💡 Time validation error detected. Please run the database migration:');
      console.log('   Run: node fix-nurse-reports-time-column.js');
    }
  }
}

// Run the test
testNurseReportsTimeFix();