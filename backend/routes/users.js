const express = require('express');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll();
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get students list (mentor can access to create sessions)
router.get('/list/students', authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { executeQuery } = require('../config/db');
    const students = await executeQuery(
      `SELECT u.id, u.full_name, u.email, u.role 
       FROM users u WHERE u.role = 'student' 
       ORDER BY u.full_name ASC`
    );
    res.json({ users: students });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get students' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this user' });
    }

    const user = await User.getUserWithProfile(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
