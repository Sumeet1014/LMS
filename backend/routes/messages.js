const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeSessionParticipant } = require('../middleware/auth');
const { executeQuery } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const sendMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

const sendSessionMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Send message to session
router.post('/sessions/:sessionId', sendSessionMessageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if user is session participant
    const sessions = await executeQuery(
      'SELECT id FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    // Create message
    const messageId = uuidv4();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await executeQuery(
      'INSERT INTO session_messages (id, session_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [messageId, sessionId, userId, content, createdAt]
    );

    // Get the created message
    const messages = await executeQuery(
      'SELECT sm.*, u.full_name as user_name FROM session_messages sm LEFT JOIN users u ON sm.user_id = u.id WHERE sm.id = ?',
      [messageId]
    );

    res.status(201).json({
      message: messages[0],
      success: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user is session participant
    const sessions = await executeQuery(
      'SELECT id FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?)',
      [sessionId, userId, userId]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    // Get messages
    const messages = await executeQuery(
      `SELECT sm.*, u.full_name as user_name 
       FROM session_messages sm 
       LEFT JOIN users u ON sm.user_id = u.id 
       WHERE sm.session_id = ? 
       ORDER BY sm.created_at ASC 
       LIMIT ? OFFSET ?`,
      [sessionId, parseInt(limit), parseInt(offset)]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get video chat messages for room
router.get('/video-chat/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get messages for room
    const messages = await executeQuery(
      `SELECT vcm.*, u.full_name as user_name 
       FROM video_chat_messages vcm 
       LEFT JOIN users u ON vcm.user_id = u.id 
       WHERE vcm.room_id = ? 
       ORDER BY vcm.created_at ASC 
       LIMIT ? OFFSET ?`,
      [roomId, parseInt(limit), parseInt(offset)]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get video chat messages error:', error);
    res.status(500).json({ error: 'Failed to get video chat messages' });
  }
});

// Send video chat message
router.post('/video-chat/:roomId', sendMessageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { roomId } = req.params;
    const { message } = req.body;
    const userId = req.user.id; // Keep as-is since it comes from DB

    console.log('Video chat message - roomId:', roomId, 'userId:', userId, 'userIdType:', typeof userId);

    // Create message
    const messageId = uuidv4();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await executeQuery(
      'INSERT INTO video_chat_messages (id, room_id, user_id, message, created_at) VALUES (?, ?, ?, ?, ?)',
      [messageId, roomId, userId, message, createdAt]
    );

    // Get the created message
    const messages = await executeQuery(
      'SELECT vcm.*, u.full_name as user_name FROM video_chat_messages vcm LEFT JOIN users u ON vcm.user_id = u.id WHERE vcm.id = ?',
      [messageId]
    );

    res.status(201).json({
      message: messages[0],
      success: true
    });
  } catch (error) {
    console.error('Send video chat message error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to send video chat message',
      details: error.message 
    });
  }
});

// Get whiteboard strokes
router.get('/whiteboard/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const strokes = await executeQuery(
      'SELECT * FROM whiteboard_strokes WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    );
    res.json({ strokes });
  } catch (error) {
    console.error('Get whiteboard strokes error:', error);
    res.status(500).json({ error: 'Failed to get whiteboard strokes' });
  }
});

// Save whiteboard stroke
router.post('/whiteboard/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { stroke_data } = req.body;
    const userId = req.user.id; // Keep as-is since it comes from DB

    console.log('Whiteboard stroke - roomId:', roomId, 'userId:', userId, 'userIdType:', typeof userId);

    const id = uuidv4();
    await executeQuery(
      'INSERT INTO whiteboard_strokes (id, room_id, user_id, stroke_data) VALUES (?, ?, ?, ?)',
      [id, roomId, userId, JSON.stringify(stroke_data)]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Save whiteboard stroke error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to save whiteboard stroke',
      details: error.message 
    });
  }
});

// Clear whiteboard strokes
router.delete('/whiteboard/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    await executeQuery(
      'DELETE FROM whiteboard_strokes WHERE room_id = ?',
      [roomId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Clear whiteboard error:', error);
    res.status(500).json({ error: 'Failed to clear whiteboard' });
  }
});

module.exports = router;
