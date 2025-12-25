// Simple test script to verify login API
const axios = require('axios');

const API_BASE = 'http://localhost:8000/api/v1';

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await axios.post(`${API_BASE}/user/login`, {
      email: 'admin@rehab.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test authenticated endpoint
    const token = response.data.data.token;
    const userResponse = await axios.get(`${API_BASE}/user/?userId=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Authenticated request successful!');
    console.log('User data:', JSON.stringify(userResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test invalid login
async function testInvalidLogin() {
  try {
    console.log('\nTesting invalid login...');
    
    await axios.post(`${API_BASE}/user/login`, {
      email: 'admin@rehab.com',
      password: 'wrongpassword'
    });
    
    console.log('❌ This should have failed!');
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Invalid login correctly rejected');
      console.log('Response:', error.response.data);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

async function runTests() {
  await testLogin();
  await testInvalidLogin();
}

runTests();