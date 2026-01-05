const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const testPatientId = 1; // Assuming patient with ID 1 exists
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
    
    // 2. Test getting all vital signs
    console.log('\n2. Getting all vital signs...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/vital-signs`);
    console.log('✅ All vital signs:', getAllResponse.data);
    
    // 3. Test getting vital signs by patient
    console.log('\n3. Getting vital signs for patient...');
    const getByPatientResponse = await axios.get(`${API_BASE_URL}/vital-signs/patient/${testPatientId}`);
    console.log('✅ Patient vital signs:', getByPatientResponse.data);
    
    // 4. Test getting vital signs by patient and date
    console.log('\n4. Getting vital signs for patient by date...');
    const today = new Date().toISOString().split('T')[0];
    const getByDateResponse = await axios.get(`${API_BASE_URL}/vital-signs/patient/${testPatientId}?date=${today}`);
    console.log('✅ Patient vital signs for today:', getByDateResponse.data);
    
    // 5. Test getting vital signs by ID
    console.log('\n5. Getting vital signs by ID...');
    const getByIdResponse = await axios.get(`${API_BASE_URL}/vital-signs/${vitalSignsId}`);
    console.log('✅ Vital signs by ID:', getByIdResponse.data);
    
    // 6. Test updating vital signs
    console.log('\n6. Updating vital signs...');
    const updateData = {
      bloodPressure: '125/85',
      heartRate: '75',
      notes: 'Slight increase in blood pressure, monitoring required'
    };
    
    const updateResponse = await axios.patch(`${API_BASE_URL}/vital-signs/${vitalSignsId}`, updateData);
    console.log('✅ Vital signs updated:', updateResponse.data);
    
    // 7. Test creating another vital signs record (different time)
    console.log('\n7. Creating second vital signs record...');
    const vitalData2 = {
      patientId: testPatientId,
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      bloodPressure: '118/78',
      heartRate: '70',
      temperature: '98.4',
      oxygenSaturation: '99',
      respiratoryRate: '15',
      notes: 'Improvement noted, patient responding well to treatment',
      recordedBy: testNurseName
    };
    
    const createResponse2 = await axios.post(`${API_BASE_URL}/vital-signs`, vitalData2);
    console.log('✅ Second vital signs created:', createResponse2.data);
    
    // 8. Test getting updated patient vital signs (should show both records)
    console.log('\n8. Getting updated patient vital signs...');
    const getFinalResponse = await axios.get(`${API_BASE_URL}/vital-signs/patient/${testPatientId}?date=${today}`);
    console.log('✅ Final patient vital signs:', getFinalResponse.data);
    
    console.log('\n✅ ALL VITAL SIGNS API TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Vital Signs API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testVitalSignsValidation() {
  console.log('\n=== TESTING VITAL SIGNS VALIDATION ===');
  
  try {
    // Test missing required fields
    console.log('\n1. Testing validation - missing required fields...');
    try {
      await axios.post(`${API_BASE_URL}/vital-signs`, {
        patientId: testPatientId,
        date: new Date().toISOString().split('T')[0]
        // Missing required fields
      });
      console.log('❌ Should have failed validation');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected missing fields:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test invalid time format
    console.log('\n2. Testing validation - invalid time format...');
    try {
      await axios.post(`${API_BASE_URL}/vital-signs`, {
        patientId: testPatientId,
        date: new Date().toISOString().split('T')[0],
        time: '25:70', // Invalid time
        bloodPressure: '120/80',
        heartRate: '72',
        temperature: '98.6',
        recordedBy: testNurseName
      });
      console.log('❌ Should have failed time validation');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected invalid time:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test invalid patient ID
    console.log('\n3. Testing validation - invalid patient ID...');
    try {
      await axios.post(`${API_BASE_URL}/vital-signs`, {
        patientId: 'invalid',
        date: new Date().toISOString().split('T')[0],
        time: '08:30',
        bloodPressure: '120/80',
        heartRate: '72',
        temperature: '98.6',
        recordedBy: testNurseName
      });
      console.log('❌ Should have failed patient ID validation');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected invalid patient ID:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ ALL VITAL SIGNS VALIDATION TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Vital Signs validation test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllVitalSignsTests() {
  console.log('🚀 Starting Vital Signs API Integration Tests...');
  console.log('📍 Testing against:', API_BASE_URL);
  
  try {
    // Test server connectivity
    console.log('\n🔍 Testing server connectivity...');
    await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Server is running and accessible');
    
    // Run vital signs API tests
    const apiTestsPassed = await testVitalSignsAPI();
    
    // Run validation tests
    const validationTestsPassed = await testVitalSignsValidation();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VITAL SIGNS API TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`API Functionality Tests: ${apiTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Validation Tests: ${validationTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (apiTestsPassed && validationTestsPassed) {
      console.log('\n🎉 ALL VITAL SIGNS TESTS PASSED! API is fully integrated and working.');
      console.log('\n📋 Test Coverage:');
      console.log('   ✅ Create vital signs records');
      console.log('   ✅ Get all vital signs');
      console.log('   ✅ Get vital signs by patient');
      console.log('   ✅ Get vital signs by patient and date');
      console.log('   ✅ Get vital signs by ID');
      console.log('   ✅ Update vital signs');
      console.log('   ✅ Input validation');
      console.log('   ✅ Error handling');
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
runAllVitalSignsTests();