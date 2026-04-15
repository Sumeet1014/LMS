# LEARNING MANAGEMENT SYSTEM - DBMS PROJECT DOCUMENTATION
## Complete Viva Preparation Guide

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Design](#3-database-design)
4. [File Structure Analysis](#4-file-structure-analysis)
5. [Function/Query Explanation](#5-functionquery-explanation)
6. [System Workflow](#6-system-workflow)
7. [Key Features](#7-key-features)
8. [Project Architecture](#8-project-architecture)
9. [Viva Questions & Answers](#9-viva-questions--answers)
10. [Improvements](#10-improvements)

---

## 1. PROJECT OVERVIEW

### Project Name
**Learning Management System (LMS)** - Peer-to-Peer Learning Platform

### Purpose of the System
The Learning Management System is a comprehensive web-based platform designed to facilitate peer-to-peer learning through mentor-student connections. It enables students to find mentors, schedule learning sessions, participate in video calls, take quizzes, earn certificates, and track their learning progress.

### Problem the System Solves
1. **Lack of personalized learning**: Students struggle to find mentors for specific subjects
2. **Scheduling difficulties**: No centralized system for booking learning sessions
3. **Limited interaction**: Traditional learning lacks real-time video and whiteboard collaboration
4. **Progress tracking**: Students cannot track their achievements and learning milestones
5. **Motivation**: No gamification or reward system to encourage continuous learning

### Real World Use Case
- **Educational Institutions**: Universities can use this platform for peer tutoring programs
- **Online Learning Communities**: Remote learners can connect with mentors globally
- **Corporate Training**: Companies can implement internal knowledge sharing
- **Skill Development**: Professionals can mentor students in specific domains

### Main Modules of the System
1. **Authentication Module**: User registration, login, JWT-based authentication
2. **Profile Management**: User profiles, mentor profiles, multiple mentor support
3. **Session Management**: Session requests, approval/rejection, scheduling
4. **Video Communication**: Real-time video calls with WebRTC, whiteboard collaboration
5. **Quiz & Assessment**: Challenge-based quizzes, automatic grading, certificate generation
6. **AI Chatbot**: Google Gemini-powered assistant for learning support
7. **Leaderboard & Achievements**: Gamification with points, badges, and rankings
8. **Real-time Messaging**: Socket.io-based chat during sessions

---

## 2. TECHNOLOGY STACK

### Frontend Technologies
- **React 18.3.1**: Modern JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing for single-page application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built accessible UI components
- **Socket.io Client**: Real-time bidirectional communication
- **TanStack Query**: Data fetching and state management

**Why React?**
- Component-based architecture for reusability
- Virtual DOM for efficient rendering
- Large ecosystem and community support
- Easy integration with modern tools

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side execution
- **Express.js 4.18.2**: Web application framework for REST APIs
- **MySQL 2**: Relational database for structured data storage
- **Socket.io 4.7.4**: Real-time WebSocket communication
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **Bcrypt**: Password hashing for security

**Why Node.js + Express?**
- Non-blocking I/O for handling multiple concurrent connections
- JavaScript on both frontend and backend (full-stack consistency)
- Rich package ecosystem (npm)
- Excellent for real-time applications

### Database
- **MySQL 3.6.5**: Relational Database Management System

**Why MySQL?**
- ACID compliance for data integrity
- Strong support for complex queries and joins
- Excellent performance for read-heavy operations
- Wide industry adoption and documentation
- Support for transactions and foreign keys

### Security & Middleware
- **Helmet**: Security headers for Express apps
- **CORS**: Cross-Origin Resource Sharing configuration
- **Express Rate Limit**: API rate limiting to prevent abuse
- **Express Validator**: Input validation and sanitization
- **Morgan**: HTTP request logger

### External APIs
- **Google Gemini API**: AI-powered chatbot responses
- **WebRTC**: Peer-to-peer video communication

### Development Tools
- **Nodemon**: Auto-restart server on file changes
- **ESLint**: Code linting for consistency
- **dotenv**: Environment variable management

---

## 3. DATABASE DESIGN

### Database Overview
The database consists of **20 tables** with well-defined relationships using foreign keys. It follows normalization principles to reduce redundancy and maintain data integrity.

### All Tables with Detailed Explanation

#### 1. **users** Table
**Purpose**: Stores basic user authentication and account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY, UUID | Unique user identifier |
| name | VARCHAR(255) | | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email (login credential) |
| password_hash | VARCHAR(255) | | Bcrypt hashed password |
| role | ENUM | DEFAULT 'student' | User role: student/mentor/admin |
| google_refresh_token | TEXT | | OAuth token for Google integration |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | DATETIME | AUTO UPDATE | Last modification timestamp |

**Relationships**: 
- One-to-One with `profiles`
- One-to-Many with `session_requests` (as mentor or student)
- One-to-Many with `mentor_profiles`

#### 2. **profiles** Table
**Purpose**: Extended user information and learning statistics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Profile identifier |
| user_id | VARCHAR(36) | FOREIGN KEY, UNIQUE | References users(id) |
| username | VARCHAR(100) | | Display username |
| bio | TEXT | | User biography |
| college_email | VARCHAR(255) | | Educational institution email |
| contribution_score | INT | DEFAULT 0 | Gamification points |
| credits | INT | DEFAULT 0 | Learning credits earned |
| is_mentor | BOOLEAN | DEFAULT FALSE | Mentor status flag |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | Mentor rating (0-5) |
| subject_ids | JSON | | Array of subject IDs |
| subjects | JSON | | Array of subject names |
| total_sessions_attended | INT | DEFAULT 0 | Student session count |
| total_sessions_taught | INT | DEFAULT 0 | Mentor session count |
| availability | JSON | | Mentor availability schedule |

**Relationships**: 
- One-to-One with `users`
- Used for mentor discovery and leaderboard

#### 3. **mentor_profiles** Table
**Purpose**: Allows users to create multiple mentor profiles for different subjects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Profile identifier |
| user_id | VARCHAR(36) | FOREIGN KEY | References users(id) |
| profile_name | VARCHAR(255) | NOT NULL | Profile title |
| bio | TEXT | | Mentor expertise description |
| subjects | JSON | | Array of subjects taught |
| expertise_level | ENUM | DEFAULT 'intermediate' | beginner/intermediate/expert |
| hourly_rate | DECIMAL(10,2) | DEFAULT 0 | Mentoring rate |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | Profile-specific rating |
| total_sessions | INT | DEFAULT 0 | Sessions conducted |
| is_active | BOOLEAN | DEFAULT TRUE | Profile active status |
| availability | JSON | | Schedule availability |

**Relationships**: 
- Many-to-One with `users` (one user can have multiple mentor profiles)

#### 4. **subjects** Table
**Purpose**: Master table for all available subjects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Subject identifier |
| name | VARCHAR(255) | NOT NULL | Subject name |
| description | TEXT | | Subject description |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Default Subjects**: Mathematics, Science, Programming, Languages, History, Business, Arts, Other

**Relationships**: 
- One-to-Many with `session_requests`
- Referenced in `profiles.subject_ids` (JSON)

#### 5. **session_requests** Table
**Purpose**: Core table for managing learning sessions between mentors and students

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Session identifier |
| mentor_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| student_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| title | VARCHAR(255) | NOT NULL | Session title |
| description | TEXT | | Session description |
| subject_id | VARCHAR(36) | FOREIGN KEY | References subjects(id) |
| requested_time | DATETIME | NOT NULL | Scheduled session time |
| duration | INT | | Duration in minutes |
| status | ENUM | DEFAULT 'pending' | pending/approved/rejected/completed/ongoing |
| rejection_reason | TEXT | | Reason if rejected |
| responded_at | DATETIME | | Mentor response timestamp |
| approval_email_sent | BOOLEAN | DEFAULT FALSE | Email notification flag |
| reminder_5min_sent | BOOLEAN | DEFAULT FALSE | Reminder notification flag |
| video_room_id | VARCHAR(255) | | WebRTC room identifier |

**Relationships**: 
- Many-to-One with `users` (mentor)
- Many-to-One with `users` (student)
- Many-to-One with `subjects`
- One-to-Many with `session_messages`
- One-to-Many with `shared_resources`

#### 6. **session_messages** Table
**Purpose**: Chat messages within learning sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Message identifier |
| session_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References session_requests(id) |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| content | TEXT | NOT NULL | Message content |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Relationships**: 
- Many-to-One with `session_requests`
- Many-to-One with `users`

#### 7. **video_chat_messages** Table
**Purpose**: Real-time chat messages during video calls

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Message identifier |
| room_id | VARCHAR(255) | NOT NULL | Video room identifier |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| message | TEXT | NOT NULL | Chat message content |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Relationships**: 
- Many-to-One with `users`
- Indexed on `room_id` for fast retrieval

#### 8. **whiteboard_strokes** Table
**Purpose**: Stores whiteboard drawing data for collaborative sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Stroke identifier |
| room_id | VARCHAR(255) | NOT NULL | Video room identifier |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| stroke_data | JSON | NOT NULL | Drawing path coordinates |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Stroke timestamp |

**Relationships**: 
- Many-to-One with `users`
- Indexed on `room_id` for fast retrieval

#### 9. **challenges** Table
**Purpose**: Learning challenges with quizzes and rewards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Challenge identifier |
| title | VARCHAR(255) | NOT NULL | Challenge title |
| subject | VARCHAR(255) | NOT NULL | Subject area |
| description | TEXT | | Challenge description |
| target_metric | VARCHAR(100) | | Completion metric |
| target_value | INT | | Target value to achieve |
| points_reward | INT | | Points awarded on completion |
| start_date | DATETIME | | Challenge start date |
| end_date | DATETIME | | Challenge end date |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |

**Relationships**: 
- One-to-Many with `quiz_questions`
- One-to-Many with `quiz_attempts`
- One-to-Many with `user_challenge_progress`

#### 10. **quiz_questions** Table
**Purpose**: Questions for challenge quizzes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Question identifier |
| challenge_id | VARCHAR(36) | FOREIGN KEY | References challenges(id) |
| question_text | TEXT | NOT NULL | Question content |
| marks | INT | NOT NULL, DEFAULT 1 | Points for correct answer |
| question_order | INT | | Display order |

**Relationships**: 
- Many-to-One with `challenges`
- One-to-Many with `quiz_options`

#### 11. **quiz_options** Table
**Purpose**: Multiple choice options for quiz questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Option identifier |
| question_id | VARCHAR(36) | FOREIGN KEY | References quiz_questions(id) |
| option_text | VARCHAR(500) | NOT NULL | Option content |
| is_correct | BOOLEAN | DEFAULT FALSE | Correct answer flag |
| option_order | INT | | Display order |

**Relationships**: 
- Many-to-One with `quiz_questions`

#### 12. **quiz_attempts** Table
**Purpose**: Records of user quiz submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Attempt identifier |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| challenge_id | VARCHAR(36) | FOREIGN KEY | References challenges(id) |
| answers | JSON | | User's answer selections |
| score | INT | NOT NULL, DEFAULT 0 | Points scored |
| total | INT | NOT NULL, DEFAULT 0 | Total possible points |
| passed | BOOLEAN | DEFAULT FALSE | Pass/fail status (≥60%) |
| completed_at | DATETIME | | Completion timestamp |

**Relationships**: 
- Many-to-One with `users`
- Many-to-One with `challenges`

#### 13. **certificates** Table
**Purpose**: Digital certificates for quiz achievements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Certificate identifier |
| title | VARCHAR(255) | NOT NULL | Certificate title |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| badge_id | VARCHAR(36) | FOREIGN KEY | References challenges(id) |
| challenge_id | VARCHAR(36) | FOREIGN KEY | References challenges(id) |
| score | INT | | Quiz score achieved |
| pdf_url | VARCHAR(500) | | PDF download link |
| share_token | VARCHAR(100) | UNIQUE | Public sharing token |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Issue date |

**Relationships**: 
- Many-to-One with `users`
- Many-to-One with `challenges`
- Indexed on `share_token` for public access

#### 14. **user_challenge_progress** Table
**Purpose**: Tracks user progress on challenges

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Progress identifier |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| challenge_id | VARCHAR(36) | FOREIGN KEY | References challenges(id) |
| current_value | INT | DEFAULT 0 | Current progress value |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |

**Relationships**: 
- Many-to-One with `users`
- Many-to-One with `challenges`
- Unique constraint on (user_id, challenge_id)

#### 15. **session_feedback** Table
**Purpose**: Ratings and feedback after sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Feedback identifier |
| session_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References session_requests(id) |
| mentor_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| student_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| rating | INT | NOT NULL | Rating (1-5 stars) |
| feedback_text | TEXT | | Written feedback |
| toxicity_score | DECIMAL(5,4) | | AI toxicity detection score |
| toxicity_categories | JSON | | Detected toxic categories |

**Relationships**: 
- Many-to-One with `session_requests`
- Many-to-One with `users` (mentor)
- Many-to-One with `users` (student)
- Unique constraint on (session_id, student_id)

#### 16. **resources** Table
**Purpose**: Learning resources uploaded by users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Resource identifier |
| title | VARCHAR(255) | NOT NULL | Resource title |
| content | TEXT | | Resource content/description |
| ai_summary | TEXT | | AI-generated summary |
| subject_id | VARCHAR(36) | FOREIGN KEY | References subjects(id) |
| uploaded_by | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |

**Relationships**: 
- Many-to-One with `subjects`
- Many-to-One with `users`

#### 17. **shared_resources** Table
**Purpose**: Files shared during sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Resource identifier |
| title | VARCHAR(255) | NOT NULL | Resource title |
| description | TEXT | | Resource description |
| resource_url | VARCHAR(500) | NOT NULL | File URL/path |
| resource_type | VARCHAR(50) | NOT NULL | File type (pdf, doc, etc.) |
| mime_type | VARCHAR(100) | | MIME type |
| file_size | INT | | File size in bytes |
| metadata | JSON | | Additional metadata |
| session_id | VARCHAR(36) | FOREIGN KEY | References session_requests(id) |
| shared_by | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |

**Relationships**: 
- Many-to-One with `session_requests`
- Many-to-One with `users`

#### 18. **ai_chats** Table
**Purpose**: Stores AI chatbot conversation history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Chat identifier |
| session_id | VARCHAR(36) | FOREIGN KEY | References session_requests(id) |
| user_id | VARCHAR(36) | FOREIGN KEY, NOT NULL | References users(id) |
| user_message | TEXT | NOT NULL | User's question |
| assistant_reply | TEXT | NOT NULL | AI's response |
| source | VARCHAR(100) | | AI provider (Gemini/OpenAI) |

**Relationships**: 
- Many-to-One with `users`
- Many-to-One with `session_requests` (optional)

### Database Indexes
Performance optimization through strategic indexing:

```sql
-- User and profile lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Session queries
CREATE INDEX idx_session_requests_mentor ON session_requests(mentor_id);
CREATE INDEX idx_session_requests_student ON session_requests(student_id);
CREATE INDEX idx_session_requests_status ON session_requests(status);

-- Message retrieval
CREATE INDEX idx_session_messages_session ON session_messages(session_id);
CREATE INDEX idx_video_chat_messages_room ON video_chat_messages(room_id);
CREATE INDEX idx_whiteboard_strokes_room ON whiteboard_strokes(room_id);

-- Quiz and challenge lookups
CREATE INDEX idx_quiz_questions_challenge ON quiz_questions(challenge_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_user_challenge_progress_user ON user_challenge_progress(user_id);

-- Certificate sharing
CREATE INDEX idx_certificates_share_token ON certificates(share_token);

-- Feedback and ratings
CREATE INDEX idx_session_feedback_mentor ON session_feedback(mentor_id);
CREATE INDEX idx_session_feedback_session ON session_feedback(session_id);

-- AI chat history
CREATE INDEX idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX idx_ai_chats_session ON ai_chats(session_id);
```

### ER Diagram Explanation

**Entity Relationships:**

1. **User ↔ Profile** (1:1)
   - Each user has exactly one profile
   - CASCADE DELETE: Deleting user removes profile

2. **User ↔ Mentor Profiles** (1:N)
   - One user can create multiple mentor profiles
   - Allows specialization in different subjects

3. **User ↔ Session Requests** (1:N as mentor, 1:N as student)
   - Users can be both mentors and students
   - Self-referencing relationship through two foreign keys

4. **Session Request ↔ Subject** (N:1)
   - Each session belongs to one subject
   - Subjects are reusable across sessions

5. **Session Request ↔ Messages** (1:N)
   - Each session can have multiple chat messages
   - CASCADE DELETE: Deleting session removes messages

6. **Challenge ↔ Quiz Questions** (1:N)
   - Each challenge has multiple questions
   - CASCADE DELETE: Deleting challenge removes questions

7. **Quiz Question ↔ Quiz Options** (1:N)
   - Each question has multiple options
   - CASCADE DELETE: Deleting question removes options

8. **User ↔ Quiz Attempts** (1:N)
   - Users can attempt multiple quizzes
   - Tracks learning progress

9. **User ↔ Certificates** (1:N)
   - Users earn certificates for passing quizzes
   - Permanent record of achievements

10. **Session ↔ Feedback** (1:1)
    - Each session can have one feedback per student
    - Unique constraint prevents duplicate feedback

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` to maintain referential integrity:

- **CASCADE**: Child records are automatically deleted (e.g., deleting user deletes their profile)
- **SET NULL**: Foreign key is set to NULL (e.g., deleting session sets ai_chats.session_id to NULL)

---

## 4. FILE STRUCTURE ANALYSIS

### Backend File Structure

#### **backend/server.js**
**Purpose**: Main server entry point and configuration
**Functionality**:
- Initializes Express application
- Configures middleware (CORS, Helmet, Rate Limiting, Body Parser)
- Mounts all API routes
- Sets up Socket.io for real-time communication
- Implements WebSocket authentication
- Handles real-time events (chat, whiteboard, WebRTC signals)
- Error handling middleware
**Module**: Core Server

#### **backend/config/db.js**
**Purpose**: Database connection management
**Functionality**:
- Creates MySQL connection pool
- Exports query execution function
- Handles database connection errors
- Provides connection pooling for performance
**Module**: Database Layer

#### **backend/middleware/auth.js**
**Purpose**: Authentication and authorization middleware
**Functionality**:
- Verifies JWT tokens from request headers
- Extracts user information from token
- Protects routes requiring authentication
- Implements role-based access control
**Module**: Security

#### **backend/models/BaseModel.js**
**Purpose**: Abstract base class for all database models
**Functionality**:
- Provides CRUD operations (Create, Read, Update, Delete)
- Implements findOne, findMany, findById methods
- Handles database queries with parameterized statements
- Prevents SQL injection through prepared statements
- Provides join and leftJoin helpers
**Module**: Data Access Layer

#### **backend/models/User.js**
**Purpose**: User account management
**Functionality**:
- `createUser()`: Registers new user with bcrypt password hashing
- `findByEmail()`: Retrieves user by email
- `verifyPassword()`: Authenticates user credentials
- `updatePassword()`: Changes user password securely
- `getUserWithProfile()`: Joins user and profile data
- `getMentors()`: Lists all available mentors
- `getLeaderboard()`: Retrieves top contributors
- `updateToMentor()`: Promotes user to mentor role
**Module**: Authentication & User Management

#### **backend/models/Profile.js**
**Purpose**: Extended user profile management
**Functionality**:
- `upsertProfile()`: Creates or updates profile (supports multiple mentors)
- `getByUserId()`: Retrieves profile by user ID
- `updateMentorStatus()`: Toggles mentor flag
- `updateSubjects()`: Updates mentor subjects (JSON)
- `updateAvailability()`: Updates mentor schedule (JSON)
- `incrementSessionCounts()`: Tracks sessions attended/taught
- `getMentors()`: Paginated mentor listing
- `getLeaderboard()`: Top contributors by score
- `getMentorStats()`: Mentor performance metrics
- `getStudentStats()`: Student learning metrics
**Module**: Profile Management

#### **backend/models/SessionRequest.js**
**Purpose**: Learning session management
**Functionality**:
- `createSessionRequest()`: Creates new session request
- `getUserSessions()`: Gets sessions for user (mentor or student)
- `getSessionWithDetails()`: Retrieves session with participant info
- `updateStatus()`: Changes session status (approve/reject/complete)
- `approveSession()`: Approves pending session
- `rejectSession()`: Rejects session with reason
- `completeSession()`: Marks session as completed
- `getUpcomingSessions()`: Lists future approved sessions
- `generateVideoRoomId()`: Creates unique video room identifier
- `getSessionStats()`: Session statistics for user
**Module**: Session Management

#### **backend/models/MentorProfile.js**
**Purpose**: Multiple mentor profile support
**Functionality**:
- `create()`: Creates new mentor profile for user
- `findById()`: Retrieves profile by ID
- `findByUserId()`: Gets all profiles for a user
- `findAllActive()`: Lists active mentor profiles with filters
- `update()`: Updates profile information
- `delete()`: Removes mentor profile
- `incrementSessions()`: Updates session count
- `updateRating()`: Updates profile rating
**Module**: Mentor Profile Management

#### **backend/controllers/authController.js**
**Purpose**: Authentication business logic
**Functionality**:
- `register()`: User registration with validation
- `login()`: User authentication with JWT generation
- `getCurrentUser()`: Retrieves authenticated user data
- `updateProfile()`: Updates user profile information
- `becomeMentor()`: Converts student to mentor
- `changePassword()`: Secure password update
- `logout()`: Session termination
**Module**: Authentication

#### **backend/controllers/sessionController.js**
**Purpose**: Session management business logic
**Functionality**:
- `createSession()`: Creates session request with validation
- `getUserSessions()`: Retrieves user's sessions with pagination
- `getSession()`: Gets single session with authorization check
- `updateSessionStatus()`: Approves/rejects/completes sessions
- `getUpcomingSessions()`: Lists future sessions
- `getMentorSessions()`: Mentor-specific session list
- `getStudentSessions()`: Student-specific session list
- `generateVideoRoom()`: Creates video room for approved session
- `getSessionStats()`: Session statistics
**Module**: Session Management

#### **backend/routes/auth.js**
**Purpose**: Authentication API endpoints
**Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/become-mentor` - Become mentor (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)
**Validation**: Express-validator for input sanitization
**Module**: Authentication API

#### **backend/routes/sessions.js**
**Purpose**: Session management API endpoints
**Endpoints**:
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/upcoming` - Get upcoming sessions
- `GET /api/sessions/mentor` - Get mentor sessions
- `GET /api/sessions/student` - Get student sessions
- `GET /api/sessions/stats` - Get session statistics
- `GET /api/sessions/:id` - Get single session
- `PUT /api/sessions/:id/status` - Update session status
- `POST /api/sessions/:id/video-room` - Generate video room
**Module**: Session API

#### **backend/routes/quizzes.js**
**Purpose**: Quiz and assessment API
**Endpoints**:
- `GET /api/quizzes/questions/:challengeId` - Get quiz questions with options
- `POST /api/quizzes/submit` - Submit quiz answers and calculate score
- `GET /api/quizzes/attempts` - Get user's quiz attempts
**Functionality**:
- Automatic grading based on correct options
- 60% pass threshold
- Automatic certificate generation on pass
**Module**: Quiz API

#### **backend/routes/certificates.js**
**Purpose**: Certificate management API
**Endpoints**:
- `GET /api/certificates/shared/:shareToken` - Public certificate view (no auth)
- `GET /api/certificates` - Get user certificates (protected)
- `POST /api/certificates` - Create certificate (protected)
**Functionality**:
- Generates unique share tokens
- Public certificate sharing
- Certificate verification
**Module**: Certificate API

#### **backend/routes/mentorProfiles.js**
**Purpose**: Multiple mentor profile management
**Endpoints**:
- `GET /api/mentor-profiles/my/profiles` - Get user's mentor profiles
- `POST /api/mentor-profiles` - Create new mentor profile
- `GET /api/mentor-profiles/:id` - Get specific profile
- `PUT /api/mentor-profiles/:id` - Update profile
- `DELETE /api/mentor-profiles/:id` - Delete profile
- `GET /api/mentor-profiles` - List all active profiles
**Module**: Mentor Profile API

#### **backend/routes/aiChat.js**
**Purpose**: AI chatbot integration
**Endpoints**:
- `POST /api/ai-chat` - Send message to AI assistant
**Functionality**:
- Google Gemini API integration
- Context-aware responses about the platform
- Fallback responses when API unavailable
- Conversation history storage
**Module**: AI Chatbot API

#### **backend/routes/messages.js**
**Purpose**: Real-time messaging API
**Endpoints**:
- `GET /api/messages/session/:sessionId` - Get session chat history
- `POST /api/messages/session` - Send session message
- `GET /api/messages/video-chat/:roomId` - Get video chat messages
- `POST /api/messages/video-chat/:roomId` - Send video chat message
- `GET /api/messages/whiteboard/:roomId` - Get whiteboard strokes
- `POST /api/messages/whiteboard/:roomId` - Save whiteboard stroke
**Module**: Messaging API

#### **backend/routes/subjects.js**
**Purpose**: Subject management API
**Endpoints**:
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create new subject (admin)
**Module**: Subject API

#### **backend/routes/feedback.js**
**Purpose**: Session feedback and ratings
**Endpoints**:
- `POST /api/feedback` - Submit session feedback
- `GET /api/feedback/session/:sessionId` - Get session feedback
- `GET /api/feedback/mentor/:mentorId` - Get mentor feedback
**Module**: Feedback API

### Frontend File Structure

#### **src/App.tsx**
**Purpose**: Main application component and routing
**Functionality**:
- Defines all application routes
- Wraps app with providers (Auth, Query, Tooltip)
- Implements protected routes with RequireAuth
- Configures React Router
**Module**: Core Frontend

#### **src/pages/Login.tsx**
**Purpose**: User authentication page
**Functionality**:
- Sign in and sign up forms
- Input validation
- Password visibility toggle
- JWT token storage
- Redirects to dashboard on success
**Module**: Authentication UI

#### **src/pages/Dashboard.tsx**
**Purpose**: Main user dashboard
**Functionality**:
- Displays user profile summary
- Shows upcoming sessions
- Quick action buttons
- AI chatbot integration
- Navigation to all features
**Module**: Dashboard UI

#### **src/pages/FindMentor.tsx**
**Purpose**: Mentor discovery and session booking
**Functionality**:
- Lists available mentors
- Displays mentor ratings and subjects
- Session request creation
- Subject filtering
**Module**: Mentor Discovery UI

#### **src/pages/ManageMentorProfiles.tsx**
**Purpose**: Multiple mentor profile management
**Functionality**:
- Create new mentor profiles
- Edit existing profiles
- Delete profiles
- Manage subjects and availability
**Module**: Mentor Profile UI

#### **src/pages/ViewSchedule.tsx**
**Purpose**: Session schedule management
**Functionality**:
- Calendar view of sessions
- Session status indicators
- Join video call buttons
- Session details modal
**Module**: Schedule UI

#### **src/pages/Challenges.tsx**
**Purpose**: Learning challenges and quizzes
**Functionality**:
- Lists available challenges
- Quiz modal with questions
- Answer selection
- Score display
- Certificate generation on pass
**Module**: Challenges UI

#### **src/pages/VideoRoom.tsx**
**Purpose**: Real-time video communication
**Functionality**:
- WebRTC peer-to-peer video calls
- Real-time chat
- Collaborative whiteboard
- Screen sharing
- Audio/video controls
**Module**: Video Communication UI

#### **src/pages/CertificateViewer.tsx**
**Purpose**: Public certificate display
**Functionality**:
- Displays certificate details
- Share token verification
- Download certificate option
- Public sharing URL
**Module**: Certificate UI

#### **src/pages/Leaderboard.tsx**
**Purpose**: Gamification leaderboard
**Functionality**:
- Ranks users by contribution score
- Displays badges and achievements
- Session statistics
**Module**: Leaderboard UI

#### **src/components/AIChatBot.tsx**
**Purpose**: AI assistant chat interface
**Functionality**:
- Chat message input
- Message history display
- AI/Local mode toggle
- Google Gemini integration
- Context-aware responses
**Module**: AI Chatbot Component

#### **src/components/QuizModal.tsx**
**Purpose**: Quiz taking interface
**Functionality**:
- Displays questions and options
- Radio button selection
- Submit quiz
- Score calculation
- Certificate generation
**Module**: Quiz Component

#### **src/components/SessionChat.tsx**
**Purpose**: In-session chat component
**Functionality**:
- Real-time message display
- Message input
- Socket.io integration
- Message persistence
**Module**: Chat Component

#### **src/components/Whiteboard.tsx**
**Purpose**: Collaborative drawing board
**Functionality**:
- Canvas drawing
- Real-time stroke synchronization
- Color and brush size selection
- Clear board
- Socket.io integration
**Module**: Whiteboard Component

#### **src/hooks/useAuth.tsx**
**Purpose**: Authentication state management
**Functionality**:
- Login function with JWT storage
- Register function
- Logout function
- Current user state
- Token refresh
- Auth context provider
**Module**: Authentication Hook

#### **src/hooks/useSocket.ts**
**Purpose**: Socket.io connection management
**Functionality**:
- Establishes WebSocket connection
- Handles authentication
- Manages connection state
- Provides socket instance
**Module**: Socket Hook

#### **src/hooks/useVideoSignaling.ts**
**Purpose**: WebRTC signaling logic
**Functionality**:
- Peer connection setup
- Offer/answer exchange
- ICE candidate handling
- Video stream management
**Module**: Video Signaling Hook

#### **src/lib/auth-api.ts**
**Purpose**: Authentication API client
**Functionality**:
- Login API call
- Register API call
- Get current user
- Axios interceptors for auth headers
**Module**: Auth API Client

#### **src/lib/session-api.ts**
**Purpose**: Session API client
**Functionality**:
- Create session request
- Get user sessions
- Update session status
- Generate video room
**Module**: Session API Client

#### **src/lib/profile-api.ts**
**Purpose**: Profile API client
**Functionality**:
- Get user profile
- Update profile
- Get mentors list
- Become mentor
**Module**: Profile API Client

---

## 5. FUNCTION/QUERY EXPLANATION

### Important SQL Queries

#### 1. User Registration with Profile Creation
```sql
-- Insert new user with hashed password
INSERT INTO users (id, email, password_hash, name, role, created_at) 
VALUES (UUID(), ?, ?, ?, 'student', NOW());

-- Create associated profile
INSERT INTO profiles (id, user_id, username, credits, contribution_score) 
VALUES (UUID(), ?, ?, 0, 0);
```
**Purpose**: Creates user account and initializes profile with default values
**Transaction**: Uses transaction to ensure both records are created atomically

#### 2. Get User Sessions (Mentor or Student)
```sql
SELECT sr.*, 
       sp.username as student_name,
       mp.username as mentor_name,
       sub.name as subject_name
FROM session_requests sr
LEFT JOIN profiles sp ON sr.student_id = sp.user_id
LEFT JOIN profiles mp ON sr.mentor_id = mp.user_id
LEFT JOIN subjects sub ON sr.subject_id = sub.id
WHERE sr.student_id = ? OR sr.mentor_id = ?
ORDER BY sr.created_at DESC
LIMIT ? OFFSET ?;
```
**Purpose**: Retrieves all sessions for a user (as mentor or student) with participant details
**Joins**: Three LEFT JOINs to get student name, mentor name, and subject name
**Pagination**: LIMIT and OFFSET for performance

#### 3. Get Quiz Questions with Options
```sql
SELECT qq.*, qo.id as option_id, qo.option_text, qo.is_correct, qo.option_order
FROM quiz_questions qq
LEFT JOIN quiz_options qo ON qq.id = qo.question_id
WHERE qq.challenge_id = ?
ORDER BY qq.question_order ASC, qo.option_order ASC;
```
**Purpose**: Retrieves all questions and their options for a challenge
**Join**: LEFT JOIN to include questions even if they have no options
**Ordering**: Ensures questions and options display in correct order
**Post-processing**: Backend groups options by question ID

#### 4. Calculate Quiz Score
```sql
-- Get correct option for each question
SELECT id FROM quiz_options 
WHERE question_id = ? AND is_correct = true;
```
**Purpose**: Validates user answers against correct options
**Logic**: 
- Iterates through each question
- Compares user's selected option with correct option
- Adds marks if match found
- Calculates percentage: (score / total) * 100
- Pass threshold: ≥60%

#### 5. Complete Session with Transaction
```sql
BEGIN TRANSACTION;

-- Update session status
UPDATE session_requests 
SET status = 'completed', updated_at = NOW() 
WHERE id = ?;

-- Increment student session count
UPDATE profiles 
SET total_sessions_attended = total_sessions_attended + 1 
WHERE user_id = ?;

-- Increment mentor session count
UPDATE profiles 
SET total_sessions_taught = total_sessions_taught + 1 
WHERE user_id = ?;

COMMIT;
```
**Purpose**: Atomically completes session and updates statistics
**Transaction**: Ensures all updates succeed or none do (ACID compliance)
**Rollback**: If any query fails, all changes are reverted

#### 6. Get Leaderboard
```sql
SELECT u.id, u.username, p.contribution_score, 
       p.total_sessions_taught, p.rating, p.total_sessions_attended
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
ORDER BY p.contribution_score DESC
LIMIT 10;
```
**Purpose**: Retrieves top 10 users by contribution score
**Join**: INNER JOIN ensures only users with profiles are included
**Ordering**: DESC to show highest scores first

#### 7. Get Mentor Statistics
```sql
SELECT 
  p.rating,
  p.total_sessions_taught,
  COUNT(DISTINCT sr.id) as total_sessions,
  AVG(sf.rating) as avg_feedback_rating,
  COUNT(DISTINCT sf.id) as feedback_count
FROM profiles p
LEFT JOIN session_requests sr ON p.user_id = sr.mentor_id
LEFT JOIN session_feedback sf ON sr.id = sf.session_id AND sf.mentor_id = p.user_id
WHERE p.user_id = ?
GROUP BY p.id, p.rating, p.total_sessions_taught;
```
**Purpose**: Comprehensive mentor performance metrics
**Aggregation**: COUNT and AVG for statistics
**Grouping**: GROUP BY to aggregate per mentor

#### 8. Search Mentors by Subject
```sql
SELECT p.*, u.email, u.full_name
FROM profiles p
INNER JOIN users u ON p.user_id = u.id
WHERE p.is_mentor = true 
  AND u.role = 'mentor'
  AND JSON_CONTAINS(p.subjects, ?)
ORDER BY p.rating DESC
LIMIT ?;
```
**Purpose**: Finds mentors teaching specific subject
**JSON Function**: JSON_CONTAINS searches within JSON array
**Filtering**: Multiple conditions ensure valid mentors
**Ordering**: Best-rated mentors first

### Important Functions

#### 1. Password Hashing (bcrypt)
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash password during registration
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password during login
const isValid = await bcrypt.compare(password, user.password_hash);
```
**Purpose**: Secure password storage
**Salt Rounds**: 10 iterations for security vs performance balance
**One-way**: Cannot reverse hash to get original password

#### 2. JWT Token Generation
```javascript
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```
**Purpose**: Stateless authentication
**Payload**: Contains user ID
**Expiration**: 7 days validity
**Secret**: Environment variable for security

#### 3. JWT Token Verification
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```
**Purpose**: Protects routes requiring authentication
**Middleware**: Runs before route handler
**Token Extraction**: From Authorization header (Bearer token)
**Verification**: Validates signature and expiration

#### 4. Socket.io Authentication
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});
```
**Purpose**: Authenticates WebSocket connections
**Middleware**: Runs before connection established
**User ID**: Attached to socket for authorization checks

#### 5. Certificate Generation
```javascript
async function generateCertificate(userId, challengeId, score, challengeTitle) {
  const shareToken = uuidv4().replace(/-/g, '');
  
  await executeQuery(
    `INSERT INTO certificates 
     (title, user_id, challenge_id, score, share_token, created_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      `${challengeTitle} - Certificate of Completion`,
      userId,
      challengeId,
      score,
      shareToken,
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    ]
  );
  
  return {
    certificateUrl: `/certificate/${shareToken}`,
    shareToken
  };
}
```
**Purpose**: Creates shareable certificate after quiz pass
**Share Token**: UUID without hyphens for clean URLs
**Public Access**: Token allows viewing without authentication
**Timestamp**: MySQL datetime format

---

## 6. SYSTEM WORKFLOW

### Complete User Journey

#### Step 1: User Registration
```
User → Frontend (Login.tsx) → POST /api/auth/register → authController.register()
  → User.createUser() → bcrypt.hash(password) → INSERT INTO users
  → Profile.upsertProfile() → INSERT INTO profiles
  → generateToken(userId) → JWT Token
  → Response: { user, token } → Frontend stores token → Redirect to Dashboard
```

#### Step 2: User Login
```
User → Frontend (Login.tsx) → POST /api/auth/login → authController.login()
  → User.verifyPassword() → bcrypt.compare(password, hash)
  → generateToken(userId) → JWT Token
  → User.getUserWithProfile() → JOIN users + profiles
  → Response: { user, token } → Frontend stores token → Redirect to Dashboard
```

#### Step 3: Find Mentor
```
User → Dashboard → Click "Find Mentor" → FindMentor.tsx
  → GET /api/profiles/mentors → Profile.getMentors()
  → SELECT FROM profiles WHERE is_mentor = true
  → Response: List of mentors with ratings and subjects
  → Display mentor cards with "Request Session" button
```

#### Step 4: Request Session
```
User → Click "Request Session" → POST /api/sessions
  → authenticateToken middleware → Verify JWT
  → sessionController.createSession() → Validate input
  → SessionRequest.createSessionRequest()
  → INSERT INTO session_requests (status = 'pending')
  → Response: { session } → Toast notification "Request sent"
```

#### Step 5: Mentor Approves Session
```
Mentor → Dashboard → View Requests → Click "Approve"
  → PUT /api/sessions/:id/status → { status: 'approved' }
  → sessionController.updateSessionStatus()
  → SessionRequest.approveSession()
  → UPDATE session_requests SET status = 'approved', responded_at = NOW()
  → Response: { session } → Email notification to student
```

#### Step 6: Join Video Session
```
User → Schedule → Click "Join Video Call" → VideoRoom.tsx
  → POST /api/sessions/:id/video-room → Generate room ID
  → WebRTC: Create peer connection → Generate offer
  → Socket.io: Emit 'signal' event → Send offer to peer
  → Peer receives offer → Generate answer → Send back
  → ICE candidates exchanged → P2P connection established
  → Video streams displayed → Real-time chat enabled
  → Whiteboard collaboration active
```

#### Step 7: Take Quiz
```
User → Challenges → Click "Take Quiz" → QuizModal.tsx
  → GET /api/quizzes/questions/:challengeId
  → Query: SELECT questions + options with LEFT JOIN
  → Display questions with radio buttons
  → User selects answers → Click "Submit"
  → POST /api/quizzes/submit → { challengeId, answers }
  → Calculate score: Compare selected vs correct options
  → If score ≥ 60%:
    → Generate certificate with unique share token
    → INSERT INTO certificates
    → INSERT INTO quiz_attempts (passed = true)
  → Response: { score, percentage, passed, certificateUrl }
  → Display results → Show certificate link if passed
```

#### Step 8: View Certificate
```
User → Click certificate link → /certificate/:shareToken
  → CertificateViewer.tsx → GET /api/certificates/shared/:shareToken
  → Query: SELECT FROM certificates WHERE share_token = ?
  → JOIN with users to get username
  → Display certificate with:
    - User name
    - Challenge title
    - Score achieved
    - Issue date
    - Share URL
  → Download/Share options
```

#### Step 9: AI Chatbot Interaction
```
User → Dashboard → Type message in chatbot → AIChatBot.tsx
  → POST /api/ai-chat → { message, userId }
  → Google Gemini API call with context
  → System prompt: "You are StudyBot for Learning Management System..."
  → AI generates response
  → INSERT INTO ai_chats (user_message, assistant_reply)
  → Response: { reply } → Display in chat interface
```

#### Step 10: Session Completion
```
Mentor → Click "Complete Session" → PUT /api/sessions/:id/status
  → { status: 'completed' }
  → BEGIN TRANSACTION
    → UPDATE session_requests SET status = 'completed'
    → UPDATE profiles SET total_sessions_attended + 1 (student)
    → UPDATE profiles SET total_sessions_taught + 1 (mentor)
  → COMMIT
  → Student prompted for feedback
  → POST /api/feedback → { sessionId, rating, feedback }
  → INSERT INTO session_feedback
  → Update mentor rating: AVG(all feedback ratings)
  → UPDATE profiles SET rating = new_avg WHERE user_id = mentor_id
```

### Data Flow Diagram
```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ SQL Queries
       ▼
┌─────────────┐
│   MySQL     │
│  Database   │
└─────────────┘

External APIs:
- Google Gemini (AI responses)
- WebRTC (P2P video)
```

---

## 7. KEY FEATURES OF THE PROJECT

### 1. User Authentication & Authorization
- **JWT-based authentication**: Stateless, scalable authentication
- **Bcrypt password hashing**: Secure password storage (10 salt rounds)
- **Role-based access**: Student, Mentor, Admin roles
- **Protected routes**: Middleware authentication for sensitive endpoints
- **Rate limiting**: 50 requests per 15 minutes to prevent abuse

### 2. Multiple Mentor Profiles
- **One user, multiple profiles**: Users can create specialized mentor profiles
- **Subject-specific expertise**: Each profile can focus on different subjects
- **Independent ratings**: Each profile has its own rating and statistics
- **Flexible management**: Create, edit, delete profiles independently
- **Hourly rate configuration**: Set different rates per profile

### 3. Session Management
- **Request-approval workflow**: Students request, mentors approve/reject
- **Status tracking**: pending → approved → ongoing → completed
- **Scheduling system**: Date/time selection with future validation
- **Duration management**: Configurable session length (15-180 minutes)
- **Video room generation**: Unique room IDs for each session
- **Session history**: Complete audit trail of all sessions

### 4. Real-time Video Communication
- **WebRTC peer-to-peer**: Direct browser-to-browser video calls
- **No external servers**: P2P reduces latency and server costs
- **Audio/video controls**: Mute, camera toggle, screen share
- **Real-time chat**: Socket.io-based instant messaging
- **Collaborative whiteboard**: Synchronized drawing canvas
- **ICE candidate exchange**: NAT traversal for connectivity

### 5. Quiz & Assessment System
- **Multiple choice quizzes**: Questions with 4 options each
- **Automatic grading**: Instant score calculation
- **Pass/fail threshold**: 60% required to pass
- **Marks per question**: Configurable point values
- **Answer validation**: Server-side verification prevents cheating
- **Attempt history**: Track all quiz attempts

### 6. Certificate Generation
- **Automatic issuance**: Generated on quiz pass (≥60%)
- **Unique share tokens**: UUID-based public URLs
- **Public viewing**: No authentication required for viewing
- **Permanent records**: Certificates never expire
- **Download option**: Save as PDF (future enhancement)
- **Social sharing**: Shareable links for LinkedIn, etc.

### 7. AI-Powered Chatbot
- **Google Gemini integration**: Advanced AI responses
- **Context-aware**: Knows about platform features
- **Conversation history**: Stored in database
- **Fallback responses**: Works without API key
- **AI/Local mode toggle**: User can choose response type
- **1,500 free requests/day**: Gemini free tier

### 8. Gamification & Leaderboard
- **Contribution scores**: Points for sessions, quizzes, feedback
- **Leaderboard rankings**: Top 10 contributors displayed
- **Session statistics**: Attended vs taught tracking
- **Rating system**: 5-star mentor ratings
- **Achievement badges**: Visual recognition (future enhancement)
- **Credits system**: Virtual currency for platform activities

### 9. Real-time Features (Socket.io)
- **Instant messaging**: No page refresh needed
- **Whiteboard synchronization**: Strokes appear in real-time
- **WebRTC signaling**: Offer/answer/ICE exchange
- **Connection status**: Online/offline indicators
- **Room-based communication**: Isolated per session
- **Authentication**: JWT verification for WebSocket connections

### 10. Security Features
- **Helmet.js**: Security headers (XSS, clickjacking protection)
- **CORS configuration**: Whitelist allowed origins
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Input sanitization with express-validator
- **Rate limiting**: Prevent brute force attacks
- **Password validation**: Minimum 8 characters, complexity rules
- **Token expiration**: 7-day JWT validity
- **Environment variables**: Sensitive data in .env files

---

## 8. PROJECT ARCHITECTURE

### Architecture Pattern: Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 5173/5174)                     │  │
│  │  - Components (UI)                                    │  │
│  │  - Pages (Routes)                                     │  │
│  │  - Hooks (State Management)                           │  │
│  │  - API Clients (HTTP/WebSocket)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express Backend (Port 3001)               │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Routes (API Endpoints)                        │  │  │
│  │  │  - /api/auth, /api/sessions, /api/quizzes     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Controllers (Business Logic)                  │  │  │
│  │  │  - authController, sessionController           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Middleware (Security & Validation)            │  │  │
│  │  │  - JWT Auth, Rate Limiting, CORS               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Models (Data Access Layer)                    │  │  │
│  │  │  - User, Profile, SessionRequest               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Socket.io (Real-time Communication)           │  │  │
│  │  │  - Chat, Whiteboard, WebRTC Signaling          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MySQL Database (Port 3306)                          │  │
│  │  - 20 Tables                                          │  │
│  │  - Foreign Key Constraints                            │  │
│  │  - Indexes for Performance                            │  │
│  │  - ACID Transactions                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

#### 1. MVC (Model-View-Controller) Pattern
- **Model**: Database models (User.js, Profile.js, SessionRequest.js)
- **View**: React components (Login.tsx, Dashboard.tsx, etc.)
- **Controller**: Express controllers (authController.js, sessionController.js)

#### 2. Repository Pattern
- **BaseModel.js**: Abstract base class with CRUD operations
- **Specific Models**: Extend BaseModel with domain-specific methods
- **Benefits**: Centralized data access, easier testing, code reuse

#### 3. Middleware Pattern
- **Authentication**: JWT verification before protected routes
- **Validation**: Express-validator for input sanitization
- **Error Handling**: Centralized error middleware
- **Logging**: Morgan for HTTP request logging

#### 4. Factory Pattern
- **Model Creation**: BaseModel provides factory methods (create, findOne, etc.)
- **Token Generation**: generateToken() function creates JWT tokens

#### 5. Observer Pattern
- **Socket.io Events**: Emit/listen pattern for real-time updates
- **React Hooks**: useState, useEffect for state observation

### Communication Protocols

#### 1. HTTP/HTTPS (REST API)
- **Request-Response**: Synchronous communication
- **Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)
- **JSON Format**: All data exchanged as JSON

#### 2. WebSocket (Socket.io)
- **Bidirectional**: Server can push to client
- **Real-time**: Instant message delivery
- **Events**: Custom event names (chat-message, whiteboard-stroke, signal)
- **Rooms**: Isolated communication channels per session

#### 3. WebRTC (Peer-to-Peer)
- **Direct Connection**: Browser-to-browser video/audio
- **Signaling**: Socket.io for initial handshake
- **STUN/TURN**: NAT traversal for connectivity
- **Media Streams**: getUserMedia API for camera/microphone

### Scalability Considerations

#### 1. Database Connection Pooling
- **MySQL Pool**: Reuses connections instead of creating new ones
- **Configuration**: Max 10 concurrent connections
- **Benefits**: Reduced overhead, better performance

#### 2. Stateless Authentication
- **JWT Tokens**: No server-side session storage
- **Horizontal Scaling**: Any server can validate any token
- **Benefits**: Easy to add more servers

#### 3. Indexed Queries
- **20+ Indexes**: Fast lookups on foreign keys and common queries
- **Composite Indexes**: Multi-column indexes for complex queries
- **Benefits**: Sub-millisecond query times

#### 4. Pagination
- **LIMIT/OFFSET**: Prevents loading all records
- **Default Limits**: 50 sessions, 10 leaderboard entries
- **Benefits**: Reduced memory usage, faster responses

---

## 9. VIVA QUESTIONS & ANSWERS

### Database Fundamentals

**Q1: What is normalization and which normal forms does your database follow?**

**Answer**: Normalization is the process of organizing data to reduce redundancy and improve data integrity. Our database follows:

- **1NF (First Normal Form)**: All tables have atomic values (no repeating groups). Each column contains single values.
- **2NF (Second Normal Form)**: All non-key attributes are fully dependent on the primary key. For example, in `session_requests`, all attributes depend on the session `id`.
- **3NF (Third Normal Form)**: No transitive dependencies. For example, we store `subject_id` in `session_requests` instead of `subject_name` to avoid redundancy.

We use JSON columns for `subjects` and `availability` in profiles, which is a denormalization trade-off for performance (avoiding many-to-many join tables).

**Q2: Explain the foreign key relationships in your database.**

**Answer**: We have multiple foreign key relationships:

1. **users ↔ profiles** (1:1): `profiles.user_id` references `users.id` with CASCADE DELETE
2. **users ↔ session_requests** (1:N): Both `mentor_id` and `student_id` reference `users.id`
3. **session_requests ↔ subjects** (N:1): `subject_id` references `subjects.id`
4. **session_requests ↔ session_messages** (1:N): `session_id` references `session_requests.id` with CASCADE DELETE
5. **challenges ↔ quiz_questions** (1:N): `challenge_id` references `challenges.id` with CASCADE DELETE
6. **quiz_questions ↔ quiz_options** (1:N): `question_id` references `quiz_questions.id` with CASCADE DELETE

CASCADE DELETE ensures referential integrity - when a parent record is deleted, all child records are automatically removed.

**Q3: What is ACID compliance and how does your system ensure it?**

**Answer**: ACID stands for:
- **Atomicity**: Transactions are all-or-nothing. We use MySQL transactions for session completion (update session + increment counters).
- **Consistency**: Database moves from one valid state to another. Foreign key constraints ensure referential integrity.
- **Isolation**: Concurrent transactions don't interfere. MySQL's default isolation level (REPEATABLE READ) prevents dirty reads.
- **Durability**: Committed transactions are permanent. MySQL writes to disk and uses transaction logs.

Example in our code:
```javascript
await connection.beginTransaction();
// Multiple queries
await connection.commit(); // or rollback() on error
```

**Q4: Why did you choose MySQL over other databases like MongoDB?**

**Answer**: 
- **Structured Data**: Our data has clear relationships (users, sessions, quizzes) that fit relational models
- **ACID Compliance**: Critical for financial transactions (credits) and session bookings
- **Complex Queries**: Need JOINs for session details (mentor name, student name, subject)
- **Data Integrity**: Foreign keys prevent orphaned records
- **Mature Ecosystem**: Well-documented, widely supported
- **Transaction Support**: Essential for multi-step operations like session completion

MongoDB would be better for unstructured data like logs or documents, but our domain is highly relational.

**Q5: Explain the indexing strategy in your database.**

**Answer**: We created 20+ indexes for performance:

1. **Foreign Key Indexes**: 
   - `idx_profiles_user_id` - Fast profile lookups
   - `idx_session_requests_mentor` - Mentor's sessions
   - `idx_session_requests_student` - Student's sessions

2. **Status Indexes**:
   - `idx_session_requests_status` - Filter by pending/approved/completed

3. **Room-based Indexes**:
   - `idx_video_chat_messages_room` - Fast chat retrieval
   - `idx_whiteboard_strokes_room` - Whiteboard history

4. **Unique Indexes**:
   - `idx_certificates_share_token` - Fast certificate lookup by token

Indexes speed up SELECT queries but slow down INSERT/UPDATE. We balance this by indexing frequently queried columns.

### System Design & Architecture

**Q6: Explain the three-tier architecture of your system.**

**Answer**: 

**Presentation Tier (Frontend)**:
- React application running in browser
- Handles UI rendering and user interactions
- Makes HTTP requests to backend
- Manages client-side state

**Application Tier (Backend)**:
- Node.js + Express server
- Processes business logic
- Authenticates users with JWT
- Validates input data
- Communicates with database

**Data Tier (Database)**:
- MySQL database
- Stores persistent data
- Enforces data integrity with constraints
- Handles complex queries and transactions

**Benefits**: Separation of concerns, independent scaling, easier maintenance, technology flexibility.

**Q7: How does JWT authentication work in your system?**

**Answer**: 

**Registration/Login**:
1. User submits credentials
2. Server verifies password with bcrypt
3. Server generates JWT: `jwt.sign({ userId }, SECRET, { expiresIn: '7d' })`
4. Token sent to client
5. Client stores in localStorage

**Protected Routes**:
1. Client sends token in Authorization header: `Bearer <token>`
2. Middleware extracts and verifies token: `jwt.verify(token, SECRET)`
3. If valid, user ID extracted and attached to request
4. Route handler proceeds with authenticated user
5. If invalid, 401/403 error returned

**Benefits**: Stateless (no server-side sessions), scalable, works across domains, includes expiration.

**Q8: How do you prevent SQL injection attacks?**

**Answer**: We use **parameterized queries** (prepared statements):

**Vulnerable Code** (DON'T DO THIS):
```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Attacker can inject: ' OR '1'='1
```

**Our Secure Code**:
```javascript
const query = 'SELECT * FROM users WHERE email = ?';
await db.query(query, [email]);
```

The `?` placeholder is replaced by the database driver, which:
1. Escapes special characters
2. Treats input as data, not SQL code
3. Prevents injection attacks

All our models use this pattern through BaseModel's query methods.

**Q9: Explain how WebRTC works for video calls.**

**Answer**: 

**WebRTC (Web Real-Time Communication)** enables peer-to-peer video:

1. **Get Media**: `getUserMedia()` accesses camera/microphone
2. **Create Peer Connection**: `RTCPeerConnection` object
3. **Signaling** (via Socket.io):
   - Mentor creates **offer** (SDP - Session Description Protocol)
   - Sends offer to student via server
   - Student creates **answer**
   - Sends answer back to mentor
4. **ICE Candidates**: Exchange network information for NAT traversal
5. **Connection Established**: Direct P2P video/audio stream
6. **Media Display**: Attach streams to `<video>` elements

**Benefits**: Low latency (direct connection), reduced server load, high quality.

**Q10: How does the quiz grading system work?**

**Answer**: 

**Process**:
1. Frontend sends: `{ challengeId, answers: { questionId: selectedOptionId } }`
2. Backend retrieves all questions for challenge
3. For each question:
   - Get correct option: `SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = true`
   - Compare with user's selection
   - If match, add question's marks to score
4. Calculate percentage: `(score / totalMarks) * 100`
5. Determine pass/fail: `passed = percentage >= 60`
6. If passed:
   - Generate unique share token
   - Create certificate record
   - Return certificate URL
7. Save attempt to database

**Security**: All validation happens server-side to prevent cheating.

### Features & Functionality

**Q11: What is the purpose of the mentor_profiles table?**

**Answer**: 

The `mentor_profiles` table allows **one user to create multiple mentor profiles** for different subjects or expertise areas.

**Use Case**: A user might be:
- Expert in "Python Programming" (one profile)
- Intermediate in "Data Science" (another profile)
- Beginner in "Web Development" (third profile)

**Benefits**:
- **Specialization**: Different bio, subjects, rates per profile
- **Independent Ratings**: Each profile has its own rating
- **Flexibility**: Activate/deactivate profiles independently
- **Better Matching**: Students find mentors with specific expertise

**Relationship**: Many-to-One with users (one user, many profiles).

**Q12: How do you handle real-time chat during video sessions?**

**Answer**: 

We use **Socket.io** for real-time bidirectional communication:

**Connection**:
```javascript
const socket = io(SERVER_URL, {
  auth: { token: JWT_TOKEN }
});
```

**Sending Message**:
```javascript
socket.emit('chat-message', {
  sessionId: '123',
  message: 'Hello!',
  userId: 'user-456'
});
```

**Receiving Message**:
```javascript
socket.on('chat-message', (data) => {
  displayMessage(data.message, data.userId);
});
```

**Persistence**:
- Messages also saved to `video_chat_messages` table
- Allows viewing history after session ends

**Rooms**: Each session has isolated room (`session-${sessionId}`) so messages only go to participants.

**Q13: Explain the session lifecycle from request to completion.**

**Answer**: 

**1. Request** (Status: pending):
- Student finds mentor
- Clicks "Request Session"
- Fills title, description, date/time, subject
- POST /api/sessions creates record with status='pending'

**2. Approval** (Status: approved):
- Mentor views pending requests
- Clicks "Approve" or "Reject"
- PUT /api/sessions/:id/status updates status
- Email notification sent to student

**3. Video Room Generation** (Status: approved):
- When session time arrives
- Either participant clicks "Join Video Call"
- POST /api/sessions/:id/video-room generates unique room ID
- Both join same room

**4. Session Active** (Status: ongoing):
- Video call established via WebRTC
- Real-time chat active
- Whiteboard collaboration
- Resources can be shared

**5. Completion** (Status: completed):
- Mentor clicks "Complete Session"
- Transaction updates:
  - Session status = 'completed'
  - Student's total_sessions_attended + 1
  - Mentor's total_sessions_taught + 1
- Student prompted for feedback

**6. Feedback**:
- Student rates mentor (1-5 stars)
- Writes feedback text
- Mentor's average rating updated

**Q14: How does the AI chatbot work?**

**Answer**: 

**Integration**: Google Gemini API (free tier - 1,500 requests/day)

**Process**:
1. User types message in chatbot
2. Frontend sends: POST /api/ai-chat `{ message, userId }`
3. Backend constructs prompt:
```javascript
const systemPrompt = `You are StudyBot, an AI assistant for Learning Management System.
Help users with:
- Finding mentors
- Scheduling sessions
- Taking quizzes
- Earning certificates
- Platform features`;

const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;
```
4. Call Gemini API: `generativeModel.generateContent(fullPrompt)`
5. Receive AI response
6. Save to database: INSERT INTO ai_chats
7. Return response to frontend
8. Display in chat interface

**Fallback**: If API fails, return predefined responses about platform features.

**Benefits**: 24/7 support, instant answers, reduces support load.

**Q15: What security measures are implemented?**

**Answer**: 

**1. Authentication**:
- JWT tokens with 7-day expiration
- Bcrypt password hashing (10 salt rounds)
- Token verification on protected routes

**2. Authorization**:
- Role-based access (student/mentor/admin)
- Session participant verification
- Mentor-only actions (approve/reject)

**3. Input Validation**:
- Express-validator for all inputs
- Email format validation
- Password strength requirements (min 8 chars)
- Date validation (future dates only)

**4. SQL Injection Prevention**:
- Parameterized queries
- No string concatenation in SQL

**5. XSS Protection**:
- Input sanitization
- Helmet.js security headers
- Content Security Policy

**6. Rate Limiting**:
- 100 requests per 15 min (general)
- 50 requests per 15 min (auth endpoints)
- Prevents brute force attacks

**7. CORS**:
- Whitelist allowed origins
- Prevents unauthorized cross-origin requests

**8. Environment Variables**:
- Sensitive data in .env files
- Not committed to version control
- Different configs for dev/prod

**Q16: How do you handle database transactions?**

**Answer**: 

**Use Case**: Session completion requires multiple updates atomically.

**Implementation**:
```javascript
const connection = await db.pool.getConnection();
try {
  await connection.beginTransaction();
  
  // Update 1: Session status
  await connection.query(
    'UPDATE session_requests SET status = ? WHERE id = ?',
    ['completed', sessionId]
  );
  
  // Update 2: Student session count
  await connection.query(
    'UPDATE profiles SET total_sessions_attended = total_sessions_attended + 1 WHERE user_id = ?',
    [studentId]
  );
  
  // Update 3: Mentor session count
  await connection.query(
    'UPDATE profiles SET total_sessions_taught = total_sessions_taught + 1 WHERE user_id = ?',
    [mentorId]
  );
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

**Benefits**:
- **Atomicity**: All updates succeed or none do
- **Consistency**: Database never in inconsistent state
- **Error Recovery**: Rollback on failure

**Q17: Explain the difference between session_messages and video_chat_messages tables.**

**Answer**: 

**session_messages**:
- **Purpose**: Persistent chat within a session request
- **Scope**: Tied to session_requests.id
- **Use Case**: Pre-session planning, post-session discussion
- **Lifecycle**: Exists before and after video call
- **Foreign Key**: CASCADE DELETE with session_requests

**video_chat_messages**:
- **Purpose**: Real-time chat during live video call
- **Scope**: Tied to video room_id (not session_id)
- **Use Case**: Quick messages during video call
- **Lifecycle**: Only during active video session
- **Foreign Key**: References users only

**Why Separate?**:
- Different contexts (planning vs live)
- Different data models (session vs room)
- Performance (video chat needs fast inserts)
- Flexibility (video rooms can exist without sessions)

**Q18: How does the leaderboard ranking work?**

**Answer**: 

**Query**:
```sql
SELECT u.id, u.username, p.contribution_score, 
       p.total_sessions_taught, p.rating, p.total_sessions_attended
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
ORDER BY p.contribution_score DESC
LIMIT 10;
```

**Contribution Score Calculation**:
- +10 points: Complete a session (as student or mentor)
- +5 points: Pass a quiz
- +3 points: Provide feedback
- +2 points: Upload a resource
- +1 point: Daily login

**Ranking**: Users sorted by contribution_score in descending order.

**Display**: Top 10 users shown with:
- Username
- Total score
- Sessions taught/attended
- Average rating

**Gamification**: Encourages active participation and quality contributions.

**Q19: What is the purpose of the share_token in certificates?**

**Answer**: 

**Purpose**: Enables **public sharing** of certificates without authentication.

**Generation**:
```javascript
const shareToken = uuidv4().replace(/-/g, '');
// Example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Public URL**: `/certificate/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Benefits**:
- **No Login Required**: Anyone with link can view
- **LinkedIn Sharing**: Add to profile
- **Verification**: Employers can verify authenticity
- **Unique**: UUID ensures no collisions
- **Secure**: Impossible to guess other tokens

**Database**:
- UNIQUE constraint prevents duplicates
- Indexed for fast lookups
- Never expires

**Q20: How do you handle concurrent session requests to the same mentor?**

**Answer**: 

**Database Level**:
- No unique constraint on (mentor_id, requested_time)
- Multiple students can request same mentor at same time
- Status field manages conflicts

**Application Logic**:
1. All requests start as 'pending'
2. Mentor sees all pending requests
3. Mentor approves ONE request for a time slot
4. Other requests remain pending or get rejected
5. Frontend shows mentor's availability

**Future Enhancement**:
- Check mentor's approved sessions before allowing request
- Block time slots that are already booked
- Implement calendar availability system

**Current Behavior**: 
- Mentor manually manages schedule
- Can approve overlapping sessions (mentor's responsibility)
- Flexibility for mentors to manage their time

---

## 10. IMPROVEMENTS

### 1. Performance Optimizations

**Caching Layer**:
- Implement Redis for frequently accessed data
- Cache mentor lists, leaderboard, subject lists
- Reduce database queries by 60-70%
- Set TTL (Time To Live) for cache invalidation

**Database Query Optimization**:
- Add more composite indexes for complex queries
- Implement query result caching
- Use EXPLAIN to analyze slow queries
- Consider read replicas for scaling

**Frontend Optimization**:
- Implement lazy loading for components
- Code splitting for faster initial load
- Image optimization and CDN
- Service workers for offline support

### 2. Feature Enhancements

**Advanced Scheduling**:
- Calendar integration (Google Calendar, Outlook)
- Recurring sessions support
- Automatic reminders (email, SMS, push notifications)
- Time zone handling for global users
- Availability blocking system

**Payment Integration**:
- Stripe/PayPal for paid mentoring sessions
- Wallet system for credits
- Subscription plans (premium features)
- Mentor payout system
- Transaction history

**Enhanced Video Features**:
- Recording sessions for later review
- Screen sharing improvements
- Virtual backgrounds
- Breakout rooms for group sessions
- Live transcription/captions

**Advanced Quiz System**:
- Multiple question types (true/false, fill-in-blank, essay)
- Timed quizzes with countdown
- Question randomization
- Difficulty levels
- Adaptive testing (questions adjust to user level)

**Social Features**:
- User profiles with photos
- Follow mentors
- Session reviews and testimonials
- Discussion forums
- Study groups

### 3. Security Enhancements

**Two-Factor Authentication (2FA)**:
- SMS or authenticator app
- Required for sensitive actions
- Backup codes for recovery

**OAuth Integration**:
- Google Sign-In
- GitHub authentication
- LinkedIn integration
- Single Sign-On (SSO)

**Advanced Rate Limiting**:
- Per-user rate limits
- Dynamic limits based on user reputation
- IP-based blocking for abuse

**Audit Logging**:
- Track all user actions
- Log security events
- Compliance reporting
- Forensic analysis capability

**Data Encryption**:
- Encrypt sensitive data at rest
- TLS 1.3 for data in transit
- End-to-end encryption for messages

### 4. Scalability Improvements

**Microservices Architecture**:
- Separate services for auth, sessions, quizzes
- Independent scaling per service
- Better fault isolation
- Technology diversity

**Load Balancing**:
- Multiple backend servers
- Nginx or HAProxy
- Health checks and failover
- Session affinity for WebSocket

**Database Sharding**:
- Horizontal partitioning by user ID
- Separate databases for different regions
- Read replicas for scaling reads

**Message Queue**:
- RabbitMQ or Kafka for async tasks
- Email sending
- Certificate generation
- Notification delivery

**CDN Integration**:
- CloudFlare or AWS CloudFront
- Static asset delivery
- Reduced latency globally
- DDoS protection

### 5. User Experience Improvements

**Mobile Application**:
- React Native for iOS/Android
- Push notifications
- Offline mode
- Better mobile video experience

**Accessibility**:
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Font size adjustment

**Internationalization (i18n)**:
- Multi-language support
- RTL (Right-to-Left) languages
- Currency localization
- Date/time formatting per locale

**Progressive Web App (PWA)**:
- Install on home screen
- Offline functionality
- Background sync
- Push notifications

**Advanced Search**:
- Full-text search for mentors
- Filter by rating, price, availability
- Search history
- Saved searches

### 6. Analytics & Reporting

**User Analytics**:
- Dashboard with learning metrics
- Session attendance trends
- Quiz performance over time
- Skill progress tracking

**Mentor Analytics**:
- Earnings reports
- Session statistics
- Student feedback trends
- Performance insights

**Admin Dashboard**:
- Platform usage statistics
- User growth metrics
- Revenue tracking
- System health monitoring

**A/B Testing**:
- Feature flag system
- Experiment tracking
- Conversion optimization
- User behavior analysis

### 7. AI/ML Enhancements

**Smart Matching**:
- ML algorithm to match students with best mentors
- Based on learning style, subject, availability
- Collaborative filtering

**Personalized Recommendations**:
- Suggest relevant courses/mentors
- Based on user history and preferences
- Content-based filtering

**Sentiment Analysis**:
- Analyze feedback text
- Detect toxic comments
- Improve mentor ratings

**Chatbot Improvements**:
- Fine-tune on platform-specific data
- Multi-turn conversations
- Context retention
- Voice input/output

### 8. DevOps & Monitoring

**CI/CD Pipeline**:
- Automated testing
- Continuous deployment
- Blue-green deployments
- Rollback capability

**Monitoring & Alerting**:
- Prometheus + Grafana
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring

**Logging**:
- Centralized logging (ELK stack)
- Log aggregation
- Search and analysis
- Retention policies

**Backup & Disaster Recovery**:
- Automated daily backups
- Point-in-time recovery
- Multi-region replication
- Disaster recovery plan

### 9. Compliance & Legal

**GDPR Compliance**:
- Data export functionality
- Right to be forgotten
- Consent management
- Privacy policy

**Terms of Service**:
- User agreements
- Mentor agreements
- Refund policies
- Dispute resolution

**Content Moderation**:
- Report inappropriate content
- Admin review system
- Automated filtering
- User blocking

### 10. Business Features

**Referral Program**:
- Invite friends for credits
- Affiliate system for mentors
- Tracking and rewards

**Subscription Tiers**:
- Free tier (limited features)
- Premium tier (unlimited sessions)
- Enterprise tier (custom features)

**Marketplace**:
- Sell courses and materials
- Digital downloads
- Revenue sharing

**White-Label Solution**:
- Customizable branding
- Multi-tenant architecture
- Per-organization configuration

---

## CONCLUSION

This Learning Management System demonstrates a comprehensive understanding of:
- **Database Design**: Normalized schema with 20 tables, foreign keys, and indexes
- **Backend Development**: RESTful APIs, authentication, real-time communication
- **Frontend Development**: Modern React with TypeScript, responsive UI
- **Security**: JWT, bcrypt, rate limiting, input validation
- **Real-time Features**: WebRTC, Socket.io, collaborative tools
- **Scalability**: Connection pooling, pagination, stateless architecture

The system successfully implements peer-to-peer learning with video calls, quizzes, certificates, and AI assistance, providing a solid foundation for educational technology.

---

**Document Version**: 1.0  
**Last Updated**: March 14, 2026  
**Prepared For**: College DBMS Viva Examination  
**Total Pages**: 50+  
**Total Tables**: 20  
**Total API Endpoints**: 40+  
**Total Features**: 10 Major Modules
