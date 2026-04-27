# Learning Management System (LMS) — Complete Viva Documentation
### Prepared for Final Year DBMS Viva Presentation

---

## 📌 1. Project Overview

### What is LMS?
A **Learning Management System (LMS)** is a web-based platform that enables structured online education between **Mentors** (teachers) and **Students** (learners). It manages the complete lifecycle of learning — from course enrollment to live sessions, assignments, quizzes, and certificate generation.

### Purpose of the System
Our LMS is a **Peer-to-Peer Learning Platform** where:
- Students can find mentors based on subject expertise
- Mentors can create courses, conduct live video classes, assign work, and evaluate students
- The system automates session scheduling, certificate generation, and progress tracking

### Real-World Problem It Solves
| Problem | Our Solution |
|---|---|
| Students can't find subject-specific tutors | Subject-based mentor discovery with availability slots |
| No structured online teaching platform | Full course → session → assignment → quiz → certificate flow |
| Manual session scheduling is time-consuming | Auto-session creation on course enrollment |
| No way to verify learning completion | Certificate auto-generated on passing quiz ≥60% |
| Lack of real-time interaction | WebRTC video + live chat + collaborative whiteboard |

---

## 🧩 2. System Architecture

### Technology Stack
```
Frontend          Backend           Database
─────────         ─────────         ─────────
React 18          Node.js           MySQL 8.0
TypeScript        Express.js        25 Tables
Vite              Socket.IO         lms_db
TailwindCSS       JWT Auth
shadcn/ui         bcrypt
```

### Architecture Flow
```
Browser (React)
     │  HTTP REST API / WebSocket
     ▼
Express.js Server (Port 3001)
     ├── JWT Middleware (Authentication)
     ├── Role Middleware (Authorization)
     └── Rate Limiter (Security)
     │
     ▼
MySQL Database (lms_db) — 25 Tables with FK Constraints
```

### User → System → Database Flow
```
User Action → React Component → API Call (fetch/axios)
    → Express Route → Middleware (auth check)
    → Controller → Model → MySQL Query
    → Response → React State Update → UI Render
```

---

## 👤 3. User Roles & Modules

### Role 1: Student
**Registration:** `/login/student` → Sign Up tab

**Responsibilities:**
- Browse and enroll in courses
- Attend live video sessions with mentor
- Submit assignments
- Attempt quizzes
- Earn certificates on passing (≥60%)
- Rate mentor after session

**Flow:**
```
Register → Login → Browse Courses → Enroll
→ Auto Session Created → Join Live Class
→ Submit Assignment → Take Quiz → Get Certificate
```

### Role 2: Mentor
**Registration:** `/login/mentor` → Register tab

**Responsibilities:**
- Create and manage courses
- Create assignments with due dates
- Create quizzes with MCQ questions
- Approve/reject session requests
- Conduct live video sessions
- Grade student submissions
- Manage mentor profile (subjects, availability)

**Flow:**
```
Register → Login → Create Mentor Profile
→ Create Course → Student Enrolls
→ Approve Session → Conduct Live Class
→ Assign Work → Create Quiz → Grade Submissions
```

---

## 🔄 4. Complete System Flow

### Step 1: Registration & Login
```
User visits /login → Selects role (Student / Mentor)
→ POST /api/auth/register
→ Password hashed with bcrypt (10 salt rounds)
→ INSERT INTO users (email, password_hash, role)
→ INSERT INTO profiles (user_id, credits=0)
→ JWT token generated (7 day expiry)
→ Redirected to role-specific dashboard
```

### Step 2: Mentor Creates Course
```
Mentor → My Courses → Create Course
→ POST /api/courses
→ INSERT INTO courses (title, domain, description, duration, created_by)
→ Course visible to all students
```

### Step 3: Student Enrolls
```
Student → Browse Courses → Enroll Now
→ POST /api/courses/:id/enroll
→ INSERT INTO course_enrollments (user_id, course_id, status='active')
→ AUTO: INSERT INTO session_requests (status='approved', video_room_id='room_c6_s13_xxx')
→ Both see session in Upcoming Sessions
```

### Step 4: Live Video Session
```
Both click "Join Live Class"
→ Navigate to /room/room_c6_s13_xxx
→ Socket.IO connects both to same room
→ Mentor: creates WebRTC offer → sends via socket
→ Student: receives offer → sends answer
→ ICE candidates exchanged → peer-to-peer video established
→ Chat and Whiteboard available in real-time
→ End Call → session marked 'completed'
→ Student rates mentor (1-5 stars)
→ Credits: Student +10, Mentor +20
```

