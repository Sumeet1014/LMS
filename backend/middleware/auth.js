const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const users = await executeQuery(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user is part of a session
const authorizeSessionParticipant = async (req, res, next) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  try {
    const sessions = await executeQuery(
      'SELECT id FROM session_requests WHERE id = ? AND (mentor_id = ? OR student_id = ?)',
      [sessionId, req.user.id, req.user.id]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    next();
  } catch (error) {
    console.error('Session authorization error:', error);
    return res.status(500).json({ error: 'Authorization error' });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await executeQuery(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    req.user = users.length > 0 ? users[0] : null;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeSessionParticipant,
  optionalAuth
};
