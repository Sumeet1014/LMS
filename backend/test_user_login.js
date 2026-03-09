const axios = require('axios');

async function testCurrentLogin() {
    const baseURL = 'http://localhost:5000/api/auth';
    const testEmail = 'sarthakkasar1629@gmail.com';

    console.log('--- Testing Current Login ---');
    try {
        const loginRes = await axios.post(`${baseURL}/login`, {
            email: testEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);
    } catch (error) {
        if (error.response) {
            console.log('Login Failed Status:', error.response.status);
            console.log('Login Error Body:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Login Error Message:', error.message);
        }
    }
}

testCurrentLogin();
