const axios = require('axios');

async function testFetchSessions() {
    const baseURL = 'http://localhost:5000/api';

    // Registration
    const testEmail = `session_test_${Date.now()}@example.com`;
    console.log('--- Registering for session test ---');
    const regRes = await axios.post(`${baseURL}/auth/register`, {
        email: testEmail,
        password: 'password123',
        fullName: 'Session Tester'
    });

    const token = regRes.data.token;
    console.log('Registered user token received');

    // Fetch upcoming sessions
    console.log('--- Fetching sessions ---');
    try {
        const sessRes = await axios.get(`${baseURL}/sessions/upcoming`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Sessions fetch success:', sessRes.data);
    } catch (error) {
        console.log('Sessions fetch failed:', error.response?.status, error.response?.data);
    }
}

testFetchSessions();
