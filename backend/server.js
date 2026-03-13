const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(morgan('dev'));

const server = createServer(app);

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:5173", "http://localhost:8080"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for development)
  message: 'Too many authentication attempts, please try again later'
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profiles');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const aiChatRoutes = require('./routes/aiChat');
const challengeRoutes = require('./routes/challenges');
const quizRoutes = require('./routes/quizzes');
const resourceRoutes = require('./routes/resources');
const certificateRoutes = require('./routes/certificates');
const subjectRoutes = require('./routes/subjects');
const feedbackRoutes = require('./routes/feedback');
const mentorProfileRoutes = require('./routes/mentorProfiles');

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/mentor-profiles', mentorProfileRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time features
io.use((socket, next) => {
  // Authenticate socket connection
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);

  // Join room for session chat
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    // Verify user is authenticated
    if (!socket.userId) return;
    socket.to(`session-${data.sessionId}`).emit('chat-message', {
      ...data,
      userId: socket.userId
    });
  });

  // Handle whiteboard strokes
  socket.on('whiteboard-stroke', (data) => {
    // Verify user is authenticated
    if (!socket.userId) return;
    socket.to(`session-${data.sessionId}`).emit('whiteboard-stroke', data);
  });

  // Handle whiteboard clear
  socket.on('whiteboard-clear', (data) => {
    // Verify user is authenticated
    if (!socket.userId) return;
    socket.to(`session-${data.sessionId}`).emit('whiteboard-clear', data);
  });

  // Handle WebRTC signals
  socket.on('signal', (data) => {
    // Verify user is authenticated
    if (!socket.userId) return;
    socket.to(`session-${data.sessionId}`).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
