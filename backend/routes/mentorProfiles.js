const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const MentorProfile = require('../models/MentorProfile');

const router = express.Router();

// Validation rules
const createProfileValidation = [
  body('profile_name').trim().isLength({ min: 3, max: 255 }).withMessage('Profile name must be 3-255 characters'),
  body('bio').trim().isLength({ min: 10, max: 1000 }).withMessage('Bio must be 10-1000 characters'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('expertise_level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
];

// Get current user's mentor profiles (MUST be before /:id route)
router.get('/my/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await MentorProfile.findByUserId(req.user.id);
    res.json({ profiles });
  } catch (error) {
    console.error('Get my mentor profiles error:', error);
    res.status(500).json({ error: 'Failed to get your mentor profiles' });
  }
});

// Get all mentor profiles (public)
router.get('/', async (req, res) => {
  try {
    const { subject, expertise_level, limit } = req.query;
    
    const profiles = await MentorProfile.findAllActive({
      subject,
      expertise_level,
      limit
    });

    res.json({ profiles });
  } catch (error) {
    console.error('Get mentor profiles error:', error);
    res.status(500).json({ error: 'Failed to get mentor profiles' });
  }
});

// Get mentor profile by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const profile = await MentorProfile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get mentor profile error:', error);
    res.status(500).json({ error: 'Failed to get mentor profile' });
  }
});

// Create a new mentor profile
router.post('/', authenticateToken, createProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const profile = await MentorProfile.create(req.user.id, req.body);

    res.status(201).json({
      profile,
      message: 'Mentor profile created successfully'
    });
  } catch (error) {
    console.error('Create mentor profile error:', error);
    res.status(500).json({ error: 'Failed to create mentor profile' });
  }
});

// Update mentor profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await MentorProfile.update(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!profile) {
      return res.status(404).json({ error: 'Mentor profile not found or unauthorized' });
    }

    res.json({
      profile,
      message: 'Mentor profile updated successfully'
    });
  } catch (error) {
    console.error('Update mentor profile error:', error);
    res.status(500).json({ error: 'Failed to update mentor profile' });
  }
});

// Delete mentor profile
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await MentorProfile.delete(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Mentor profile not found or unauthorized' });
    }

    res.json({ message: 'Mentor profile deleted successfully' });
  } catch (error) {
    console.error('Delete mentor profile error:', error);
    res.status(500).json({ error: 'Failed to delete mentor profile' });
  }
});

module.exports = router;
