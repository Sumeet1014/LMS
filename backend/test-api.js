// Simple API test without database
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    endpoints: [
      'GET /health - Health check',
      'GET /api/test - This test endpoint',
      'POST /api/auth/register - User registration (requires DB)',
      'POST /api/auth/login - User login (requires DB)',
      'GET /api/profiles/mentors - Get mentors (requires DB)',
      'GET /api/sessions - Get sessions (requires DB)'
    ]
  });
});

// Mock auth endpoint for testing
app.post('/api/auth/test', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'Auth endpoint structure is correct',
    received: { email, password },
    note: 'This is a test endpoint. Real auth requires database setup.'
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/health`);
  console.log(`API Test: http://localhost:${PORT}/api/test`);
});

module.exports = app;
