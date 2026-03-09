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
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
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
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for session chat
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    socket.to(`session-${data.sessionId}`).emit('chat-message', data);
  });

  // Handle whiteboard strokes
  socket.on('whiteboard-stroke', (data) => {
    socket.to(`session-${data.sessionId}`).emit('whiteboard-stroke', data);
  });

  // Handle whiteboard clear
  socket.on('whiteboard-clear', (data) => {
    socket.to(`session-${data.sessionId}`).emit('whiteboard-clear', data);
  });

  // Handle WebRTC signals
  socket.on('signal', (data) => {
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
