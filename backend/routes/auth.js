const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters long'),
  body('full_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'mentor'])
    .withMessage('Role must be either student or mentor')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters long'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('college_email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid college email is required'),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array')
];

const becomeMentorValidation = [
  body('username')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters long'),
  body('bio')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Bio must be between 10 and 500 characters'),
  body('college_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid college email is required'),
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, updateProfileValidation, authController.updateProfile);
router.post('/become-mentor', authenticateToken, becomeMentorValidation, authController.becomeMentor);
router.post('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