### Step 5: Assignment Flow
```
Mentor creates assignment:
→ POST /api/assignments
→ INSERT INTO assignments (course_id, title, due_date, total_marks)

Student submits:
→ POST /api/assignments/:id/submit
→ INSERT INTO assignment_submissions (assignment_id, user_id, file_url, status='submitted')

Mentor grades:
→ PUT /api/assignments/submissions/:id/grade
→ UPDATE assignment_submissions SET marks_obtained=?, status='reviewed'
```

### Step 6: Quiz & Certificate Flow
```
Mentor creates quiz:
→ POST /api/mentor-quizzes
→ INSERT INTO challenges + quiz_questions + quiz_options

Student takes quiz:
→ POST /api/quizzes/submit
→ System calculates: (correct_marks / total_marks) * 100
→ IF score >= 60%:
    INSERT INTO certificates (user_id, challenge_id, score, share_token)
    Certificate auto-generated ✅
→ UPDATE profiles SET credits = credits + points_reward
```

### Complete Flow Diagram
```
STUDENT                    SYSTEM                    DATABASE
───────                    ──────                    ────────
Register ──────────→ Hash password ──────────→ INSERT users
Login ─────────────→ Verify + JWT ───────────→ SELECT users
Browse Courses ────→ GET /courses ───────────→ SELECT courses
Enroll ────────────→ POST /enroll ───────────→ INSERT enrollments
                                              INSERT session_requests
Join Session ──────→ WebRTC Signal ──────────→ Socket.IO room
Submit Assignment ─→ POST /submit ───────────→ INSERT submissions
Take Quiz ─────────→ POST /quiz/submit ──────→ INSERT quiz_attempts
Pass Quiz ─────────→ Auto Certificate ───────→ INSERT certificates
Rate Mentor ───────→ POST /feedback ─────────→ INSERT session_feedback
                                              UPDATE profiles.rating
```

---

## 🗄️ 5. Database Design

### Database: `lms_db` — 25 Tables

#### Key Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Authentication | id PK, email UNIQUE, password_hash, role |
| `profiles` | Extended info | user_id FK, bio, rating, credits, contribution_score |
| `courses` | Mentor courses | id PK, title, domain, created_by FK |
| `course_enrollments` | M:N users-courses | user_id FK, course_id FK, UNIQUE(user_id,course_id) |
| `session_requests` | Live sessions | student_id FK, mentor_id FK, status, video_room_id |
| `assignments` | Course work | course_id FK, title, due_date, total_marks |
| `assignment_submissions` | Student work | assignment_id FK, user_id FK, marks_obtained |
| `challenges` | Quiz definitions | title, subject, duration, points_reward |
| `quiz_questions` | MCQ questions | challenge_id FK, question_text, marks |
| `quiz_options` | Answer choices | question_id FK, option_text, is_correct |
| `quiz_attempts` | Quiz results | user_id FK, challenge_id FK, score, passed |
| `certificates` | Completion proof | user_id FK, score, share_token UNIQUE |
| `session_feedback` | Ratings | session_id FK, student_id FK, rating CHECK(1-5) |
| `subjects` | Subject lookup | id PK, name |
| `profile_subjects` | M:N profiles-subjects | profile_id FK, subject_id FK |
| `profile_availability` | Time slots | profile_id FK, day, start_time, end_time |
| `mentor_profiles` | Mentor details | user_id FK, expertise_level, hourly_rate |
| `mentor_subjects` | M:N mentor-subjects | mentor_id FK, subject_id FK |
| `mentor_availability` | Mentor slots | mentor_id FK, day, start_time, end_time |
| `video_chat_messages` | Session chat | room_id, user_id FK, message |
| `whiteboard_strokes` | Drawing data | room_id, user_id FK, stroke_data JSON |
| `ai_chats` | AI history | user_id FK, user_message, assistant_reply |
| `resources` | Learning material | subject_id FK, uploaded_by FK |
| `shared_resources` | Session files | session_id FK, shared_by FK |
| `user_challenge_progress` | Quiz progress | user_id FK, challenge_id FK, UNIQUE |

### Relationships
| Relationship | Type | Implementation |
|---|---|---|
| User ↔ Profile | 1:1 | profiles.user_id UNIQUE FK |
| User → Courses | 1:M | courses.created_by FK |
| User ↔ Courses | M:N | course_enrollments junction table |
| Course → Assignments | 1:M | assignments.course_id FK |
| User ↔ Assignments | M:N | assignment_submissions junction table |
| Challenge → Questions | 1:M | quiz_questions.challenge_id FK |
| Question → Options | 1:M | quiz_options.question_id FK |
| User → Certificates | 1:M | certificates.user_id FK |
| Session → Feedback | 1:1 | session_feedback.session_id FK UNIQUE |

