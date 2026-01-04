const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data matching frontend comprehensive registration
const testPatient = {
  // Personal Information
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@patient.com',
  phone: '+92-300-1234567',
  age: 45,
  gender: 'male',
  address: 'House 123, Street 45, Gulberg III, Lahore, Punjab, Pakistan',
  emergencyContact: 'Fatima Hassan - +92-301-9876543',
  
  // Medical Information
  diseases: ['diabetes', 'blood-pressure'],
  medicalCondition: 'Diabetes, Blood Pressure',
  
  // Assignments
  assignedDoctorId: 1, // Assuming doctor with ID 1 exists
  assignedNurses: ['1', '2'], // Assuming nurses with IDs 1 and 2 exist
  
  // Financial
  initialDeposit: 50000,
  
  // Accommodation
  roomType: 'semi-private',
  roomNumber: 205,
  admissionDate: new Date().toISOString().split('T')[0],
  
  // Legacy fields for compatibility
  dateOfBirth: new Date(Date.now() - 45 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'active'
};

const testPatientMinimal = {
  name: 'Sara Ali',
  email: 'sara.ali@patient.com',
  phone: '0301-7654321',
  age: 28,
  gender: 'female',
  address: 'Flat 45, Block B, DHA Phase 5, Karachi, Sindh, Pakistan',
  emergencyContact: 'Ali Hassan - 0302-1234567',
  diseases: ['fever', 'asthma'],
  medicalCondition: 'Fever, Asthma',
  assignedDoctorId: 2,
  assignedNurses: ['3', '4'],
  initialDeposit: 25000,
  roomType: 'general',
  dateOfBirth: new Date(Date.now() - 28 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'active'
};

async function testPatientRegistration() {
  try {
    console.log('🧪 Testing Patient Registration API...\n');

    // Test 1: Create Comprehensive Patient
    console.log('1️⃣ Creating Comprehensive Patient Registration...');
    const patientResponse = await axios.post(`${BASE_URL}/patients`, testPatient);
    console.log('✅ Patient registered successfully:', {
      id: patientResponse.data.data.id,
      name: patientResponse.data.data.name,
      age: patientResponse.data.data.age,
      gender: patientResponse.data.data.gender,
      diseases: patientResponse.data.data.diseases,
      initialDeposit: patientResponse.data.data.initialDeposit,
      roomType: patientResponse.data.data.roomType
    });

    // Test 2: Create Minimal Patient
    console.log('\n2️⃣ Creating Minimal Patient Registration...');
    const minimalResponse = await axios.post(`${BASE_URL}/patients`, testPatientMinimal);
    console.log('✅ Minimal patient registered successfully:', {
      id: minimalResponse.data.data.id,
      name: minimalResponse.data.data.name,
      age: minimalResponse.data.data.age,
      roomType: minimalResponse.data.data.roomType
    });

    // Test 3: Get All Patients
    console.log('\n3️⃣ Fetching All Patients...');
    const allPatientsResponse = await axios.get(`${BASE_URL}/patients`);
    console.log('✅ All patients fetched:', allPatientsResponse.data.data.length, 'patients');

    // Test 4: Get Patient by ID
    console.log('\n4️⃣ Fetching Patient by ID...');
    const patientByIdResponse = await axios.get(`${BASE_URL}/patients/${patientResponse.data.data.id}`);
    console.log('✅ Patient fetched by ID:', {
      name: patientByIdResponse.data.data.name,
      diseases: patientByIdResponse.data.data.diseases,
      assignedNurses: patientByIdResponse.data.data.assignedNurses
    });

    // Test 5: Update Patient
    console.log('\n5️⃣ Updating Patient...');
    const updateData = {
      initialDeposit: 75000,
      roomType: 'private',
      dischargeStatus: 'continue'
    };
    const updateResponse = await axios.put(`${BASE_URL}/patients/${patientResponse.data.data.id}`, updateData);
    console.log('✅ Patient updated successfully:', {
      initialDeposit: updateResponse.data.data.initialDeposit,
      roomType: updateResponse.data.data.roomType,
      dischargeStatus: updateResponse.data.data.dischargeStatus
    });

    console.log('\n🎉 All patient registration tests passed! API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Invalid column name')) {
      console.log('\n💡 Solution: The database table needs to be recreated with the new schema.');
      console.log('   Please delete the patients table and restart the server to recreate it.');
    }
  }
}

// Test validation errors
async function testPatientValidationErrors() {
  try {
    console.log('\n🧪 Testing Patient Validation Errors...\n');

    // Test: Missing required fields
    console.log('1️⃣ Testing missing required fields...');
    try {
      await axios.post(`${BASE_URL}/patients`, {
        name: 'Test Patient',
        email: 'test@test.com'
        // Missing required fields
      });
    } catch (error) {
      console.log('✅ Correctly rejected patient with missing required fields');
    }

    // Test: Invalid phone format
    console.log('\n2️⃣ Testing invalid phone format...');
    try {
      await axios.post(`${BASE_URL}/patients`, {
        ...testPatientMinimal,
        phone: '123-456-7890' // Invalid format
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid phone format');
    }

    // Test: Invalid nurse assignment
    console.log('\n3️⃣ Testing invalid nurse assignment...');
    try {
      await axios.post(`${BASE_URL}/patients`, {
        ...testPatientMinimal,
        assignedNurses: ['1'] // Only 1 nurse instead of 2
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid nurse assignment');
    }

    // Test: Invalid age
    console.log('\n4️⃣ Testing invalid age...');
    try {
      await axios.post(`${BASE_URL}/patients`, {
        ...testPatientMinimal,
        age: 150 // Invalid age
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid age');
    }

    // Test: Invalid initial deposit
    console.log('\n5️⃣ Testing invalid initial deposit...');
    try {
      await axios.post(`${BASE_URL}/patients`, {
        ...testPatientMinimal,
        initialDeposit: -1000 // Negative deposit
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid initial deposit');
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testPatientRegistration();
  await testPatientValidationErrors();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testPatientRegistration, testPatientValidationErrors };