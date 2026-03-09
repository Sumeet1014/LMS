const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/db');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await executeQuery(
      'SELECT * FROM subjects ORDER BY name ASC'
    );

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const subjects = await executeQuery(
      'SELECT * FROM subjects WHERE id = ?',
      [id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ subject: subjects[0] });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to get subject' });
  }
});

module.exports = router;
