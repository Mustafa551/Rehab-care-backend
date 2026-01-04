const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDiseasesParameter() {
  try {
    console.log('🧪 Testing Diseases Parameter Fix...\n');

    // Test 1: Valid diseases parameter
    console.log('1️⃣ Testing valid diseases parameter...');
    const validDiseases = ['diabetes', 'blood-pressure'];
    const response1 = await axios.get(`${BASE_URL}/staff?diseases=${validDiseases.join(',')}`);
    console.log('✅ Valid diseases parameter accepted:', response1.data.data.length, 'doctors found');

    // Test 2: Single disease
    console.log('\n2️⃣ Testing single disease parameter...');
    const response2 = await axios.get(`${BASE_URL}/staff?diseases=heart-disease`);
    console.log('✅ Single disease parameter accepted:', response2.data.data.length, 'doctors found');

    // Test 3: Multiple diseases
    console.log('\n3️⃣ Testing multiple diseases parameter...');
    const multipleDiseases = ['fever', 'asthma', 'depression'];
    const response3 = await axios.get(`${BASE_URL}/staff?diseases=${multipleDiseases.join(',')}`);
    console.log('✅ Multiple diseases parameter accepted:', response3.data.data.length, 'doctors found');

    // Test 4: Combined with role parameter
    console.log('\n4️⃣ Testing diseases with role parameter...');
    const response4 = await axios.get(`${BASE_URL}/staff?role=doctor&diseases=diabetes`);
    console.log('✅ Combined parameters accepted:', response4.data.data.length, 'doctors found');

    // Test 5: Get all nurses (should still work)
    console.log('\n5️⃣ Testing nurses endpoint...');
    const response5 = await axios.get(`${BASE_URL}/staff?role=nurse`);
    console.log('✅ Nurses endpoint working:', response5.data.data.length, 'nurses found');

    console.log('\n🎉 All diseases parameter tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Invalid parameter')) {
      console.log('\n💡 The validation middleware is still rejecting the diseases parameter.');
      console.log('   Make sure the server is restarted after the validation fix.');
    }
  }
}

// Test invalid cases
async function testInvalidCases() {
  try {
    console.log('\n🧪 Testing Invalid Cases...\n');

    // Test: Invalid disease
    console.log('1️⃣ Testing invalid disease...');
    try {
      await axios.get(`${BASE_URL}/staff?diseases=invalid-disease`);
      console.log('❌ Should have rejected invalid disease');
    } catch (error) {
      console.log('✅ Correctly rejected invalid disease');
    }

    // Test: Mixed valid and invalid diseases
    console.log('\n2️⃣ Testing mixed valid/invalid diseases...');
    try {
      await axios.get(`${BASE_URL}/staff?diseases=diabetes,invalid-disease`);
      console.log('❌ Should have rejected mixed diseases');
    } catch (error) {
      console.log('✅ Correctly rejected mixed valid/invalid diseases');
    }

  } catch (error) {
    console.error('❌ Invalid case test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testDiseasesParameter();
  await testInvalidCases();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testDiseasesParameter, testInvalidCases };