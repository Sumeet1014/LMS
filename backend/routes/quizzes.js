const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get quiz questions for challenge
router.get('/questions/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;

    const questions = await executeQuery(
      `SELECT qq.*, qo.option_text, qo.is_correct, qo.option_order
       FROM quiz_questions qq
       LEFT JOIN quiz_options qo ON qq.id = qo.question_id
       WHERE qq.challenge_id = ?
       ORDER BY qq.question_order ASC, qo.option_order ASC`,
      [challengeId]
    );

    // Group options by question
    const questionsWithOptions = questions.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          question_text: row.question_text,
          marks: row.marks,
          question_order: row.question_order,
          options: []
        };
      }

      if (row.option_text) {
        acc[row.id].options.push({
          option_text: row.option_text,
          is_correct: row.is_correct,
          option_order: row.option_order
        });
      }

      return acc;
    }, {});

    res.json({ questions: Object.values(questionsWithOptions) });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ error: 'Failed to get quiz questions' });
  }
});

// Submit quiz attempt
router.post('/submit', async (req, res) => {
  try {
    const { challengeId, answers } = req.body;
    const userId = req.user.id;

    // Calculate score
    const questions = await executeQuery(
      'SELECT id, marks FROM quiz_questions WHERE challenge_id = ?',
      [challengeId]
    );

    let totalScore = 0;
    let totalMarks = 0;
    const answerMap = Array.isArray(answers) ?
      answers.reduce((acc, a) => ({ ...acc, [a.question_id]: a.selected_option_id }), {}) :
      answers;

    for (const question of questions) {
      totalMarks += question.marks;

      const userAnswerId = answerMap[question.id];
      if (userAnswerId) {
        const correctOption = await executeQuery(
          'SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = true',
          [question.id]
        );

        // Note: comparing IDs. Ensure both are same type (int or string)
        if (correctOption.length > 0 && String(userAnswerId) === String(correctOption[0].id)) {
          totalScore += question.marks;
        }
      }
    }

    const passed = (totalScore / totalMarks) >= 0.6; // 60% pass rate

    // Save quiz attempt
    await executeQuery(
      'INSERT INTO quiz_attempts (user_id, challenge_id, answers, score, total, passed, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, challengeId, JSON.stringify(answerMap), totalScore, totalMarks, passed, new Date()]
    );

    res.json({
      score: totalScore,
      total: totalMarks,
      passed,
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user quiz attempts
router.get('/attempts', async (req, res) => {
  try {
    const { challengeId } = req.query;
    const userId = req.user.id;

    let query = 'SELECT * FROM quiz_attempts WHERE user_id = ?';
    const params = [userId];

    if (challengeId) {
      query += ' AND challenge_id = ?';
      params.push(challengeId);
    }

    query += ' ORDER BY created_at DESC';

    const attempts = await executeQuery(query, params);

    res.json({ attempts });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ error: 'Failed to get quiz attempts' });
  }
});

module.exports = router;
