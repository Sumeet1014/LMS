# Peer Pivot Learn Backend

Node.js + Express + MySQL backend for the Peer Pivot Learn platform, replacing Supabase + PostgreSQL.

## Features

- JWT Authentication with bcrypt password hashing
- RESTful API endpoints for all platform features
- Real-time chat and whiteboard with Socket.io
- MySQL database with optimized schemas
- Session management and scheduling
- AI chat integration with OpenAI
- Quiz and challenge system
- Certificate generation
- Profile management and mentor matching

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Socket.io** - Real-time communication
- **OpenAI API** - AI chat functionality

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 2. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE peer_pivot_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import the schema:
```bash
mysql -u your_username -p peer_pivot_learn < database/schema.sql
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=peer_pivot_learn

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# External Services
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/become-mentor` - Become a mentor
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Users & Profiles
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/profiles/mentors` - Get all mentors
- `GET /api/profiles/leaderboard` - Get leaderboard
- `GET /api/profiles/me` - Get current user's profile
- `GET /api/profiles/user/:userId` - Get user profile by ID

### Sessions
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/upcoming` - Get upcoming sessions
- `GET /api/sessions/mentor` - Get mentor sessions
- `GET /api/sessions/student` - Get student sessions
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id/status` - Update session status
- `POST /api/sessions/:id/video-room` - Generate video room ID
- `GET /api/sessions/stats` - Get session statistics

### Messages
- `POST /api/messages/sessions/:sessionId` - Send session message
- `GET /api/messages/sessions/:sessionId` - Get session messages
- `POST /api/messages/video-chat/:roomId` - Send video chat message
- `GET /api/messages/video-chat/:roomId` - Get video chat messages

### AI Chat
- `POST /api/ai-chat/ai-chat` - Send AI chat message
- `GET /api/ai-chat/history` - Get AI chat history

### Challenges
- `GET /api/challenges` - Get active challenges
- `GET /api/challenges/progress` - Get user challenge progress
- `POST /api/challenges/progress/:challengeId` - Update challenge progress

### Quizzes
- `GET /api/quizzes/questions/:challengeId` - Get quiz questions
- `POST /api/quizzes/submit` - Submit quiz attempt
- `GET /api/quizzes/attempts` - Get user quiz attempts

### Resources
- `GET /api/resources` - Get resources
- `GET /api/resources/shared/:sessionId` - Get shared resources for session
- `POST /api/resources/shared/:sessionId` - Share resource in session

### Certificates
- `GET /api/certificates` - Get user certificates
- `GET /api/certificates/shared/:shareToken` - Get certificate by share token
- `POST /api/certificates` - Create certificate

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID

### Feedback
- `POST /api/feedback/sessions/:sessionId` - Submit session feedback
- `GET /api/feedback/mentor/:mentorId` - Get feedback for mentor
- `GET /api/feedback/mentor/:mentorId/stats` - Get mentor rating stats

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Real-time Features

The backend supports real-time features using Socket.io:

### Events
- `join-session` - Join a session room
- `chat-message` - Send/receive chat messages
- `whiteboard-stroke` - Send/receive whiteboard strokes

### Example Socket.io Usage

```javascript
const socket = io('http://localhost:3001');

// Join a session
socket.emit('join-session', sessionId);

// Send chat message
socket.emit('chat-message', {
  sessionId: 'session-id',
  message: 'Hello!',
  userId: 'user-id'
});

// Listen for messages
socket.on('chat-message', (data) => {
  console.log('New message:', data);
});
```

## Database Schema

The database includes the following main tables:
- `users` - User authentication and basic info
- `profiles` - Extended user profiles
- `subjects` - Subject categories
- `session_requests` - Session scheduling
- `session_messages` - Session chat messages
- `ai_chats` - AI conversation history
- `challenges` - Learning challenges
- `quiz_*` - Quiz system tables
- `certificates` - Achievement certificates
- `resources` - Learning materials
- `session_feedback` - Rating and feedback system

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Running Tests

```bash
npm test
```

### Code Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/           # API controllers
├── middleware/            # Express middleware
├── models/               # Database models
├── routes/               # API routes
├── database/
│   └── schema.sql         # MySQL schema
├── server.js             # Main server file
├── package.json          # Dependencies
└── README.md             # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- Rate limiting
- CORS configuration
- Helmet security headers

## Migration from Supabase

This backend is designed as a drop-in replacement for Supabase. The API responses match the structure that Supabase returned, ensuring frontend compatibility.

Key differences:
- Authentication uses JWT instead of Supabase Auth
- Database uses MySQL instead of PostgreSQL
- Real-time features use Socket.io instead of Supabase Realtime
- File storage uses local filesystem (can be extended to cloud storage)
