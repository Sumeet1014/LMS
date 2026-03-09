const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get active challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await executeQuery(
      'SELECT * FROM challenges WHERE is_active = true ORDER BY created_at DESC'
    );

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// Get user challenge progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await executeQuery(
      'SELECT * FROM user_challenge_progress WHERE user_id = ?',
      [userId]
    );

    res.json({ progress });
  } catch (error) {
    console.error('Get challenge progress error:', error);
    res.status(500).json({ error: 'Failed to get challenge progress' });
  }
});

// Update challenge progress
router.post('/progress/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { current_value, completed } = req.body;
    const userId = req.user.id;

    // Check if progress exists
    const existing = await executeQuery(
      'SELECT id FROM user_challenge_progress WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );

    if (existing.length > 0) {
      await executeQuery(
        'UPDATE user_challenge_progress SET current_value = ?, completed = ? WHERE user_id = ? AND challenge_id = ?',
        [current_value, completed, userId, challengeId]
      );
    } else {
      await executeQuery(
        'INSERT INTO user_challenge_progress (user_id, challenge_id, current_value, completed) VALUES (?, ?, ?, ?)',
        [userId, challengeId, current_value, completed]
      );
    }

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ error: 'Failed to update challenge progress' });
  }
});

module.exports = router;
