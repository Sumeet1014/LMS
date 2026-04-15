const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// ── MENTOR: Create assignment ──────────────────────────────────────────────
router.post('/', authenticateToken, authorizeRole(['mentor', 'admin']), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('due_date').notEmpty().withMessage('Due date is required'),
  body('total_marks').optional().isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

  try {
    const { title, description, course_id, due_date, total_marks = 100 } = req.body;
    const result = await executeQuery(
      'INSERT INTO assignments (course_id, title, description, due_date, total_marks) VALUES (?, ?, ?, ?, ?)',
      [course_id, title, description || null, due_date, total_marks]
    );
    const assignment = await executeQuery('SELECT * FROM assignments WHERE id = ?', [result.insertId]);
    res.status(201).json({ assignment: assignment[0], message: 'Assignment created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// ── MENTOR: Get assignments for a course ──────────────────────────────────
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const assignments = await executeQuery(
      'SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date ASC',
      [req.params.courseId]
    );
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// ── MENTOR: Get all assignments created by mentor (via their courses) ─────
router.get('/my', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const assignments = await executeQuery(
      `SELECT a.*, c.title as course_title,
        (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id) as submission_count
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE c.created_by = ?
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// ── STUDENT: Get assignments for enrolled courses ─────────────────────────
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const assignments = await executeQuery(
      `SELECT a.*, c.title as course_title,
        asub.status as submission_status, asub.marks_obtained
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN course_enrollments ce ON ce.course_id = c.id AND ce.user_id = ?
       LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.user_id = ?
       ORDER BY a.due_date ASC`,
      [req.user.id, req.user.id]
    );
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// ── STUDENT: Submit assignment ────────────────────────────────────────────
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { file_url, pages } = req.body;
    const assignmentId = req.params.id;
    const userId = req.user.id;

    // Check already submitted
    const existing = await executeQuery(
      'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?',
      [assignmentId, userId]
    );
    if (existing.length > 0) return res.status(400).json({ error: 'Already submitted' });

    await executeQuery(
      'INSERT INTO assignment_submissions (assignment_id, user_id, file_url, pages, status) VALUES (?, ?, ?, ?, ?)',
      [assignmentId, userId, file_url || null, pages || null, 'submitted']
    );
    res.status(201).json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// ── MENTOR: Grade submission ──────────────────────────────────────────────
router.put('/submissions/:submissionId/grade', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { marks_obtained, feedback } = req.body;
    await executeQuery(
      'UPDATE assignment_submissions SET marks_obtained = ?, feedback = ?, status = ? WHERE id = ?',
      [marks_obtained, feedback || null, 'reviewed', req.params.submissionId]
    );
    res.json({ message: 'Graded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// ── MENTOR: Get submissions for an assignment ─────────────────────────────
router.get('/:id/submissions', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const submissions = await executeQuery(
      `SELECT asub.*, u.full_name, u.email
       FROM assignment_submissions asub
       JOIN users u ON asub.user_id = u.id
       WHERE asub.assignment_id = ?
       ORDER BY asub.submission_date DESC`,
      [req.params.id]
    );
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// ── MENTOR: Update assignment ─────────────────────────────────────────────
router.put('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { title, description, due_date, total_marks } = req.body;
    await executeQuery(
      'UPDATE assignments SET title = ?, description = ?, due_date = ?, total_marks = ? WHERE id = ?',
      [title, description, due_date, total_marks, req.params.id]
    );
    const assignment = await executeQuery('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ assignment: assignment[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// ── MENTOR: Delete assignment ─────────────────────────────────────────────
router.delete('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    await executeQuery('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
