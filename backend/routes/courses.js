const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// ── GET all active courses (student browse) ──────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await executeQuery(
      `SELECT c.*, u.full_name as mentor_name,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as student_count
       FROM courses c JOIN users u ON c.created_by = u.id
       WHERE c.is_active = TRUE ORDER BY c.created_at DESC`
    );
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// ── GET mentor's own courses ─────────────────────────────────────────────
router.get('/my', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const courses = await executeQuery(
      `SELECT c.*, (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as student_count
       FROM courses c WHERE c.created_by = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// ── GET student's enrolled courses ──────────────────────────────────────
router.get('/enrolled', authenticateToken, async (req, res) => {
  try {
    const courses = await executeQuery(
      `SELECT c.*, u.full_name as mentor_name, ce.status as enrollment_status, ce.enrolled_at
       FROM courses c
       JOIN course_enrollments ce ON ce.course_id = c.id
       JOIN users u ON c.created_by = u.id
       WHERE ce.user_id = ?
       ORDER BY ce.enrolled_at DESC`,
      [req.user.id]
    );
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get enrolled courses' });
  }
});

// ── POST create course (mentor) ──────────────────────────────────────────
router.post('/', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { title, domain, description, duration } = req.body;
    const result = await executeQuery(
      'INSERT INTO courses (title, domain, description, duration, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, domain || 'General', description || null, duration || 10, req.user.id]
    );
    const course = await executeQuery('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.status(201).json({ course: course[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// ── POST enroll student ──────────────────────────────────────────────────
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const existing = await executeQuery(
      'SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, req.params.id]
    );
    if (existing.length > 0) return res.status(400).json({ error: 'Already enrolled' });

    // Enroll student
    await executeQuery(
      'INSERT INTO course_enrollments (user_id, course_id, status) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, 'active']
    );

    // Get course details to auto-create a session
    const courses = await executeQuery('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (courses.length > 0) {
      const course = courses[0];
      // Schedule session for tomorrow at 10 AM
      const sessionTime = new Date();
      sessionTime.setDate(sessionTime.getDate() + 1);
      sessionTime.setHours(10, 0, 0, 0);
      const mysqlDateTime = sessionTime.toISOString().slice(0, 19).replace('T', ' ');
      const roomId = `room_c${course.id}_s${req.user.id}_${Date.now()}`;

      await executeQuery(
        `INSERT INTO session_requests 
         (mentor_id, student_id, title, description, requested_time, duration, status, video_room_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, NOW())`,
        [
          course.created_by,
          req.user.id,
          `${course.title} - Live Class`,
          `Auto-created session for course: ${course.title}`,
          mysqlDateTime,
          60,
          roomId
        ]
      );
    }

    res.status(201).json({ message: 'Enrolled successfully. Session scheduled!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// ── PUT update course (mentor) ───────────────────────────────────────────
router.put('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    const { title, domain, description, duration } = req.body;
    await executeQuery(
      'UPDATE courses SET title=?, domain=?, description=?, duration=? WHERE id=? AND created_by=?',
      [title, domain, description || null, duration, req.params.id, req.user.id]
    );
    const course = await executeQuery('SELECT * FROM courses WHERE id=?', [req.params.id]);
    res.json({ course: course[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// ── DELETE course (mentor) ───────────────────────────────────────────────
router.delete('/:id', authenticateToken, authorizeRole(['mentor', 'admin']), async (req, res) => {
  try {
    await executeQuery('DELETE FROM courses WHERE id=? AND created_by=?', [req.params.id, req.user.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
