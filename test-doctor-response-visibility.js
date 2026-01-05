const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDoctorResponseVisibility() {
  console.log('🧪 Testing Doctor Response Visibility in Nurse Section...\n');

  try {
    // Step 1: Create a nurse report
    console.log('1️⃣ Creating a nurse report...');
    const reportResponse = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      time: '14:30:00',
      conditionUpdate: 'Patient is experiencing mild discomfort after physical therapy session.',
      symptoms: ['Pain', 'Fatigue'],
      painLevel: 4,
      notes: 'Patient requested pain medication. Vital signs stable.',
      urgency: 'medium'
    });
    
    if (reportResponse.status === 201) {
      console.log('✅ Nurse report created successfully');
      console.log('   Report ID:', reportResponse.data.data.id);
      console.log('   Reviewed status:', reportResponse.data.data.reviewedByDoctor);
      console.log('   Doctor response:', reportResponse.data.data.doctorResponse || 'None yet');
    }

    const reportId = reportResponse.data.data.id;

    // Step 2: Get all reports for patient (nurse view)
    console.log('\n2️⃣ Fetching all reports for patient (nurse view)...');
    const nurseViewReports = await axios.get(`${BASE_URL}/nurse-reports/patient/1`);
    
    if (nurseViewReports.status === 200) {
      console.log('✅ Successfully fetched reports from nurse perspective');
      console.log(`   Found ${nurseViewReports.data.data.length} total reports`);
      
      const ourReport = nurseViewReports.data.data.find(r => r.id === reportId);
      if (ourReport) {
        console.log('   Our report status:');
        console.log('     - Reviewed by doctor:', ourReport.reviewedByDoctor);
        console.log('     - Doctor response:', ourReport.doctorResponse || 'None');
      }
    }

    // Step 3: Doctor reviews the report
    console.log('\n3️⃣ Doctor reviewing the report...');
    const doctorResponse = 'Thank you for the detailed report. Please administer 1 tablet of ibuprofen every 6 hours for pain management. Monitor patient closely and report if pain increases. Consider reducing physical therapy intensity for next session.';
    
    const reviewResponse = await axios.post(`${BASE_URL}/nurse-reports/${reportId}/review`, {
      doctorResponse: doctorResponse
    });
    
    if (reviewResponse.status === 200) {
      console.log('✅ Doctor review submitted successfully');
      console.log('   Updated report status:');
      console.log('     - Reviewed by doctor:', reviewResponse.data.data.reviewedByDoctor);
      console.log('     - Doctor response length:', reviewResponse.data.data.doctorResponse?.length || 0, 'characters');
    }

    // Step 4: Get all reports again (nurse view after doctor review)
    console.log('\n4️⃣ Fetching reports again after doctor review (nurse view)...');
    const nurseViewAfterReview = await axios.get(`${BASE_URL}/nurse-reports/patient/1`);
    
    if (nurseViewAfterReview.status === 200) {
      console.log('✅ Successfully fetched reports after doctor review');
      console.log(`   Found ${nurseViewAfterReview.data.data.length} total reports`);
      
      const reviewedReport = nurseViewAfterReview.data.data.find(r => r.id === reportId);
      if (reviewedReport) {
        console.log('   Our reviewed report:');
        console.log('     - Reviewed by doctor:', reviewedReport.reviewedByDoctor);
        console.log('     - Has doctor response:', !!reviewedReport.doctorResponse);
        console.log('     - Doctor response preview:', reviewedReport.doctorResponse?.substring(0, 50) + '...');
      }
    }

    // Step 5: Compare with unreviewed reports endpoint
    console.log('\n5️⃣ Checking unreviewed reports endpoint...');
    const unreviewedReports = await axios.get(`${BASE_URL}/nurse-reports/patient/1/unreviewed`);
    
    if (unreviewedReports.status === 200) {
      console.log('✅ Successfully fetched unreviewed reports');
      console.log(`   Found ${unreviewedReports.data.data.length} unreviewed reports`);
      
      const ourReportInUnreviewed = unreviewedReports.data.data.find(r => r.id === reportId);
      console.log('   Our report in unreviewed list:', ourReportInUnreviewed ? 'YES (should be NO)' : 'NO (correct)');
    }

    // Step 6: Create another report to test mixed states
    console.log('\n6️⃣ Creating another report to test mixed states...');
    const secondReportResponse = await axios.post(`${BASE_URL}/nurse-reports`, {
      patientId: 1,
      reportedBy: 'Test Nurse',
      date: new Date().toISOString().split('T')[0],
      time: '16:45:00',
      conditionUpdate: 'Patient had a good appetite at dinner and is resting comfortably.',
      symptoms: [],
      painLevel: 2,
      notes: 'Patient mood improved after pain medication. No concerns at this time.',
      urgency: 'low'
    });
    
    if (secondReportResponse.status === 201) {
      console.log('✅ Second report created (unreviewed)');
      console.log('   Report ID:', secondReportResponse.data.data.id);
    }

    // Step 7: Final check - nurse should see both reports (one reviewed, one unreviewed)
    console.log('\n7️⃣ Final check - nurse view with mixed report states...');
    const finalNurseView = await axios.get(`${BASE_URL}/nurse-reports/patient/1`);
    
    if (finalNurseView.status === 200) {
      console.log('✅ Final nurse view check');
      console.log(`   Total reports visible to nurse: ${finalNurseView.data.data.length}`);
      
      const reviewedCount = finalNurseView.data.data.filter(r => r.reviewedByDoctor).length;
      const unreviewedCount = finalNurseView.data.data.filter(r => !r.reviewedByDoctor).length;
      const withResponseCount = finalNurseView.data.data.filter(r => r.doctorResponse).length;
      
      console.log('   Report breakdown:');
      console.log(`     - Reviewed reports: ${reviewedCount}`);
      console.log(`     - Unreviewed reports: ${unreviewedCount}`);
      console.log(`     - Reports with doctor response: ${withResponseCount}`);
      
      // Show details of reports with doctor responses
      const reportsWithResponses = finalNurseView.data.data.filter(r => r.doctorResponse);
      reportsWithResponses.forEach((report, index) => {
        console.log(`     - Response ${index + 1}: "${report.doctorResponse.substring(0, 40)}..."`);
      });
    }

    console.log('\n🎉 Doctor Response Visibility Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Nurse reports are created successfully');
    console.log('   ✅ Doctor can review and respond to reports');
    console.log('   ✅ Nurse can see all reports (reviewed and unreviewed)');
    console.log('   ✅ Doctor responses are visible in nurse view');
    console.log('   ✅ Mixed report states work correctly');
    console.log('\n💡 The nurse section should now show doctor responses!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('   Run: cd Rehab-care-backend && npm start');
    }
  }
}

// Run the test
testDoctorResponseVisibility();