const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const router = express.Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const fullName = profile.displayName;
    const googleId = profile.id;

    if (!email) return done(new Error('No email from Google'), null);

    // Check if user exists
    let users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      // Create new user
      const hashedPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, 10);
      const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();

      await executeQuery(
        'INSERT INTO users (email, password_hash, full_name, username, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, fullName, username, 'student', true]
      );

      users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
      const newUser = users[0];

      // Create profile
      await executeQuery(
        'INSERT INTO profiles (user_id, username, credits, contribution_score, total_sessions_attended, total_sessions_taught) VALUES (?, ?, 0, 0, 0, 0)',
        [newUser.id, username]
      );
    }

    const user = users[0];
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const users = await executeQuery('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0] || null);
  } catch (e) { done(e, null); }
});

// Step 1 — Redirect to Google
router.get('/', (req, res, next) => {
  console.log('Google OAuth initiated, callback URL:', process.env.GOOGLE_CALLBACK_URL);
  next();
}, passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// Step 2 — Google callback
router.get('/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`, session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Get profile
      const profiles = await executeQuery('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
      const profile = profiles[0] || {};

      const userData = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        name: user.full_name,
        role: user.role,
        username: profile.username || user.username,
        credits: profile.credits || 0,
        is_mentor: profile.is_mentor || false
      };

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = { router, passport };