### Normalization
- **1NF:** Subjects stored in `profile_subjects` table (not comma-separated string)
- **2NF:** `assignment_submissions` depends on full composite key (assignment_id + user_id)
- **3NF:** `subjects` is a separate lookup table — no transitive dependency

---

## ⚙️ 6. SQL Operations Used

### SELECT with Multiple JOINs
```sql
-- Get mentors with subjects and availability
SELECT u.id, u.full_name, p.rating,
       GROUP_CONCAT(DISTINCT s.name) as subjects,
       GROUP_CONCAT(DISTINCT CONCAT(pa.day,'|',pa.start_time)) as slots
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
LEFT JOIN profile_subjects ps ON p.id = ps.profile_id
LEFT JOIN subjects s ON ps.subject_id = s.id
LEFT JOIN profile_availability pa ON p.id = pa.profile_id
WHERE p.is_mentor = true
GROUP BY u.id ORDER BY p.rating DESC;
```

### INSERT with Transaction
```sql
BEGIN;
INSERT INTO course_enrollments (user_id, course_id, status) VALUES (13, 6, 'active');
INSERT INTO session_requests (mentor_id, student_id, title, status, video_room_id)
  VALUES (31, 13, 'DSA Live Class', 'approved', 'room_c6_s13_1234');
COMMIT;
```

### UPDATE with Subquery
```sql
UPDATE profiles
SET rating = (SELECT AVG(rating) FROM session_feedback WHERE mentor_id = 31)
WHERE user_id = 31;
```

### Aggregation
```sql
-- Leaderboard
SELECT u.full_name, p.contribution_score,
       COUNT(DISTINCT sr.id) as sessions,
       AVG(sf.rating) as avg_rating
FROM users u
JOIN profiles p ON u.id = p.user_id
LEFT JOIN session_requests sr ON u.id = sr.mentor_id AND sr.status='completed'
LEFT JOIN session_feedback sf ON sr.id = sf.session_id
GROUP BY u.id ORDER BY p.contribution_score DESC LIMIT 10;
```

### Constraints Used
| Constraint | Example | Purpose |
|---|---|---|
| PRIMARY KEY | users.id | Unique identifier |
| FOREIGN KEY | profiles.user_id → users.id | Referential integrity |
| UNIQUE | users.email | No duplicate accounts |
| UNIQUE | course_enrollments(user_id, course_id) | One enrollment per student |
| CHECK | session_feedback.rating (1-5) | Valid rating range |
| NOT NULL | users.email, password_hash | Required fields |
| DEFAULT | profiles.credits = 0 | Initial value |
| ON DELETE CASCADE | profiles → users | Auto-delete child records |

---

## 🔐 7. Validation & Security

### Authentication Flow
```
Login → express-validator checks email + password
→ bcrypt.compare(password, hash) — timing-safe
→ jwt.sign({userId}, SECRET, {expiresIn:'7d'})
→ Token in localStorage
→ Every request: Authorization: Bearer <token>
→ authenticateToken middleware verifies JWT
```

### Security Layers
| Layer | Technology | Protection |
|---|---|---|
| Password | bcrypt (10 rounds) | Never stored plain text |
| Auth | JWT (7 day expiry) | Stateless signed tokens |
| Authorization | Role middleware | Students can't access mentor routes |
| Rate Limiting | express-rate-limit | Prevents brute force |
| HTTP Headers | helmet.js | XSS, clickjacking prevention |
| Input Validation | express-validator | Validates all inputs |
| SQL Injection | mysql2 prepared statements | `?` placeholders only |
| CORS | cors middleware | Only allowed origins |

---

## 🎯 8. Key Features

1. **Role-Based Separate Portals** — Student and Mentor have completely separate login, dashboard, and features
2. **Subject-Based Mentor Discovery** — Filter mentors by subject with availability slots
3. **Auto Session Scheduling** — Enrollment triggers automatic approved session
4. **Real-Time Video Class** — WebRTC peer-to-peer with chat and whiteboard
5. **Automated Certificate Generation** — Score ≥60% → certificate auto-created with share link
6. **Credit & Gamification** — Points for sessions, leaderboard ranking
7. **AI Study Assistant** — Google Gemini API chatbot on every dashboard
8. **Full CRUD for Mentors** — Courses, Assignments, Quizzes all manageable

