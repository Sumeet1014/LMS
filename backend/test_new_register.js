const axios = require('axios');

async function testNewRegister() {
    const baseURL = 'http://localhost:5000/api/auth';
    const testEmail = `new_user_${Date.now()}@example.com`;

    console.log('--- Testing New User Register ---');
    try {
        const regRes = await axios.post(`${baseURL}/register`, {
            email: testEmail,
            password: 'password123',
            fullName: 'New Test User'
        });
        console.log('Registration Success:', regRes.data);
    } catch (error) {
        if (error.response) {
            console.log('Registration Failed Status:', error.response.status);
            console.log('Registration Error Body:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Registration Error Message:', error.message);
        }
    }
}

testNewRegister();
