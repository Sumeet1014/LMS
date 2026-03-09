const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');
const Profile = require('../models/Profile');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const submitFeedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback_text')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback text must be less than 1000 characters')
];

// Submit session feedback
router.post('/sessions/:sessionId', submitFeedbackValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { sessionId } = req.params;
    const { rating, feedback_text } = req.body;
    const userId = req.user.id;

    // Check if user participated in session and session is completed
    const sessions = await executeQuery(
      'SELECT * FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?) AND status = ?',
      [sessionId, userId, userId, 'completed']
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized to give feedback for this session' });
    }

    const session = sessions[0];

    // Check if feedback already exists
    const existingFeedback = await executeQuery(
      'SELECT id FROM session_feedback WHERE session_id = ? AND student_id = ?',
      [sessionId, userId]
    );

    if (existingFeedback.length > 0) {
      return res.status(400).json({ error: 'Feedback already submitted for this session' });
    }

    // Create feedback
    const feedbackId = require('uuid').v4();
    const mentorId = session.mentor_id;
    const studentId = session.student_id;

    await executeQuery(
      'INSERT INTO session_feedback (id, session_id, mentor_id, student_id, rating, feedback_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [feedbackId, sessionId, mentorId, studentId, rating, feedback_text, new Date().toISOString().slice(0, 19).replace('T', ' '), new Date().toISOString().slice(0, 19).replace('T', ' ')]
    );

    // Update mentor's average rating
    const allRatings = await executeQuery(
      'SELECT AVG(rating) as avg_rating FROM session_feedback WHERE mentor_id = ?',
      [mentorId]
    );

    if (allRatings.length > 0 && allRatings[0].avg_rating) {
      await Profile.updateRating(mentorId, parseFloat(allRatings[0].avg_rating));
    }

    res.status(201).json({
      feedback: { id: feedbackId },
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for mentor
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;

    const feedback = await executeQuery(
      `SELECT sf.*, sr.title as session_title, p.username as student_name
       FROM session_feedback sf
       LEFT JOIN session_requests sr ON sf.session_id = sr.id
       LEFT JOIN profiles p ON sf.student_id = p.user_id
       WHERE sf.mentor_id = ?
       ORDER BY sf.created_at DESC`,
      [mentorId]
    );

    res.json({ feedback });
  } catch (error) {
    console.error('Get mentor feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

// Get mentor rating stats
router.get('/mentor/:mentorId/stats', async (req, res) => {
  try {
    const { mentorId } = req.params;

    const stats = await executeQuery(
      `SELECT 
         COUNT(*) as total_feedbacks,
         AVG(rating) as average_rating,
         COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
         COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
       FROM session_feedback
       WHERE mentor_id = ?`,
      [mentorId]
    );

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Get mentor stats error:', error);
    res.status(500).json({ error: 'Failed to get mentor stats' });
  }
});

module.exports = router;
