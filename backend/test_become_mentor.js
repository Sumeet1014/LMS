const axios = require('axios');

async function testBecomeMentor() {
    const baseURL = 'http://localhost:5000/api';

    // Registration
    const testEmail = `mentor_test_${Date.now()}@example.com`;
    console.log('--- Registering for mentor test ---');
    const regRes = await axios.post(`${baseURL}/auth/register`, {
        email: testEmail,
        password: 'password123',
        fullName: 'Mentor Tester'
    });

    const token = regRes.data.token;
    const userId = regRes.data.user.id;
    console.log('Registered user ID:', userId);

    // Become mentor
    console.log('--- Becoming mentor ---');
    try {
        const mentorRes = await axios.post(`${baseURL}/auth/become-mentor`, {
            username: 'Mentor Tester',
            bio: 'Expert in testing',
            college_email: testEmail,
            subjects: ['Node.js', 'MySQL'],
            availability: 'Weekdays 6-8 PM'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Become mentor success:', mentorRes.data);
    } catch (error) {
        console.log('Become mentor failed:', error.response?.status, error.response?.data);
    }
}

testBecomeMentor();
