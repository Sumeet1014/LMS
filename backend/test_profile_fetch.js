const axios = require('axios');

async function testFetchProfile() {
    const baseURL = 'http://localhost:5000/api';

    // Registration
    const testEmail = `profile_test_${Date.now()}@example.com`;
    console.log('--- Registering for profile test ---');
    const regRes = await axios.post(`${baseURL}/auth/register`, {
        email: testEmail,
        password: 'password123',
        fullName: 'Profile Tester'
    });

    const token = regRes.data.token;
    const userId = regRes.data.user.id;
    console.log('Registered user ID:', userId);

    // Fetch profile
    console.log('--- Fetching profile ---');
    try {
        const profRes = await axios.get(`${baseURL}/profiles/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Profile fetch success:', profRes.data);
    } catch (error) {
        console.log('Profile fetch failed:', error.response?.status, error.response?.data);
    }
}

testFetchProfile();
