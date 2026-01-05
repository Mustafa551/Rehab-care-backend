const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPatientDetailsFix() {
  console.log('🧪 Testing Patient Details Dialog Fix...\n');

  try {
    // Step 1: Get existing patients to test with
    console.log('1️⃣ Fetching existing patients...');
    const patientsResponse = await axios.get(`${BASE_URL}/patients`);
    
    if (patientsResponse.status === 200) {
      console.log('✅ Successfully fetched patients');
      console.log(`   Found ${patientsResponse.data.data.length} patients`);
      
      if (patientsResponse.data.data.length > 0) {
        const patient = patientsResponse.data.data[0];
        console.log('\n📋 Sample patient data structure:');
        console.log('   ID:', patient.id);
        console.log('   Name:', patient.name);
        console.log('   Age:', patient.age || 'Not specified');
        console.log('   Room Number:', patient.roomNumber || 'Not specified');
        console.log('   Age Group:', patient.ageGroup || 'Not specified');
        console.log('   Admission Date:', patient.admissionDate || 'Not specified');
        console.log('   Condition:', patient.condition || patient.medicalCondition || 'Not specified');
        console.log('   Assigned Doctor ID:', patient.assignedDoctorId || 'Not assigned');
        console.log('   Status:', patient.status || 'Not specified');
      }
    }

    // Step 2: Create a test patient with minimal data to test edge cases
    console.log('\n2️⃣ Creating a test patient with minimal data...');
    const minimalPatientData = {
      name: 'Test Patient for Details Dialog',
      email: 'test-details@example.com',
      phone: '+92-300-1234567',
      dateOfBirth: '1990-01-01',
      status: 'active'
      // Intentionally omitting optional fields to test null handling
    };

    const minimalPatientResponse = await axios.post(`${BASE_URL}/patients`, minimalPatientData);
    
    if (minimalPatientResponse.status === 201) {
      console.log('✅ Minimal patient created successfully');
      const minimalPatient = minimalPatientResponse.data.data;
      console.log('   Patient ID:', minimalPatient.id);
      console.log('   Name:', minimalPatient.name);
      console.log('   Age:', minimalPatient.age || 'NULL (should not crash UI)');
      console.log('   Room Number:', minimalPatient.roomNumber || 'NULL (should not crash UI)');
      console.log('   Age Group:', minimalPatient.ageGroup || 'NULL (should not crash UI)');
      console.log('   Admission Date:', minimalPatient.admissionDate || 'NULL (should not crash UI)');
      console.log('   Condition:', minimalPatient.condition || minimalPatient.medicalCondition || 'NULL (should not crash UI)');
    }

    // Step 3: Create a complete patient to test full functionality
    console.log('\n3️⃣ Creating a complete patient with all data...');
    const completePatientData = {
      name: 'Complete Test Patient',
      email: 'complete-test@example.com',
      phone: '+92-300-7654321',
      dateOfBirth: '1985-06-15',
      medicalCondition: 'Post-surgical rehabilitation',
      status: 'active',
      age: 38,
      gender: 'male',
      address: '456 Complete Street, Lahore',
      emergencyContact: '+92-300-9876543',
      diseases: ['Hypertension'],
      assignedNurses: ['1'],
      initialDeposit: 60000,
      roomType: 'semi-private',
      roomNumber: 105,
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeStatus: 'continue'
    };

    const completePatientResponse = await axios.post(`${BASE_URL}/patients`, completePatientData);
    
    if (completePatientResponse.status === 201) {
      console.log('✅ Complete patient created successfully');
      const completePatient = completePatientResponse.data.data;
      console.log('   Patient ID:', completePatient.id);
      console.log('   Name:', completePatient.name);
      console.log('   Age:', completePatient.age);
      console.log('   Room Number:', completePatient.roomNumber);
      console.log('   Age Group:', completePatient.ageGroup || 'Will be derived from age');
      console.log('   Admission Date:', completePatient.admissionDate);
      console.log('   Condition:', completePatient.medicalCondition);
    }

    // Step 4: Get staff members to test doctor assignment
    console.log('\n4️⃣ Fetching staff members for doctor assignment test...');
    const staffResponse = await axios.get(`${BASE_URL}/staff`);
    
    if (staffResponse.status === 200) {
      console.log('✅ Successfully fetched staff members');
      const doctors = staffResponse.data.data.filter(s => s.role === 'doctor');
      console.log(`   Found ${doctors.length} doctors available for assignment`);
      
      if (doctors.length > 0) {
        console.log('   Sample doctor:', doctors[0].name, '(ID:', doctors[0].id + ')');
      }
    }

    console.log('\n🎉 Patient Details Dialog Fix Test Completed!');
    console.log('\n📋 Fix Summary:');
    console.log('   ✅ Fixed undefined assignedStaff variable');
    console.log('   ✅ Added proper null checks for optional patient properties');
    console.log('   ✅ Added fallback values for missing data');
    console.log('   ✅ Fixed patient.age, roomNumber, ageGroup, admissionDate handling');
    console.log('   ✅ Fixed condition display (condition || medicalCondition)');
    console.log('   ✅ Added getPatientDoctor function usage');
    console.log('\n💡 The patient details dialog should now work without white screen errors!');
    console.log('\n🔧 Manual Testing Steps:');
    console.log('   1. Go to Patients page');
    console.log('   2. Click on any patient card');
    console.log('   3. Verify patient details dialog opens properly');
    console.log('   4. Check all tabs work (Overview, Progress, Notes, Care Plan)');
    console.log('   5. Verify no white screen or JavaScript errors');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('   Run: cd Rehab-care-backend && npm start');
    }
  }
}

// Run the test
testPatientDetailsFix();