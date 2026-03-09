// Debug registration test
import axios from 'axios';

async function debugRegister() {
  console.log('🔍 Debug Registration Test...\n');

  try {
    // Test 1: Simple registration
    console.log('1. Testing simple registration...');
    const testEmail = `debug${Date.now()}@test.com`;
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      email: testEmail,
      password: 'password123',
      fullName: 'Debug User'
    });
    
    console.log('✅ Registration successful!');
    console.log('User:', response.data.user);
    console.log('Token length:', response.data.token?.length || 0);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.data?.error) {
      console.error('Backend error:', error.response.data.error);
    }
  }
}

debugRegister();
