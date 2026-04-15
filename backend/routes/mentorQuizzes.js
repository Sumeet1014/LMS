const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// ── MENTOR: Create a quiz (challenge) ─────────────────────────────────────
router.post('/', authenticateToken, authorizeRole(['mentor', 'admin']), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

  try {
    const { title, subject, description, duration = 30, points_reward = 50, questions } = req.body;

    // Create challenge
    const result = await executeQuery(
      `INSERT INTO challenges (title, subject, description, duration, points_reward, is_active, start_date, end_date, target_metric, target_value)
       VALUES (?, ?, ?, ?, ?, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), 'quiz_score', ?)`,
      [title, subject, description || null, duration, points_reward, points_reward]
    );
    const challengeId = result.insertId;

    // Insert questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qResult = await executeQuery(
        'INSERT INTO quiz_questions (challenge_id, question_text, marks, question_order) VALUES (?, ?, ?, ?)',
        [challengeId, q.question_text, q.marks || 10, i + 1]
      );
      const questionId = qResult.insertId;

      for (let j = 0; j < (q.options || []).length; j++) {
        const opt = q.options[j];
        await executeQuery(
          'INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
          [questionId, opt.option_text, opt.is_correct ? 1 : 0, j + 1]
        );
      }
    }

    res.status(201).json({ challenge_id: challengeId, message: 'Quiz created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// ── MENTOR: Get all quizzes created by mentor ─────────────────────────────
router.get('/my', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    // Get challenges where subject matches mentor's subjects
    const quizzes = await executeQuery(
      `SELECT c.*,
        (SELECT COUNT(*) FROM quiz_questions WHERE challenge_id = c.id) as question_count,
        (SELECT COUNT(*) FROM quiz_attempts WHERE challenge_id = c.id) as attempt_count
       FROM challenges c
       ORDER BY c.created_at DESC`
    );
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

// ── MENTOR: Get quiz with questions ──────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const challenges = await executeQuery('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
    if (!challenges.length) return res.status(404).json({ error: 'Quiz not found' });

    const questions = await executeQuery(
      'SELECT * FROM quiz_questions WHERE challenge_id = ? ORDER BY question_order',
      [req.params.id]
    );

    for (const q of questions) {
      q.options = await executeQuery(
        'SELECT * FROM quiz_options WHERE question_id = ? ORDER BY option_order',
        [q.id]
      );
    }

    res.json({ quiz: { ...challenges[0], questions } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// ── MENTOR: Update quiz ───────────────────────────────────────────────────
router.put('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { title, subject, description, duration, points_reward, is_active } = req.body;
    await executeQuery(
      'UPDATE challenges SET title=?, subject=?, description=?, duration=?, points_reward=?, is_active=? WHERE id=?',
      [title, subject, description, duration, points_reward, is_active ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Quiz updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// ── MENTOR: Delete quiz ───────────────────────────────────────────────────
router.delete('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    await executeQuery('DELETE FROM challenges WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ── MENTOR: Get attempts for a quiz ──────────────────────────────────────
router.get('/:id/attempts', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const attempts = await executeQuery(
      `SELECT qa.*, u.full_name, u.email
       FROM quiz_attempts qa
       JOIN users u ON qa.user_id = u.id
       WHERE qa.challenge_id = ?
       ORDER BY qa.created_at DESC`,
      [req.params.id]
    );
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get attempts' });
  }
});

module.exports = router;
