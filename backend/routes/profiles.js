const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.getMentors();
    res.json({ mentors });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to get mentors' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await Profile.getLeaderboard(parseInt(limit));
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get user's own profile
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.getByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.getByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get mentor stats
router.get('/mentor-stats/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    // Verify the user is a mentor
    const mentorProfile = await Profile.getByUserId(mentorId);
    if (!mentorProfile || !mentorProfile.is_mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const stats = await Profile.getMentorStats(mentorId);
    res.json({ stats });
  } catch (error) {
    console.error('Get mentor stats error:', error);
    res.status(500).json({ error: 'Failed to get mentor stats' });
  }
});

// Get student stats
router.get('/student-stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const stats = await Profile.getStudentStats(studentId);
    res.json({ stats });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ error: 'Failed to get student stats' });
  }
});

module.exports = router;
