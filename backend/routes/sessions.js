const express = require('express');
const { body } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { authenticateToken, authorizeSessionParticipant } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createSessionValidation = [
  body('mentor_id')
    .notEmpty()
    .withMessage('Mentor ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('subject_id')
    .notEmpty()
    .withMessage('Subject ID is required'),
  body('requested_time')
    .notEmpty()
    .withMessage('Requested time is required')
    .isISO8601()
    .withMessage('Requested time must be a valid date')
    .custom((value) => {
      const requestedDate = new Date(value);
      const now = new Date();
      if (requestedDate <= now) {
        throw new Error('Requested time must be in the future');
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
];

const updateStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected', 'completed'])
    .withMessage('Status must be approved, rejected, or completed'),
  body('rejection_reason')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Rejection reason must be less than 300 characters')
];

// All routes require authentication
router.use(authenticateToken);

// Session routes
router.post('/', createSessionValidation, sessionController.createSession);
router.get('/', sessionController.getUserSessions);
router.get('/upcoming', sessionController.getUpcomingSessions);
router.get('/mentor', sessionController.getMentorSessions);
router.get('/student', sessionController.getStudentSessions);
router.get('/stats', sessionController.getSessionStats);
router.get('/:id', sessionController.getSession);
router.put('/:id/status', updateStatusValidation, sessionController.updateSessionStatus);
router.post('/:id/video-room', sessionController.generateVideoRoom);

module.exports = router;
