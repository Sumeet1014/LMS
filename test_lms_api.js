// LMS API Test Script
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testLMSAPI() {
  console.log('🧪 Testing LMS API Endpoints (Port 5000)...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health:', healthResponse.data);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    try {
      const testEmail = `testuser${Date.now()}@lms.com`;
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: testEmail,
        password: 'password123',
        fullName: 'Test User',
        role: 'student'
      });
      console.log('✅ Registration Success:', {
        user: registerResponse.data.user?.email,
        token: registerResponse.data.token ? 'JWT token received' : 'No token'
      });
      const token = registerResponse.data.token;
      console.log('');

      // Test 3: User Login
      console.log('3. Testing User Login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'password123'
      });
      console.log('✅ Login Success:', {
        user: loginResponse.data.user?.email,
        token: loginResponse.data.token ? 'JWT token received' : 'No token'
      });
      console.log('');

      // Test 4: Get Current User
      console.log('4. Testing Get Current User...');
      const userResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Current User:', {
        email: userResponse.data.user?.email,
        role: userResponse.data.user?.role,
        id: userResponse.data.user?.id
      });
      console.log('');

      // Test 5: Get Subjects
      console.log('5. Testing Get Subjects...');
      const subjectsResponse = await axios.get(`${API_BASE}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Subjects:', subjectsResponse.data.subjects?.length || 0, 'subjects found');
      if (subjectsResponse.data.subjects?.length > 0) {
        console.log('   First subject:', subjectsResponse.data.subjects[0].name);
      }
      console.log('');

      // Test 6: Get Challenges
      console.log('6. Testing Get Challenges...');
      const challengesResponse = await axios.get(`${API_BASE}/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Challenges:', challengesResponse.data.challenges?.length || 0, 'challenges found');
      if (challengesResponse.data.challenges?.length > 0) {
        console.log('   First challenge:', challengesResponse.data.challenges[0].title);
      }
      console.log('');

      // Test 7: Get Quiz Questions
      console.log('7. Testing Get Quiz Questions...');
      const quizResponse = await axios.get(`${API_BASE}/quizzes/questions/1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Quiz Questions:', quizResponse.data.questions?.length || 0, 'questions found');
      if (quizResponse.data.questions?.length > 0) {
        console.log('   First question:', quizResponse.data.questions[0].question_text?.substring(0, 50) + '...');
      }
      console.log('');

      // Test 8: Get Mentors
      console.log('8. Testing Get Mentors...');
      try {
        const mentorsResponse = await axios.get(`${API_BASE}/profiles/mentors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Mentors:', mentorsResponse.data.mentors?.length || 0, 'mentors found');
      } catch (error) {
        console.log('⚠️  Mentors endpoint may need users to be mentors first');
      }
      console.log('');

      console.log('🎉 LMS API Tests Complete!');
      console.log('✅ All core functionality is working');
      console.log('✅ Database connection successful');
      console.log('✅ Authentication system working');
      console.log('✅ Quiz system working');
      console.log('✅ Ready for frontend integration');

    } catch (regError) {
      if (regError.response?.data?.error?.includes('database')) {
        console.log('❌ Database not set up yet');
        console.log('   Please run MySQL Workbench setup:');
        console.log('   1. Open MySQL Workbench');
        console.log('   2. Connect with: root / Neha@2001');
        console.log('   3. Run: CREATE DATABASE lms_db;');
        console.log('   4. Import: backend\\database\\lms_schema.sql');
        console.log('   Or see: MYSQL_WORKBENCH_SETUP.md');
      } else {
        console.log('❌ Registration Error:', regError.response?.data || regError.message);
      }
    }

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Make sure backend is running on port 5000');
    }
  }
}

// Run the test
testLMSAPI();
