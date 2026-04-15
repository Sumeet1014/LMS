# DBMS VIVA - QUICK REFERENCE GUIDE

## Project Overview
**Name**: Learning Management System (LMS)  
**Type**: Peer-to-Peer Learning Platform  
**Database**: MySQL with 20 tables  
**Backend**: Node.js + Express  
**Frontend**: React + TypeScript  

## Key Statistics
- **20 Tables** with foreign key relationships
- **40+ API Endpoints** for all features
- **10 Major Modules** (Auth, Sessions, Video, Quiz, etc.)
- **20+ Database Indexes** for performance
- **3-Tier Architecture** (Presentation, Application, Data)

## Core Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express, MySQL2, Socket.io, JWT, Bcrypt
- **Real-time**: WebRTC (video), Socket.io (chat/whiteboard)
- **AI**: Google Gemini API for chatbot
- **Security**: Helmet, CORS, Rate Limiting, Express Validator

## Main Tables (Top 10)
1. **users** - Authentication (email, password_hash, role)
2. **profiles** - Extended info (bio, rating, subjects, scores)
3. **mentor_profiles** - Multiple mentor profiles per user
4. **session_requests** - Session booking (mentor, student, status)
5. **quiz_questions** - Challenge questions
6. **quiz_options** - Multiple choice options
7. **certificates** - Auto-generated on quiz pass (≥60%)
8. **video_chat_messages** - Real-time chat during video
9. **whiteboard_strokes** - Collaborative drawing data
10. **session_feedback** - Ratings and reviews

## Key Features
1. JWT Authentication with bcrypt password hashing
2. Multiple mentor profiles per user
3. WebRTC peer-to-peer video calls
4. Real-time chat and whiteboard (Socket.io)
5. Auto-graded quizzes with certificate generation
6. AI chatbot (Google Gemini)
7. Leaderboard and gamification
8. Public certificate sharing
9. Session request-approval workflow
10. Transaction support for data consistency

## Important Queries

### Get User Sessions
```sql
SELECT sr.*, sp.username as student_name, mp.username as mentor_name, sub.name as subject_name
FROM session_requests sr
LEFT JOIN profiles sp ON sr.student_id = sp.user_id
LEFT JOIN profiles mp ON sr.mentor_id = mp.user_id
LEFT JOIN subjects sub ON sr.subject_id = sub.id
WHERE sr.student_id = ? OR sr.mentor_id = ?
ORDER BY sr.created_at DESC;
```

### Complete Session (Transaction)
```sql
BEGIN TRANSACTION;
UPDATE session_requests SET status = 'completed' WHERE id = ?;
UPDATE profiles SET total_sessions_attended = total_sessions_attended + 1 WHERE user_id = ?;
UPDATE profiles SET total_sessions_taught = total_sessions_taught + 1 WHERE user_id = ?;
COMMIT;
```

### Get Leaderboard
```sql
SELECT u.id, u.username, p.contribution_score, p.total_sessions_taught, p.rating
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
ORDER BY p.contribution_score DESC
LIMIT 10;
```

## Security Features
- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration, stateless auth
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: 50 requests/15min for auth, 100 for general
- **CORS**: Whitelist allowed origins
- **Input Validation**: Express-validator on all inputs
- **XSS Protection**: Helmet.js security headers

## System Workflow
1. **User registers** → Bcrypt hash → Create user + profile → Generate JWT
2. **Find mentor** → Query profiles WHERE is_mentor=true → Display list
3. **Request session** → INSERT session_requests (status='pending')
4. **Mentor approves** → UPDATE status='approved' → Email notification
5. **Join video** → Generate room_id → WebRTC P2P connection
6. **Take quiz** → Submit answers → Calculate score → Generate certificate if ≥60%
7. **View certificate** → Public URL with share_token → No auth required

## Common Viva Questions

**Q: Why MySQL over MongoDB?**  
A: Structured data with clear relationships, need for JOINs, ACID compliance for transactions, foreign key constraints for integrity.

**Q: Explain JWT authentication**  
A: Stateless token-based auth. Server signs token with secret, client stores it, sends in Authorization header, server verifies signature and expiration.

**Q: How does WebRTC work?**  
A: Peer-to-peer video. Create offer (SDP), exchange via Socket.io signaling, exchange ICE candidates, establish direct connection, stream video/audio.

**Q: What is normalization?**  
A: Organizing data to reduce redundancy. Our DB follows 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies).

**Q: Explain foreign keys**  
A: References between tables. profiles.user_id → users.id with CASCADE DELETE. Ensures referential integrity - can't have orphaned records.

**Q: How do transactions work?**  
A: BEGIN TRANSACTION → Multiple queries → COMMIT (or ROLLBACK on error). Ensures atomicity - all succeed or none do.

**Q: What are indexes?**  
A: Data structures for fast lookups. We have 20+ indexes on foreign keys, status fields, room_ids. Speed up SELECT but slow INSERT/UPDATE.

**Q: How is quiz grading done?**  
A: Server-side validation. Compare user's selected_option_id with correct option from quiz_options WHERE is_correct=true. Calculate percentage, pass if ≥60%.

**Q: Explain three-tier architecture**  
A: Presentation (React UI), Application (Express API + business logic), Data (MySQL database). Separation of concerns, independent scaling.

**Q: How do you prevent SQL injection?**  
A: Parameterized queries with ? placeholders. Database driver escapes special characters, treats input as data not SQL code.

## File Structure (Key Files)
- **backend/server.js** - Main server, Socket.io setup
- **backend/models/User.js** - User CRUD, password hashing
- **backend/models/SessionRequest.js** - Session management
- **backend/controllers/authController.js** - Auth business logic
- **backend/routes/auth.js** - Auth API endpoints
- **backend/routes/quizzes.js** - Quiz submission and grading
- **src/pages/Dashboard.tsx** - Main user dashboard
- **src/pages/VideoRoom.tsx** - WebRTC video calls
- **src/components/AIChatBot.tsx** - Gemini AI integration

## Improvements to Mention
1. **Caching**: Redis for frequently accessed data
2. **Payment**: Stripe integration for paid sessions
3. **Mobile App**: React Native for iOS/Android
4. **2FA**: Two-factor authentication
5. **Analytics**: User learning metrics dashboard
6. **Microservices**: Separate services for scaling
7. **CDN**: CloudFlare for static assets
8. **ML Matching**: AI-powered mentor recommendations
9. **Recording**: Save video sessions for review
10. **i18n**: Multi-language support

## Database Relationships
- users (1) ↔ (1) profiles
- users (1) ↔ (N) mentor_profiles
- users (1) ↔ (N) session_requests (as mentor)
- users (1) ↔ (N) session_requests (as student)
- session_requests (1) ↔ (N) session_messages
- challenges (1) ↔ (N) quiz_questions
- quiz_questions (1) ↔ (N) quiz_options
- users (1) ↔ (N) certificates

## Port Configuration
- **Frontend**: 5173 or 5174 (Vite dev server)
- **Backend**: 3001 (Express server)
- **Database**: 3306 (MySQL default)
- **Socket.io**: Same as backend (3001)

## Environment Variables
- `JWT_SECRET` - Token signing secret
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config
- `GEMINI_API_KEY` - Google AI API key
- `ALLOWED_ORIGINS` - CORS whitelist
- `PORT` - Server port (default 3001)

---

**Pro Tip**: Focus on explaining the "why" behind design decisions, not just "what" the code does. Examiners want to see your understanding of trade-offs and best practices.