---

## 🚀 9. Advanced Features

### Real-Time (Socket.IO Events)
- `join-session` — User joins video room
- `peer-joined` — Notifies mentor when student arrives
- `signal` — WebRTC offer/answer/ICE exchange
- `chat-message` — Live chat broadcast
- `whiteboard-stroke` — Real-time drawing sync

### AI Chatbot (Gemini API)
- Model: `gemini-1.5-flash`
- Context-aware (reads last 6 session messages)
- Fallback to keyword responses if API unavailable
- All conversations saved in `ai_chats` table

---

## 📊 10. Sample Use Case Scenario

**Sumeet (Student) learns DSA from Neha (Mentor)**

```
1. Sumeet registers → users: id=13, role='student'
2. Neha registers → users: id=31, role='mentor'
   Creates profile: "DSA Expert", subject: DSA, availability: Sunday 9-10 AM
3. Sumeet browses → sees "DSA Masterclass" by Neha
   Enrolls → course_enrollments + session_requests auto-created
4. Both join /room/room_c6_s13_xxx
   WebRTC connects → Neha teaches on whiteboard → Sumeet chats
5. Neha creates assignment: "Array Problems" due tomorrow
   Sumeet submits → Neha grades: 85/100
6. Neha creates DSA quiz: 5 questions × 10 marks = 50 total
   Sumeet scores 40/50 = 80% → PASS
   certificates: (user_id=13, score=40, share_token='abc123')
7. Session ends → Sumeet rates 5 stars
   Neha's rating updated → Credits: Sumeet +10, Neha +20
```

---

## ⚠️ 11. Challenges Faced

| Challenge | Problem | Solution |
|---|---|---|
| WebRTC same machine | Two tabs can't share camera | Audio-only fallback + TURN server |
| Rate limiting | 429 errors on navigation | Cache user in localStorage |
| Socket HMR disconnect | Vite hot reload breaks socket | Singleton socket pattern |
| DB type mismatch | UUID string in INT column | Migration to fix column types |
| Normalization | JSON subjects caused query issues | Extracted to junction tables |
| Duplicate keys | Same session ID in two lists | Deduplication with Set() |

---

## ✅ 12. Conclusion

### What I Learned
1. **Database Design** — Proper normalization prevents data anomalies
2. **Security** — bcrypt + JWT is industry standard for auth
3. **Real-time Systems** — WebRTC + Socket.IO for peer-to-peer communication
4. **REST API Design** — Proper HTTP methods, status codes, middleware
5. **Role-Based Access** — Separate portals and route guards
6. **Transaction Management** — ACID properties ensure consistency

### Future Improvements
1. Email notifications for session reminders
2. Payment gateway for paid courses
3. Mobile app (React Native)
4. AI-powered mentor-student matching
5. Session recording and playback
6. Admin analytics dashboard

---

## 📋 Quick Viva Q&A

**Q: What database?**
A: MySQL 8.0, database `lms_db`, 25 tables, normalized to 3NF.

**Q: What is normalization?**
A: Eliminates redundancy. 1NF: atomic values (subjects in separate table). 2NF: no partial dependencies. 3NF: no transitive dependencies (subjects lookup table).

**Q: Explain a foreign key.**
A: `profiles.user_id` references `users.id` with ON DELETE CASCADE — deleting a user auto-deletes their profile.

**Q: How does authentication work?**
A: Login → bcrypt verifies password → JWT generated → stored in localStorage → sent as Bearer token → middleware verifies on every request.

**Q: How is certificate generated?**
A: Quiz submitted → score calculated → if ≥60% → INSERT into certificates with unique share_token.

**Q: How do you prevent SQL injection?**
A: mysql2 prepared statements with `?` placeholders. Input never concatenated into SQL.

**Q: What SQL joins did you use?**
A: INNER JOIN (mentors with profiles), LEFT JOIN (sessions with optional subjects), GROUP BY with GROUP_CONCAT (aggregating subjects per mentor).

**Q: What is the ER diagram?**
A: USER(1:1)PROFILE, USER(1:M)COURSES, USER(M:N)ENROLLMENT(M:N)COURSES, COURSE(1:M)ASSIGNMENT, USER(M:N)SUBMISSION, CHALLENGE(1:M)QUESTION(1:M)OPTION, USER(1:M)CERTIFICATE.

**Q: What real-time features?**
A: WebRTC peer-to-peer video, Socket.IO signaling + live chat, collaborative whiteboard, AI chatbot (Google Gemini API).
