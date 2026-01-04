const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPatientDischarge() {
  try {
    console.log('🧪 Testing Patient Discharge Functionality...\n');

    // Test 1: Create a test patient first
    console.log('1️⃣ Creating test patient...');
    const testPatient = {
      name: 'Test Discharge Patient',
      email: 'test.discharge@patient.com',
      phone: '+92-300-9999999',
      age: 35,
      gender: 'male',
      address: 'Test Address for Discharge',
      emergencyContact: 'Emergency Contact - +92-301-9999999',
      diseases: ['fever'],
      medicalCondition: 'Fever',
      assignedDoctorId: 1, // Assuming doctor with ID 1 exists
      assignedNurses: ['1', '2'], // Assuming nurses exist
      initialDeposit: 10000,
      roomType: 'general',
      dateOfBirth: new Date(Date.now() - 35 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    };

    const createResponse = await axios.post(`${BASE_URL}/patients`, testPatient);
    const patientId = createResponse.data.data.id;
    console.log('✅ Test patient created with ID:', patientId);

    // Test 2: Update patient discharge status
    console.log('\n2️⃣ Testing discharge status update...');
    const dischargeUpdate = {
      dischargeStatus: 'ready',
      status: 'active' // Keep active until final discharge
    };

    const updateResponse = await axios.put(`${BASE_URL}/patients/${patientId}`, dischargeUpdate);
    console.log('✅ Discharge status updated:', {
      dischargeStatus: updateResponse.data.data.dischargeStatus,
      status: updateResponse.data.data.status
    });

    // Test 3: Final discharge (change status to discharged)
    console.log('\n3️⃣ Testing final discharge...');
    const finalDischarge = {
      status: 'discharged',
      dischargeStatus: 'ready'
    };

    const dischargeResponse = await axios.put(`${BASE_URL}/patients/${patientId}`, finalDischarge);
    console.log('✅ Patient discharged:', {
      status: dischargeResponse.data.data.status,
      dischargeStatus: dischargeResponse.data.data.dischargeStatus
    });

    // Test 4: Verify patient data
    console.log('\n4️⃣ Verifying discharged patient data...');
    const verifyResponse = await axios.get(`${BASE_URL}/patients/${patientId}`);
    console.log('✅ Patient data verified:', {
      name: verifyResponse.data.data.name,
      status: verifyResponse.data.data.status,
      dischargeStatus: verifyResponse.data.data.dischargeStatus,
      diseases: verifyResponse.data.data.diseases,
      initialDeposit: verifyResponse.data.data.initialDeposit
    });

    // Test 5: Get all discharged patients
    console.log('\n5️⃣ Testing discharged patients filter...');
    const dischargedResponse = await axios.get(`${BASE_URL}/patients?status=discharged`);
    console.log('✅ Discharged patients found:', dischargedResponse.data.data.length);
    
    const ourPatient = dischargedResponse.data.data.find(p => p.id === patientId);
    if (ourPatient) {
      console.log('✅ Our test patient found in discharged list');
    } else {
      console.log('❌ Our test patient not found in discharged list');
    }

    console.log('\n🎉 Patient discharge tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Invalid parameter')) {
      console.log('\n💡 Check if the patient update validation allows dischargeStatus field');
    }
  }
}

// Test validation errors
async function testDischargeValidation() {
  try {
    console.log('\n🧪 Testing Discharge Validation...\n');

    // Test: Invalid discharge status
    console.log('1️⃣ Testing invalid discharge status...');
    try {
      await axios.put(`${BASE_URL}/patients/1`, {
        dischargeStatus: 'invalid-status'
      });
      console.log('❌ Should have rejected invalid discharge status');
    } catch (error) {
      console.log('✅ Correctly rejected invalid discharge status');
    }

    // Test: Invalid patient status
    console.log('\n2️⃣ Testing invalid patient status...');
    try {
      await axios.put(`${BASE_URL}/patients/1`, {
        status: 'invalid-status'
      });
      console.log('❌ Should have rejected invalid patient status');
    } catch (error) {
      console.log('✅ Correctly rejected invalid patient status');
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testPatientDischarge();
  await testDischargeValidation();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testPatientDischarge, testDischargeValidation };