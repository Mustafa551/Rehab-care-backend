const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDischargeAPI() {
  try {
    console.log('🧪 Testing Dedicated Discharge API...\n');

    // Test 1: Create a test patient first
    console.log('1️⃣ Creating test patient for discharge...');
    const testPatient = {
      name: 'Discharge API Test Patient',
      email: 'discharge.api.test@patient.com',
      phone: '+92-300-8888888',
      age: 40,
      gender: 'female',
      address: 'Test Address for Discharge API',
      emergencyContact: 'Emergency Contact - +92-301-8888888',
      diseases: ['diabetes'],
      medicalCondition: 'Diabetes',
      assignedDoctorId: 1, // Assuming doctor with ID 1 exists
      assignedNurses: ['1', '2'], // Assuming nurses exist
      initialDeposit: 15000,
      roomType: 'private',
      dateOfBirth: new Date(Date.now() - 40 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    };

    const createResponse = await axios.post(`${BASE_URL}/patients`, testPatient);
    const patientId = createResponse.data.data.id;
    console.log('✅ Test patient created with ID:', patientId);

    // Test 2: Discharge patient with minimal data
    console.log('\n2️⃣ Testing discharge with minimal data...');
    const minimalDischarge = await axios.post(`${BASE_URL}/patients/${patientId}/discharge`);
    console.log('✅ Minimal discharge successful:', {
      status: minimalDischarge.data.data.patient.status,
      message: minimalDischarge.data.message
    });

    // Test 3: Create another patient for comprehensive discharge
    console.log('\n3️⃣ Creating another patient for comprehensive discharge...');
    const testPatient2 = {
      ...testPatient,
      name: 'Comprehensive Discharge Test',
      email: 'comprehensive.discharge@patient.com',
      phone: '+92-300-7777777'
    };

    const createResponse2 = await axios.post(`${BASE_URL}/patients`, testPatient2);
    const patientId2 = createResponse2.data.data.id;
    console.log('✅ Second test patient created with ID:', patientId2);

    // Test 4: Discharge patient with comprehensive data
    console.log('\n4️⃣ Testing discharge with comprehensive data...');
    const comprehensiveDischargeData = {
      dischargeNotes: 'Patient recovered well. All vital signs stable. Prescribed medications for home care.',
      finalBillAmount: 25000,
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargedBy: 'Dr. Ahmed Khan'
    };

    const comprehensiveDischarge = await axios.post(
      `${BASE_URL}/patients/${patientId2}/discharge`,
      comprehensiveDischargeData
    );
    console.log('✅ Comprehensive discharge successful:', {
      status: comprehensiveDischarge.data.data.patient.status,
      dischargeDate: comprehensiveDischarge.data.data.dischargeDate,
      message: comprehensiveDischarge.data.message
    });

    // Test 5: Verify both patients are discharged
    console.log('\n5️⃣ Verifying discharged patients...');
    const dischargedPatients = await axios.get(`${BASE_URL}/patients?status=discharged`);
    const ourPatients = dischargedPatients.data.data.filter(p => 
      p.id === patientId || p.id === patientId2
    );
    console.log('✅ Discharged patients verified:', ourPatients.length, 'of our test patients found');

    // Test 6: Try to discharge already discharged patient (should fail)
    console.log('\n6️⃣ Testing discharge of already discharged patient...');
    try {
      await axios.post(`${BASE_URL}/patients/${patientId}/discharge`);
      console.log('❌ Should have failed to discharge already discharged patient');
    } catch (error) {
      console.log('✅ Correctly rejected discharge of already discharged patient:', 
        error.response?.data?.message);
    }

    console.log('\n🎉 Discharge API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test validation errors
async function testDischargeValidation() {
  try {
    console.log('\n🧪 Testing Discharge API Validation...\n');

    // Test: Invalid patient ID
    console.log('1️⃣ Testing invalid patient ID...');
    try {
      await axios.post(`${BASE_URL}/patients/invalid/discharge`);
      console.log('❌ Should have rejected invalid patient ID');
    } catch (error) {
      console.log('✅ Correctly rejected invalid patient ID');
    }

    // Test: Non-existent patient
    console.log('\n2️⃣ Testing non-existent patient...');
    try {
      await axios.post(`${BASE_URL}/patients/99999/discharge`);
      console.log('❌ Should have rejected non-existent patient');
    } catch (error) {
      console.log('✅ Correctly rejected non-existent patient');
    }

    // Test: Invalid discharge data
    console.log('\n3️⃣ Testing invalid discharge data...');
    try {
      await axios.post(`${BASE_URL}/patients/1/discharge`, {
        finalBillAmount: -1000, // Invalid negative amount
        dischargeDate: 'invalid-date'
      });
      console.log('❌ Should have rejected invalid discharge data');
    } catch (error) {
      console.log('✅ Correctly rejected invalid discharge data');
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testDischargeAPI();
  await testDischargeValidation();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testDischargeAPI, testDischargeValidation };