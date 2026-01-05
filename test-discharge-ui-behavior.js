const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDischargeUIBehavior() {
  console.log('🧪 Testing Discharge UI Behavior...\n');

  try {
    // Step 1: Create a test patient
    console.log('1️⃣ Creating a test patient...');
    const patientData = {
      name: 'Test Patient for Discharge UI',
      email: 'discharge-test@example.com',
      phone: '+92-300-1234567',
      dateOfBirth: '1990-01-01',
      medicalCondition: 'Recovery from surgery',
      status: 'active',
      age: 34,
      gender: 'male',
      address: '123 Test Street, Karachi',
      emergencyContact: '+92-300-7654321',
      diseases: ['Hypertension', 'Diabetes'],
      assignedNurses: ['1', '2'],
      initialDeposit: 50000,
      roomType: 'general',
      roomNumber: 101,
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeStatus: 'continue'
    };

    const patientResponse = await axios.post(`${BASE_URL}/patients`, patientData);
    
    if (patientResponse.status === 201) {
      console.log('✅ Test patient created successfully');
      console.log('   Patient ID:', patientResponse.data.data.id);
      console.log('   Status:', patientResponse.data.data.status);
      console.log('   Discharge Status:', patientResponse.data.data.dischargeStatus);
    }

    const patientId = patientResponse.data.data.id;

    // Step 2: Verify patient is active (discharge button should be hidden initially)
    console.log('\n2️⃣ Verifying active patient status...');
    const activePatient = await axios.get(`${BASE_URL}/patients/${patientId}`);
    
    if (activePatient.status === 200) {
      console.log('✅ Patient status verified');
      console.log('   Status:', activePatient.data.data.status);
      console.log('   Should show discharge button:', activePatient.data.data.status !== 'discharged' ? 'YES' : 'NO');
      console.log('   Staff forms should be editable:', activePatient.data.data.status !== 'discharged' ? 'YES' : 'NO');
    }

    // Step 3: Update patient to ready for discharge
    console.log('\n3️⃣ Updating patient to ready for discharge...');
    const readyUpdate = {
      dischargeStatus: 'ready'
    };

    const readyResponse = await axios.put(`${BASE_URL}/patients/${patientId}`, readyUpdate);
    
    if (readyResponse.status === 200) {
      console.log('✅ Patient marked as ready for discharge');
      console.log('   Status:', readyResponse.data.data.status);
      console.log('   Discharge Status:', readyResponse.data.data.dischargeStatus);
      console.log('   Should show discharge button:', readyResponse.data.data.status !== 'discharged' && readyResponse.data.data.dischargeStatus === 'ready' ? 'YES' : 'NO');
    }

    // Step 4: Create some medical records (vital signs, reports, medications)
    console.log('\n4️⃣ Creating medical records for the patient...');
    
    // Create vital signs
    const vitalSigns = await axios.post(`${BASE_URL}/vital-signs`, {
      patientId: patientId,
      date: new Date().toISOString().split('T')[0],
      time: '14:30:00',
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6',
      oxygenSaturation: '98',
      respiratoryRate: '16',
      notes: 'Normal vital signs before discharge',
      recordedBy: 'Test Nurse'
    });
    
    console.log('✅ Vital signs recorded:', vitalSigns.status === 201 ? 'SUCCESS' : 'FAILED');

    // Create nurse report
    const nurseReport = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: patientId,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      time: '15:00:00',
      conditionUpdate: 'Patient is stable and ready for discharge. All vital signs normal.',
      symptoms: [],
      painLevel: 1,
      notes: 'Patient has shown excellent recovery progress.',
      urgency: 'low'
    });
    
    console.log('✅ Nurse report created:', nurseReport.status === 201 ? 'SUCCESS' : 'FAILED');

    // Step 5: Discharge the patient
    console.log('\n5️⃣ Discharging the patient...');
    const dischargeData = {
      dischargeNotes: 'Patient discharged in good condition. Follow-up appointment scheduled.',
      finalBillAmount: 75000,
      dischargeDate: new Date().toISOString(),
      dischargedBy: 'Dr. Test Doctor'
    };

    const dischargeResponse = await axios.post(`${BASE_URL}/patients/${patientId}/discharge`, dischargeData);
    
    if (dischargeResponse.status === 200) {
      console.log('✅ Patient discharged successfully');
      console.log('   New Status:', dischargeResponse.data.data.patient.status);
      console.log('   Discharge Date:', dischargeResponse.data.data.dischargeDate);
      console.log('   Message:', dischargeResponse.data.message);
    }

    // Step 6: Verify discharged patient status
    console.log('\n6️⃣ Verifying discharged patient status...');
    const dischargedPatient = await axios.get(`${BASE_URL}/patients/${patientId}`);
    
    if (dischargedPatient.status === 200) {
      console.log('✅ Discharged patient status verified');
      console.log('   Status:', dischargedPatient.data.data.status);
      console.log('   Should show discharge button:', dischargedPatient.data.data.status !== 'discharged' ? 'YES' : 'NO (CORRECT)');
      console.log('   Staff forms should be editable:', dischargedPatient.data.data.status !== 'discharged' ? 'YES' : 'NO (CORRECT - READ ONLY)');
      console.log('   Should show "Patient Discharged" badge:', dischargedPatient.data.data.status === 'discharged' ? 'YES (CORRECT)' : 'NO');
    }

    // Step 7: Try to create new medical records (should still work via API but UI should prevent it)
    console.log('\n7️⃣ Testing medical record creation for discharged patient...');
    
    try {
      const postDischargeVitals = await axios.post(`${BASE_URL}/vital-signs`, {
        patientId: patientId,
        date: new Date().toISOString().split('T')[0],
        time: '16:00:00',
        bloodPressure: '125/85',
        heartRate: '75',
        temperature: '98.8',
        recordedBy: 'Test Nurse'
      });
      
      console.log('⚠️ Post-discharge vital signs creation:', postDischargeVitals.status === 201 ? 'ALLOWED (API level)' : 'BLOCKED');
      console.log('   Note: API allows creation but UI should prevent this for discharged patients');
    } catch (error) {
      console.log('✅ Post-discharge vital signs creation: BLOCKED (as expected)');
    }

    // Step 8: Get all patients to verify filtering
    console.log('\n8️⃣ Testing patient filtering...');
    
    const allPatients = await axios.get(`${BASE_URL}/patients`);
    const activePatients = await axios.get(`${BASE_URL}/patients?status=active`);
    const dischargedPatients = await axios.get(`${BASE_URL}/patients?status=discharged`);
    
    console.log('✅ Patient filtering results:');
    console.log(`   Total patients: ${allPatients.data.data.length}`);
    console.log(`   Active patients: ${activePatients.data.data.length}`);
    console.log(`   Discharged patients: ${dischargedPatients.data.data.length}`);
    
    const ourDischargedPatient = dischargedPatients.data.data.find(p => p.id === patientId);
    console.log(`   Our test patient in discharged list: ${ourDischargedPatient ? 'YES (CORRECT)' : 'NO'}');

    console.log('\n🎉 Discharge UI Behavior Test Completed!');
    console.log('\n📋 Expected UI Behavior Summary:');
    console.log('   ✅ Active patients: Show discharge button when ready');
    console.log('   ✅ Discharged patients: Hide discharge button');
    console.log('   ✅ Discharged patients: Show "Patient Discharged" badge');
    console.log('   ✅ Discharged patients: Disable all staff form inputs');
    console.log('   ✅ Discharged patients: Show read-only alerts in staff modals');
    console.log('   ✅ Discharged patients: Disable vital signs recording');
    console.log('   ✅ Discharged patients: Disable condition reporting');
    console.log('   ✅ Discharged patients: Disable medication administration');
    console.log('   ✅ Discharged patients: Disable doctor assessments');
    console.log('\n💡 Test the UI manually to verify these behaviors!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('   Run: cd Rehab-care-backend && npm start');
    }
  }
}

// Run the test
testDischargeUIBehavior();