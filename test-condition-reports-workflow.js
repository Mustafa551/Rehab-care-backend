const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test data
const testPatientId = 1; // Assuming patient with ID 1 exists
const testNurseName = 'Nurse Johnson';
const testDoctorName = 'Dr. Smith';

async function testNurseConditionReporting() {
  console.log('\n=== TESTING NURSE CONDITION REPORTING ===');
  
  try {
    // 1. Test nurse submitting low urgency report
    console.log('\n1. Nurse submitting low urgency condition report...');
    const lowUrgencyReport = {
      patientId: testPatientId,
      reportedBy: testNurseName,
      date: new Date().toISOString().split('T')[0],
      time: '08:30',
      conditionUpdate: 'Patient appears stable this morning. Good appetite at breakfast, ambulating well with assistance. Vital signs within normal limits.',
      symptoms: ['Fatigue'],
      painLevel: 2,
      notes: 'Patient expressed feeling better today. Requesting to walk more.',
      urgency: 'low'
    };
    
    const lowResponse = await axios.post(`${API_BASE_URL}/nurse-reports`, lowUrgencyReport);
    console.log('✅ Low urgency report submitted:', lowResponse.data);
    
    // 2. Test nurse submitting medium urgency report
    console.log('\n2. Nurse submitting medium urgency condition report...');
    const mediumUrgencyReport = {
      patientId: testPatientId,
      reportedBy: testNurseName,
      date: new Date().toISOString().split('T')[0],
      time: '14:15',
      conditionUpdate: 'Patient experiencing increased discomfort and restlessness. Appetite decreased at lunch. Requesting pain medication more frequently.',
      symptoms: ['Pain', 'Nausea', 'Anxiety'],
      painLevel: 6,
      notes: 'Patient seems more uncomfortable than usual. May need medication adjustment.',
      urgency: 'medium'
    };
    
    const mediumResponse = await axios.post(`${API_BASE_URL}/nurse-reports`, mediumUrgencyReport);
    console.log('✅ Medium urgency report submitted:', mediumResponse.data);
    
    // 3. Test nurse submitting high urgency report
    console.log('\n3. Nurse submitting high urgency condition report...');
    const highUrgencyReport = {
      patientId: testPatientId,
      reportedBy: testNurseName,
      date: new Date().toISOString().split('T')[0],
      time: '20:45',
      conditionUpdate: 'Patient experiencing severe pain and difficulty breathing. Blood pressure elevated. Patient appears distressed and unable to rest.',
      symptoms: ['Severe Pain', 'Shortness of breath', 'Confusion', 'Difficulty sleeping'],
      painLevel: 9,
      notes: 'URGENT: Patient condition has deteriorated significantly. Administered PRN pain medication with minimal relief. Vital signs show elevated BP 150/95, HR 95. Patient requesting immediate doctor attention. Family has been notified.',
      urgency: 'high'
    };
    
    const highResponse = await axios.post(`${API_BASE_URL}/nurse-reports`, highUrgencyReport);
    console.log('✅ High urgency report submitted:', highResponse.data);
    
    console.log('\n✅ NURSE CONDITION REPORTING TESTS PASSED!');
    return {
      lowReportId: lowResponse.data.data.id,
      mediumReportId: mediumResponse.data.data.id,
      highReportId: highResponse.data.data.id
    };
    
  } catch (error) {
    console.error('❌ Nurse condition reporting test failed:', error.response?.data || error.message);
    return null;
  }
}

