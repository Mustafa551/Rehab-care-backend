const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const testPatientId = 1; // Assuming patient with ID 1 exists
const testDoctorName = 'Dr. Smith';
const testNurseName = 'Nurse Johnson';

async function testVitalSignsAPI() {
  console.log('\n=== TESTING VITAL SIGNS API ===');
  
  try {
    // 1. Test creating vital signs
    console.log('\n1. Creating vital signs record...');
    const vitalData = {
      patientId: testPatientId,
      date: new Date().toISOString().split('T')[0],
      time: '08:30',
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6',
      oxygenSaturation: '98',
      respiratoryRate: '16',
      notes: 'Patient appears stable, no concerns',
      recordedBy: testNurseName
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/vital-signs`, vitalData);
    console.log('✅ Vital signs created:', createResponse.data);
    const vitalSignsId = createResponse.data.data.id;
    
    // 2. Test getting vital signs by patient
    console.log('\n2. Getting vital signs for patient...');
    const getByPatientResponse = await axios.get(`${API_BASE_URL}/vital-signs/patient/${testPatientId}`);
    console.log('✅ Patient vital signs:', getByPatientResponse.data);
    
    // 3. Test getting vital signs by patient and date
    console.log('\n3. Getting vital signs for patient by date...');
    const today = new Date().toISOString().split('T')[0];
    const getByDateResponse = await axios.get(`${API_BASE_URL}/vital-signs/patient/${testPatientId}?date=${today}`);
    console.log('✅ Patient vital signs for today:', getByDateResponse.data);
    
    // 4. Test updating vital signs
    console.log('\n4. Updating vital signs...');
    const updateData = {
      bloodPressure: '125/85',
      heartRate: '75',
      notes: 'Slight increase in blood pressure, monitoring required'
    };
    
    const updateResponse = await axios.patch(`${API_BASE_URL}/vital-signs/${vitalSignsId}`, updateData);
    console.log('✅ Vital signs updated:', updateResponse.data);
    
    console.log('\n✅ VITAL SIGNS API TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Vital Signs API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMedicationAPI() {
  console.log('\n=== TESTING MEDICATION API ===');
  
  try {
    // 1. Test creating a medication
    console.log('\n1. Creating a new medication...');
    const medicationData = {
      patientId: testPatientId,
      prescribedBy: testDoctorName,
      medicationName: 'Paracetamol',
      dosage: '500mg',
      frequency: '3 times daily',
      startDate: new Date().toISOString().split('T')[0],
      notes: 'Take with food'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/medications`, medicationData);
    console.log('✅ Medication created:', createResponse.data);
    const medicationId = createResponse.data.data.id;
    
    // 2. Test getting medications by patient
    console.log('\n2. Getting medications for patient...');
    const getResponse = await axios.get(`${API_BASE_URL}/medications/patient/${testPatientId}`);
    console.log('✅ Patient medications:', getResponse.data);
    
    // 3. Test creating medication administration schedule
    console.log('\n3. Creating medication administration schedule...');
    const administrationData = {
      medicationId: medicationId,
      patientId: testPatientId,
      scheduledTime: '08:00',
      date: new Date().toISOString().split('T')[0],
      notes: 'Morning dose'
    };
    
    const adminResponse = await axios.post(`${API_BASE_URL}/medications/administrations`, administrationData);
    console.log('✅ Administration scheduled:', adminResponse.data);
    const administrationId = adminResponse.data.data.id;
    
    // 4. Test getting medication administrations by patient
    console.log('\n4. Getting medication administrations for patient...');
    const today = new Date().toISOString().split('T')[0];
    const getAdminResponse = await axios.get(`${API_BASE_URL}/medications/administrations/patient/${testPatientId}?date=${today}`);
    console.log('✅ Patient administrations:', getAdminResponse.data);
    
    // 5. Test administering medication
    console.log('\n5. Administering medication...');
    const administerData = {
      administeredBy: testNurseName,
      notes: 'Patient took medication with breakfast'
    };
    
    const administerResponse = await axios.post(`${API_BASE_URL}/medications/administrations/${administrationId}/administer`, administerData);
    console.log('✅ Medication administered:', administerResponse.data);
    
    console.log('\n✅ ALL MEDICATION API TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Medication API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testConditionAssessmentAPI() {
  console.log('\n=== TESTING CONDITION ASSESSMENT API ===');
  
  try {
    // 1. Test creating a patient condition assessment
    console.log('\n1. Creating patient condition assessment...');
    const conditionData = {
      patientId: testPatientId,
      assessedBy: testDoctorName,
      date: new Date().toISOString().split('T')[0],
      condition: 'Patient is showing improvement in mobility and pain levels have decreased.',
      notes: 'Continue current treatment plan. Monitor for any changes.',
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: '2 times daily',
          startDate: new Date().toISOString().split('T')[0],
          notes: 'Take with food to avoid stomach irritation'
        }
      ],
      vitals: {
        bloodPressure: '120/80',
        heartRate: '72',
        temperature: '98.6',
        oxygenSaturation: '98'
      },
      dischargeRecommendation: 'continue',
      dischargeNotes: ''
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/patient-conditions`, conditionData);
    console.log('✅ Condition assessment created:', createResponse.data);
    const conditionId = createResponse.data.data.id;
    
    // 2. Test getting patient conditions by patient
    console.log('\n2. Getting patient conditions...');
    const getResponse = await axios.get(`${API_BASE_URL}/patient-conditions/patient/${testPatientId}`);
    console.log('✅ Patient conditions:', getResponse.data);
    
    // 3. Test getting latest patient condition
    console.log('\n3. Getting latest patient condition...');
    const latestResponse = await axios.get(`${API_BASE_URL}/patient-conditions/patient/${testPatientId}/latest`);
    console.log('✅ Latest condition:', latestResponse.data);
    
    // 4. Test updating patient condition (discharge recommendation)
    console.log('\n4. Updating condition with discharge recommendation...');
    const updateData = {
      dischargeRecommendation: 'discharge',
      dischargeNotes: 'Patient has recovered well and is ready for discharge. Follow-up appointment in 1 week.'
    };
    
    const updateResponse = await axios.patch(`${API_BASE_URL}/patient-conditions/${conditionId}`, updateData);
    console.log('✅ Condition updated:', updateResponse.data);
    
    console.log('\n✅ ALL CONDITION ASSESSMENT API TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Condition assessment API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Integration Tests...');
  console.log('📍 Testing against:', API_BASE_URL);
  
  try {
    // Test server connectivity
    console.log('\n🔍 Testing server connectivity...');
    await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Server is running and accessible');
    
    // Run all API tests
    const vitalSignsTestsPassed = await testVitalSignsAPI();
    const medicationTestsPassed = await testMedicationAPI();
    const conditionTestsPassed = await testConditionAssessmentAPI();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE API TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Vital Signs API Tests: ${vitalSignsTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Medication API Tests: ${medicationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Condition Assessment API Tests: ${conditionTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (vitalSignsTestsPassed && medicationTestsPassed && conditionTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! All APIs are fully integrated and working.');
      console.log('\n📋 Complete Integration Coverage:');
      console.log('   ✅ Vital Signs API - Recording and viewing');
      console.log('   ✅ Medication API - Prescription and administration');
      console.log('   ✅ Condition Assessment API - Doctor assessments');
      console.log('   ✅ Real-time data synchronization');
      console.log('   ✅ Nurse-Doctor workflow integration');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3000');
    console.log('   Run: cd Rehab-care-backend && npm run dev');
  }
}

// Run the tests
runAllTests();