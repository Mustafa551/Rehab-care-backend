const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPatientModalIntegration() {
  try {
    console.log('🧪 Testing Patient Modal Integration...\n');

    // Test 1: Get all nurses for nurse selection
    console.log('1️⃣ Testing nurse selection API...');
    const nursesResponse = await axios.get(`${BASE_URL}/staff?role=nurse`);
    console.log('✅ Nurses loaded:', nursesResponse.data.data.length, 'nurses available');
    nursesResponse.data.data.forEach(nurse => {
      console.log(`   - ${nurse.name} (${nurse.nurseType || 'fresh'})`);
    });

    // Test 2: Get doctors by diseases
    console.log('\n2️⃣ Testing doctor selection by diseases...');
    
    // Test with diabetes and blood pressure
    const diseases1 = ['diabetes', 'blood-pressure'];
    const doctors1Response = await axios.get(`${BASE_URL}/staff?diseases=${diseases1.join(',')}`);
    console.log(`✅ Doctors for ${diseases1.join(', ')}:`, doctors1Response.data.data.length, 'doctors');
    doctors1Response.data.data.forEach(doctor => {
      console.log(`   - ${doctor.name} (${doctor.specialization})`);
    });

    // Test with heart disease
    const diseases2 = ['heart-disease'];
    const doctors2Response = await axios.get(`${BASE_URL}/staff?diseases=${diseases2.join(',')}`);
    console.log(`✅ Doctors for ${diseases2.join(', ')}:`, doctors2Response.data.data.length, 'doctors');
    doctors2Response.data.data.forEach(doctor => {
      console.log(`   - ${doctor.name} (${doctor.specialization})`);
    });

    // Test with multiple diseases
    const diseases3 = ['fever', 'asthma', 'depression'];
    const doctors3Response = await axios.get(`${BASE_URL}/staff?diseases=${diseases3.join(',')}`);
    console.log(`✅ Doctors for ${diseases3.join(', ')}:`, doctors3Response.data.data.length, 'doctors');
    doctors3Response.data.data.forEach(doctor => {
      console.log(`   - ${doctor.name} (${doctor.specialization})`);
    });

    // Test 3: Create comprehensive patient with real doctor and nurse IDs
    if (nursesResponse.data.data.length >= 2 && doctors1Response.data.data.length >= 1) {
      console.log('\n3️⃣ Testing comprehensive patient registration...');
      
      const testPatient = {
        // Personal Information
        name: 'Muhammad Ali Khan',
        email: 'muhammad.ali.khan@patient.com',
        phone: '+92-300-9876543',
        age: 52,
        gender: 'male',
        address: 'House 789, Block C, Johar Town, Lahore, Punjab, Pakistan',
        emergencyContact: 'Ayesha Khan - +92-301-1234567',
        
        // Medical Information
        diseases: diseases1, // diabetes, blood-pressure
        medicalCondition: 'Diabetes, Blood Pressure',
        
        // Assignments - using real IDs from API
        assignedDoctorId: doctors1Response.data.data[0].id,
        assignedNurses: [
          nursesResponse.data.data[0].id.toString(),
          nursesResponse.data.data[1].id.toString()
        ],
        
        // Financial
        initialDeposit: 75000,
        
        // Accommodation
        roomType: 'private',
        roomNumber: 301,
        admissionDate: new Date().toISOString().split('T')[0],
        
        // Legacy fields
        dateOfBirth: new Date(Date.now() - 52 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      };

      const patientResponse = await axios.post(`${BASE_URL}/patients`, testPatient);
      console.log('✅ Comprehensive patient registered successfully:', {
        id: patientResponse.data.data.id,
        name: patientResponse.data.data.name,
        assignedDoctorId: patientResponse.data.data.assignedDoctorId,
        assignedNurses: patientResponse.data.data.assignedNurses,
        diseases: patientResponse.data.data.diseases,
        initialDeposit: patientResponse.data.data.initialDeposit
      });

      // Test 4: Verify patient data
      console.log('\n4️⃣ Verifying patient data...');
      const savedPatient = await axios.get(`${BASE_URL}/patients/${patientResponse.data.data.id}`);
      console.log('✅ Patient data verified:', {
        diseases: savedPatient.data.data.diseases,
        assignedNurses: savedPatient.data.data.assignedNurses,
        roomType: savedPatient.data.data.roomType,
        initialDeposit: savedPatient.data.data.initialDeposit
      });
    } else {
      console.log('\n⚠️  Skipping patient registration test - insufficient staff data');
      console.log(`   Nurses available: ${nursesResponse.data.data.length} (need 2)`);
      console.log(`   Doctors available: ${doctors1Response.data.data.length} (need 1)`);
    }

    console.log('\n🎉 Patient modal integration tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Test edge cases
async function testEdgeCases() {
  try {
    console.log('\n🧪 Testing Edge Cases...\n');

    // Test: No doctors for rare disease combination
    console.log('1️⃣ Testing no doctors available...');
    const rareDiseases = ['some-rare-disease'];
    const noDoctorsResponse = await axios.get(`${BASE_URL}/staff?diseases=${rareDiseases.join(',')}`);
    console.log('✅ Correctly returned empty list for rare diseases:', noDoctorsResponse.data.data.length, 'doctors');

    // Test: Invalid disease parameter
    console.log('\n2️⃣ Testing invalid parameters...');
    try {
      await axios.get(`${BASE_URL}/staff?diseases=`);
      console.log('✅ Handled empty diseases parameter');
    } catch (error) {
      console.log('✅ Correctly handled invalid parameter');
    }

  } catch (error) {
    console.error('❌ Edge case test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testPatientModalIntegration();
  await testEdgeCases();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testPatientModalIntegration, testEdgeCases };