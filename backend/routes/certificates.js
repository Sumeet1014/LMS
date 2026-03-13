const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// Get certificate by share token (PUBLIC - no auth required)
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    const certificates = await executeQuery(
      'SELECT * FROM certificates WHERE share_token = ?',
      [shareToken]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = certificates[0];

    // Get user profile
    const profiles = await executeQuery(
      'SELECT username FROM profiles WHERE user_id = ?',
      [certificate.user_id]
    );

    res.json({
      certificate: {
        ...certificate,
        username: profiles.length > 0 ? profiles[0].username : 'Unknown'
      }
    });
  } catch (error) {
    console.error('Get shared certificate error:', error);
    res.status(500).json({ error: 'Failed to get certificate' });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Get user certificates
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await executeQuery(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to get certificates' });
  }
});

// Create certificate
router.post('/', async (req, res) => {
  try {
    const { title, badge_id, challenge_id, score } = req.body;
    const userId = req.user.id;

    // Generate share token
    const shareToken = require('uuid').v4().replace(/-/g, '');
    const certificateId = require('uuid').v4();

    await executeQuery(
      'INSERT INTO certificates (id, title, user_id, badge_id, challenge_id, score, share_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [certificateId, title, userId, badge_id, challenge_id, score, shareToken, new Date().toISOString().slice(0, 19).replace('T', ' ')]
    );

    res.status(201).json({
      certificate: {
        id: certificateId,
        share_token: shareToken
      },
      message: 'Certificate created successfully'
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

module.exports = router;
