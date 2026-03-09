const axios = require('axios');

async function testCurrentRegister() {
    const baseURL = 'http://localhost:5000/api/auth';
    // Use a name that might fail or just any name
    const testEmail = 'sarthakkasar1629@gmail.com';

    console.log('--- Testing Current Register Payload ---');
    try {
        const regRes = await axios.post(`${baseURL}/register`, {
            email: testEmail,
            password: 'password123',
            fullName: 'Sarthak kasar'
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

testCurrentRegister();
