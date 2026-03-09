const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get resources
router.get('/', async (req, res) => {
  try {
    const { subjectId } = req.query;

    let query = 'SELECT * FROM resources';
    const params = [];

    if (subjectId) {
      query += ' WHERE subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY created_at DESC';

    const resources = await executeQuery(query, params);

    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

// Get shared resources for session
router.get('/shared/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Check if user is session participant
    const sessions = await executeQuery(
      'SELECT id FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    const resources = await executeQuery(
      'SELECT * FROM shared_resources WHERE session_id = ? ORDER BY created_at DESC',
      [sessionId]
    );

    res.json({ resources });
  } catch (error) {
    console.error('Get shared resources error:', error);
    res.status(500).json({ error: 'Failed to get shared resources' });
  }
});

// Share resource in session
router.post('/shared/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, description, resource_url, resource_type, mime_type, file_size, metadata } = req.body;
    const userId = req.user.id;

    // Check if user is session participant
    const sessions = await executeQuery(
      'SELECT id FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    // Create shared resource
    const resourceId = require('uuid').v4();
    await executeQuery(
      'INSERT INTO shared_resources (id, title, description, resource_url, resource_type, mime_type, file_size, metadata, session_id, shared_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [resourceId, title, description, resource_url, resource_type, mime_type, file_size, JSON.stringify(metadata), sessionId, userId, new Date().toISOString().slice(0, 19).replace('T', ' ')]
    );

    res.status(201).json({
      resource: { id: resourceId },
      message: 'Resource shared successfully'
    });
  } catch (error) {
    console.error('Share resource error:', error);
    res.status(500).json({ error: 'Failed to share resource' });
  }
});

module.exports = router;
