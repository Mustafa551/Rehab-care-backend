const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data matching frontend requirements
const testDoctor = {
  name: 'Ahmed Khan',
  role: 'doctor',
  email: 'ahmed.khan@rehabcare.com',
  phone: '+92-300-1234567',
  isOnDuty: true,
  specialization: 'cardiologist'
};

const testNurse = {
  name: 'Fatima Ali',
  role: 'nurse',
  email: 'fatima.ali@rehabcare.com',
  phone: '0301-9876543',
  isOnDuty: true,
  nurseType: 'bscn'
};

async function testStaffCreation() {
  try {
    console.log('🧪 Testing Staff Creation API...\n');

    // Test 1: Create Doctor
    console.log('1️⃣ Creating Doctor...');
    const doctorResponse = await axios.post(`${BASE_URL}/staff`, testDoctor);
    console.log('✅ Doctor created successfully:', {
      id: doctorResponse.data.data.id,
      name: doctorResponse.data.data.name,
      role: doctorResponse.data.data.role,
      specialization: doctorResponse.data.data.specialization
    });

    // Test 2: Create Nurse
    console.log('\n2️⃣ Creating Nurse...');
    const nurseResponse = await axios.post(`${BASE_URL}/staff`, testNurse);
    console.log('✅ Nurse created successfully:', {
      id: nurseResponse.data.data.id,
      name: nurseResponse.data.data.name,
      role: nurseResponse.data.data.role,
      nurseType: nurseResponse.data.data.nurseType
    });

    // Test 3: Get All Staff
    console.log('\n3️⃣ Fetching All Staff...');
    const allStaffResponse = await axios.get(`${BASE_URL}/staff`);
    console.log('✅ All staff fetched:', allStaffResponse.data.data.length, 'members');

    // Test 4: Get Doctors Only
    console.log('\n4️⃣ Fetching Doctors Only...');
    const doctorsResponse = await axios.get(`${BASE_URL}/staff?role=doctor`);
    console.log('✅ Doctors fetched:', doctorsResponse.data.data.length, 'doctors');

    // Test 5: Get Nurses Only
    console.log('\n5️⃣ Fetching Nurses Only...');
    const nursesResponse = await axios.get(`${BASE_URL}/staff?role=nurse`);
    console.log('✅ Nurses fetched:', nursesResponse.data.data.length, 'nurses');

    console.log('\n🎉 All tests passed! Staff API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Invalid column name')) {
      console.log('\n💡 Solution: The database table needs to be recreated with the new schema.');
      console.log('   Please delete the staff table and restart the server to recreate it.');
    }
  }
}

// Test error cases
async function testValidationErrors() {
  try {
    console.log('\n🧪 Testing Validation Errors...\n');

    // Test: Doctor without specialization
    console.log('1️⃣ Testing doctor without specialization...');
    try {
      await axios.post(`${BASE_URL}/staff`, {
        name: 'Test Doctor',
        role: 'doctor',
        email: 'test@test.com',
        phone: '+92-300-1111111'
      });
    } catch (error) {
      console.log('✅ Correctly rejected doctor without specialization');
    }

    // Test: Invalid phone format
    console.log('\n2️⃣ Testing invalid phone format...');
    try {
      await axios.post(`${BASE_URL}/staff`, {
        name: 'Test Staff',
        role: 'nurse',
        email: 'test2@test.com',
        phone: '123-456-7890' // Invalid format
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid phone format');
    }

    // Test: Invalid role
    console.log('\n3️⃣ Testing invalid role...');
    try {
      await axios.post(`${BASE_URL}/staff`, {
        name: 'Test Staff',
        role: 'caretaker', // Invalid role
        email: 'test3@test.com',
        phone: '+92-300-1111111'
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid role');
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testStaffCreation();
  await testValidationErrors();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testStaffCreation, testValidationErrors };