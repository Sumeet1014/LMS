const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { body, validationResult } = require('express-validator');

// Generate JWT token function
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

class AuthController {
  // User registration
  async register(req, res) {
    console.log('Register request received:', req.body.email);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Registration validation failed:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, fullName, role = 'student' } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('Registration failed: User already exists -', email);
        return res.status(400).json({ error: 'User already exists' });
      }
      console.log('User does not exist, proceeding with creation...');

      // Create user
      const user = await User.createUser({
        email,
        password,
        full_name: fullName,
        role
      });

      // Create profile
      await Profile.upsertProfile(user.id, {
        username: fullName.toLowerCase().replace(/\s+/g, '_'),
        credits: 0,
        contribution_score: 0,
        total_sessions_attended: 0,
        total_sessions_taught: 0
      });

      // Generate token
      const token = generateToken(user.id);

      // Return user data without password
      const { password_hash: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        user: {
          ...userWithoutPassword,
          name: userWithoutPassword.full_name
        },
        token,
        message: 'User registered successfully'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // User login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Login validation failed:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Verify user credentials
      const user = await User.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);

      // Get user with profile
      const userWithProfile = await User.getUserWithProfile(user.id);

      // Return user data without password
      const { password_hash: _, ...userWithoutPassword } = userWithProfile;

      res.json({
        success: true,
        user: {
          ...userWithoutPassword,
          name: userWithoutPassword.full_name
        },
        token,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const userWithProfile = await User.getUserWithProfile(req.user.id);

      if (!userWithProfile) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user data without password
      const { password_hash: _, ...userWithoutPassword } = userWithProfile;
      res.json({
        success: true,
        user: {
          ...userWithoutPassword,
          name: userWithoutPassword.full_name
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { username, bio, college_email, subjects, availability } = req.body;
      const userId = req.user.id;

      // Update profile
      const updatedProfile = await Profile.upsertProfile(userId, {
        username,
        bio,
        college_email,
        subjects,
        availability
      });

      // Also update user name if provided
      if (req.body.fullName) {
        await User.updateById(userId, { name: req.body.fullName });
      }

      // Get updated user with profile
      const userWithProfile = await User.getUserWithProfile(userId);

      res.json({
        user: userWithProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Become a mentor
  async becomeMentor(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { username, bio, college_email, subjects, availability } = req.body;
      const userId = req.user.id;

      // Update user role to mentor
      await User.updateRole(userId, 'mentor');

      // Update profile with mentor information
      await Profile.upsertProfile(userId, {
        username,
        bio,
        college_email,
        subjects,
        availability,
        is_mentor: true
      });

      // Get updated user with profile
      const userWithProfile = await User.getUserWithProfile(userId);

      res.json({
        user: userWithProfile,
        message: 'Successfully became a mentor'
      });
    } catch (error) {
      console.error('Become mentor error:', error);
      console.log('Full error stack:', error.stack);
      res.status(500).json({ error: 'Failed to become mentor', details: error.message });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await require('bcrypt').compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      await User.updatePassword(userId, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. We can optionally implement token blacklisting
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

module.exports = new AuthController();