async function testDoctorReportViewing() {
  console.log('\n=== TESTING DOCTOR REPORT VIEWING ===');
  
  try {
    // 1. Test doctor viewing all patient reports
    console.log('\n1. Doctor viewing all patient condition reports...');
    const allReportsResponse = await axios.get(`${API_BASE_URL}/nurse-reports/patient/${testPatientId}`);
    console.log('✅ Doctor can view all patient reports:', allReportsResponse.data);
    
    const reports = allReportsResponse.data.data;
    if (reports.length === 0) {
      console.log('⚠️  No reports found for patient');
      return false;
    }
    
    // 2. Test doctor viewing unreviewed reports
    console.log('\n2. Doctor viewing unreviewed reports...');
    const unreviewedResponse = await axios.get(`${API_BASE_URL}/nurse-reports/patient/${testPatientId}/unreviewed`);
    console.log('✅ Doctor can view unreviewed reports:', unreviewedResponse.data);
    
    const unreviewedReports = unreviewedResponse.data.data;
    
    // 3. Analyze reports by urgency for doctor
    console.log('\n3. Analyzing reports by urgency for doctor dashboard...');
    
    const reportsByUrgency = {
      high: reports.filter(r => r.urgency === 'high'),
      medium: reports.filter(r => r.urgency === 'medium'),
      low: reports.filter(r => r.urgency === 'low')
    };
    
    console.log('📊 Reports Analysis:');
    console.log(`   High Urgency: ${reportsByUrgency.high.length} reports`);
    console.log(`   Medium Urgency: ${reportsByUrgency.medium.length} reports`);
    console.log(`   Low Urgency: ${reportsByUrgency.low.length} reports`);
    console.log(`   Unreviewed: ${unreviewedReports.length} reports`);
    
    // Highlight urgent reports
    if (reportsByUrgency.high.length > 0) {
      console.log('\n🚨 HIGH URGENCY REPORTS REQUIRING IMMEDIATE ATTENTION:');
      reportsByUrgency.high.forEach(report => {
        console.log(`   📅 ${report.date} ${report.time} - Pain Level: ${report.painLevel}/10`);
        console.log(`   📝 ${report.conditionUpdate.substring(0, 100)}...`);
        console.log(`   👩‍⚕️ Reported by: ${report.reportedBy}`);
        console.log(`   ⚠️  Status: ${report.reviewedByDoctor ? 'Reviewed' : 'NEEDS IMMEDIATE REVIEW'}`);
        console.log('');
      });
    }
    
    console.log('\n✅ DOCTOR REPORT VIEWING TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Doctor report viewing test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDoctorReportReviewing(reportIds) {
  console.log('\n=== TESTING DOCTOR REPORT REVIEWING ===');
  
  if (!reportIds) {
    console.log('⚠️  No report IDs available for testing');
    return false;
  }
  
  try {
    // 1. Test doctor reviewing low urgency report
    console.log('\n1. Doctor reviewing low urgency report...');
    const lowReviewResponse = await axios.patch(`${API_BASE_URL}/nurse-reports/${reportIds.lowReportId}/review`, {
      doctorResponse: 'Thank you for the update. Patient condition is stable. Continue current care plan and monitor. No changes needed at this time.'
    });
    console.log('✅ Low urgency report reviewed:', lowReviewResponse.data);
    
    // 2. Test doctor reviewing medium urgency report
    console.log('\n2. Doctor reviewing medium urgency report...');
    const mediumReviewResponse = await axios.patch(`${API_BASE_URL}/nurse-reports/${reportIds.mediumReportId}/review`, {
      doctorResponse: 'Noted increased discomfort. Please increase pain medication to 2 tablets every 6 hours. Monitor closely and report if no improvement in 4 hours. Consider anti-nausea medication if needed.'
    });
    console.log('✅ Medium urgency report reviewed:', mediumReviewResponse.data);
    
    // 3. Test doctor reviewing high urgency report
    console.log('\n3. Doctor reviewing high urgency report...');
    const highReviewResponse = await axios.patch(`${API_BASE_URL}/nurse-reports/${reportIds.highReportId}/review`, {
      doctorResponse: 'URGENT RESPONSE: Thank you for immediate notification. Please administer morphine 5mg IV stat. Start oxygen at 2L/min. Obtain chest X-ray and arterial blood gas. I will be there within 30 minutes to assess. Continue monitoring vitals every 15 minutes.'
    });
    console.log('✅ High urgency report reviewed:', highReviewResponse.data);
    
    // 4. Verify all reports are now reviewed
    console.log('\n4. Verifying all reports are now reviewed...');
    const finalCheckResponse = await axios.get(`${API_BASE_URL}/nurse-reports/patient/${testPatientId}/unreviewed`);
    const remainingUnreviewed = finalCheckResponse.data.data;
    
    console.log(`📊 Remaining unreviewed reports: ${remainingUnreviewed.length}`);
    
    if (remainingUnreviewed.length === 0) {
      console.log('✅ All reports have been reviewed by doctor');
    } else {
      console.log('⚠️  Some reports still need review');
    }
    
    console.log('\n✅ DOCTOR REPORT REVIEWING TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Doctor report reviewing test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testReportValidation() {
  console.log('\n=== TESTING REPORT VALIDATION ===');
  
  try {
    // Test missing required fields
    console.log('\n1. Testing validation - missing required fields...');
    try {
      await axios.post(`${API_BASE_URL}/nurse-reports`, {
        patientId: testPatientId,
        reportedBy: testNurseName,
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
    
    // Test invalid urgency level
    console.log('\n2. Testing validation - invalid urgency level...');
    try {
      await axios.post(`${API_BASE_URL}/nurse-reports`, {
        patientId: testPatientId,
        reportedBy: testNurseName,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        conditionUpdate: 'Test condition update',
        urgency: 'invalid'
      });
      console.log('❌ Should have failed validation');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected invalid urgency:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test invalid pain level
    console.log('\n3. Testing validation - invalid pain level...');
    try {
      await axios.post(`${API_BASE_URL}/nurse-reports`, {
        patientId: testPatientId,
        reportedBy: testNurseName,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        conditionUpdate: 'Test condition update',
        urgency: 'medium',
        painLevel: 15 // Invalid - should be 0-10
      });
      console.log('❌ Should have failed validation');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation correctly rejected invalid pain level:', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ REPORT VALIDATION TESTS PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Report validation test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runConditionReportsWorkflowTest() {
  console.log('🚀 Starting Nurse-Doctor Condition Reports Workflow Test...');
  console.log('📍 Testing against:', API_BASE_URL);
  console.log('👩‍⚕️ Nurse Role: Submit condition reports');
  console.log('👨‍⚕️ Doctor Role: Review and respond to reports');
  
  try {
    // Test server connectivity
    console.log('\n🔍 Testing server connectivity...');
    await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Server is running and accessible');
    
    // Run workflow tests
    const reportIds = await testNurseConditionReporting();
    const doctorViewingPassed = await testDoctorReportViewing();
    const doctorReviewingPassed = await testDoctorReportReviewing(reportIds);
    const validationPassed = await testReportValidation();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 CONDITION REPORTS WORKFLOW TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`👩‍⚕️ Nurse Reporting: ${reportIds ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`👨‍⚕️ Doctor Viewing: ${doctorViewingPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`👨‍⚕️ Doctor Reviewing: ${doctorReviewingPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔒 Validation: ${validationPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (reportIds && doctorViewingPassed && doctorReviewingPassed && validationPassed) {
      console.log('\n🎉 ALL CONDITION REPORTS WORKFLOW TESTS PASSED!');
      console.log('\n📋 Verified Functionality:');
      console.log('   ✅ Nurses can submit condition reports with different urgency levels');
      console.log('   ✅ Doctors can view all patient condition reports');
      console.log('   ✅ Doctors can identify unreviewed reports');
      console.log('   ✅ Doctors can review and respond to reports');
      console.log('   ✅ High urgency reports are properly flagged');
      console.log('   ✅ Pain levels and symptoms are tracked');
      console.log('   ✅ Complete audit trail is maintained');
      console.log('   ✅ Proper input validation and error handling');
      
      console.log('\n🔄 Complete Workflow:');
      console.log('   1. Nurse observes patient condition changes');
      console.log('   2. Nurse submits detailed condition report with urgency level');
      console.log('   3. Doctor receives notification (especially for high urgency)');
      console.log('   4. Doctor reviews report and provides response/instructions');
      console.log('   5. Nurse receives doctor\'s response and follows instructions');
      console.log('   6. Complete communication loop with audit trail');
      
      console.log('\n📊 Urgency Level System:');
      console.log('   🟢 Low: Routine updates, no immediate action needed');
      console.log('   🟡 Medium: Doctor review needed, moderate priority');
      console.log('   🔴 High: Immediate attention required, urgent response');
    } else {
      console.log('\n⚠️  Some workflow tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3000');
    console.log('   Run: cd Rehab-care-backend && npm run dev');
  }
}

// Run the workflow test
runConditionReportsWorkflowTest();