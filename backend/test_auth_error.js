const axios = require('axios');

async function testAuth() {
    const baseURL = 'http://localhost:5000/api/auth';
    const testEmail = `test_${Date.now()}@example.com`;

    console.log('--- Testing Registration ---');
    try {
        const regRes = await axios.post(`${baseURL}/register`, {
            email: testEmail,
            password: 'password123',
            fullName: 'Test User',
            role: 'student'
        });
        console.log('Registration Success:', regRes.data);
    } catch (error) {
        if (error.response) {
            console.log('Registration Failed (400?):', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Registration Error:', error.message);
        }
    }

    console.log('\n--- Testing Login with same account ---');
    try {
        const loginRes = await axios.post(`${baseURL}/login`, {
            email: testEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);
    } catch (error) {
        if (error.response) {
            console.log('Login Failed (400?):', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Login Error:', error.message);
        }
    }
}

testAuth();
