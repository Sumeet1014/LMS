# Learning Management System (LMS) — Complete Deep Understanding
### For Viva, Interview & Presentation

---

## 📌 1. What is My Project?

### In Simple Words
Imagine you want to learn **Data Structures** but you don't have a teacher nearby. Our LMS connects you with an expert mentor online. You can:
- Find a mentor who teaches DSA
- Enroll in their course
- Attend a **live video class** from your browser
- Submit assignments
- Take a quiz
- Get a **certificate** if you pass

It's like an online school — but between real students and real mentors, not pre-recorded videos.

### What Problem Does It Solve?
| Real-Life Problem | Our Solution |
|---|---|
| "I can't find a good DSA tutor near me" | Browse mentors by subject online |
| "Scheduling a class takes too many messages" | Enroll → session auto-scheduled |
| "I don't know if I actually learned anything" | Quiz → Certificate proves it |
| "I can't attend physical classes" | Live video class from browser |
| "No proof of learning" | Shareable certificate with unique link |

### Why This Project is Important?
- Education is moving online — this is the future
- Peer-to-peer learning is more affordable than coaching institutes
- Real-time interaction (video + whiteboard) makes it as good as physical class
- Automated certificate generation adds credibility
- It demonstrates full-stack development + DBMS + real-time systems

---

## 🎯 2. Objective of the Project

### Main Goals
1. **Connect** students with subject-expert mentors
2. **Automate** session scheduling (no manual coordination)
3. **Manage** the complete learning flow: Course → Session → Assignment → Quiz → Certificate
4. **Track** student progress and mentor performance
5. **Secure** the system with role-based access (student ≠ mentor)

### What the System is Designed to Achieve
```
Student Goal:  Find mentor → Learn → Get certified
Mentor Goal:   Teach → Assign work → Evaluate → Earn credits
System Goal:   Automate everything in between
```

---

## 🧠 3. Core Idea / Working Logic

### How the System Works Internally

Think of it like a **school management system** but fully online:

```
SCHOOL ANALOGY          →    OUR LMS
─────────────────────────────────────────
Admission office         →    Course enrollment
Timetable               →    Auto session scheduling
Classroom               →    Live video room (WebRTC)
Blackboard              →    Collaborative whiteboard
Homework                →    Assignments
Exam                    →    Quiz
Report card             →    Certificate
Teacher's register      →    Session feedback & ratings
```

### Step-by-Step Internal Logic

**Step 1: User Registration**
```
User fills form → Password encrypted with bcrypt
→ Stored in `users` table → Profile created in `profiles` table
→ JWT token generated → User logged in
```

**Step 2: Course Enrollment Logic**
```
Student clicks Enroll
→ Check: already enrolled? (UNIQUE constraint prevents duplicate)
→ INSERT into course_enrollments
→ AUTO: fetch course.created_by (mentor ID)
→ AUTO: INSERT into session_requests with status='approved'
→ AUTO: generate video_room_id = 'room_c{courseId}_s{studentId}_{timestamp}'
→ Both student and mentor see session in dashboard
```

**Step 3: Live Session Logic**
```
Both open same room URL
→ Socket.IO: both join 'session-room_xxx'
→ Server emits 'peer-joined' when student arrives
→ Mentor's browser: creates WebRTC offer
→ Student's browser: receives offer, creates answer
→ ICE candidates exchanged (network path finding)
→ Direct peer-to-peer video/audio established
→ Chat messages broadcast via Socket.IO
→ Whiteboard strokes broadcast and saved to DB
```

**Step 4: Quiz Scoring Logic**
```
Student submits answers (JSON: {question_id: selected_option_id})
→ For each question: fetch correct option from quiz_options
→ Compare: if user's answer == correct option → add marks
→ Calculate: percentage = (score / total) * 100
→ If percentage >= 60:
    Generate share_token (UUID)
    INSERT into certificates
    Return: {passed: true, certificateUrl: '/certificate/abc123'}
→ If percentage < 60:
    Return: {passed: false, message: 'Try again'}
```

**Step 5: Rating & Credits Logic**
```
Student ends call → Rating modal appears
→ Student submits 1-5 stars
→ INSERT into session_feedback
→ UPDATE mentor's rating = AVG(all ratings for that mentor)
→ UPDATE student: credits += 10, contribution_score += 5
→ UPDATE mentor: credits += 20, contribution_score += 10
```

---

## 🏗️ 4. Technologies Used

### Frontend Technologies

#### ⚛️ React 18
- **What it is:** JavaScript library for building user interfaces
- **Why used:** Component-based — each part of UI (dashboard, quiz, video room) is a separate reusable component
- **Where in LMS:** Every page — StudentDashboard, MentorDashboard, VideoRoom, Challenges, etc.
- **Example:** The mentor card in Find Mentor page is a React component that receives mentor data as props and renders it

#### 📘 TypeScript
- **What it is:** JavaScript with type safety
- **Why used:** Catches bugs before runtime — if API returns `{user: {...}}` but code expects `user.name`, TypeScript warns immediately
- **Where in LMS:** All `.tsx` files — defines interfaces like `Session`, `Certificate`, `Mentor`
- **Example:**
```typescript
interface Session {
  id: string;
  mentor_id: string;
  status: 'pending' | 'approved' | 'completed';
}
```

#### ⚡ Vite
- **What it is:** Modern build tool and development server
- **Why used:** 10x faster than Webpack — instant hot reload when you save a file
- **Where in LMS:** Runs the frontend dev server (`npm run dev`)
- **Example:** When you edit `StudentDashboard.tsx`, the browser updates in milliseconds

#### 🎨 TailwindCSS
- **What it is:** Utility-first CSS framework
- **Why used:** Write styles directly in HTML/JSX without separate CSS files
- **Where in LMS:** All component styling — `className="bg-green-600 text-white rounded-lg p-4"`
- **Example:** `<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Enroll Now</Button>`

#### 🧩 shadcn/ui + Radix UI
- **What it is:** Pre-built accessible UI components
- **Why used:** Professional-looking components (cards, dialogs, badges) without building from scratch
- **Where in LMS:** Card (mentor cards), Badge (subject tags), Dialog (quiz modal), Button (everywhere)

#### 🔄 TanStack React Query
- **What it is:** Data fetching and caching library
- **Why used:** Handles loading states, caching, and background refresh automatically
- **Where in LMS:** Fetching challenges, sessions, leaderboard data

#### 🔌 Socket.IO Client
- **What it is:** WebSocket client for real-time communication
- **Why used:** HTTP is request-response only — Socket.IO allows server to push data to client instantly
- **Where in LMS:** Video call signaling, live chat, whiteboard sync
- **Example:** When mentor draws on whiteboard, stroke data is emitted via socket and received by student instantly

---

### Backend Technologies

#### 🟢 Node.js
- **What it is:** JavaScript runtime — runs JS outside the browser
- **Why used:** Same language as frontend (JavaScript), non-blocking I/O perfect for real-time apps
- **Where in LMS:** Runs the entire backend server

#### 🚂 Express.js
- **What it is:** Web framework for Node.js
- **Why used:** Simple routing, middleware support, easy REST API creation
- **Where in LMS:** All API routes — `/api/auth`, `/api/courses`, `/api/sessions`, etc.
- **Example:**
```javascript
router.post('/courses', authenticateToken, authorizeRole(['mentor']), async (req, res) => {
  const result = await executeQuery('INSERT INTO courses...', [...]);
  res.status(201).json({ course: result });
});
```

#### 🔐 JWT (JSON Web Token)
- **What it is:** Compact token for authentication
- **Why used:** Stateless — server doesn't need to store sessions; token contains user info
- **Where in LMS:** Every protected API call sends `Authorization: Bearer <token>`
- **How it works:**
```
Login → jwt.sign({userId: 13}, SECRET, {expiresIn: '7d'})
→ Token: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEzfQ.xxx
→ Every request: verify token → extract userId → find user in DB
```

#### 🔒 bcrypt
- **What it is:** Password hashing library
- **Why used:** Passwords must NEVER be stored as plain text
- **Where in LMS:** Registration (hash) and Login (compare)
- **Example:**
```javascript
// Registration
const hash = await bcrypt.hash('Student@123', 10); // 10 = salt rounds
// Login
const isValid = await bcrypt.compare('Student@123', hash); // true/false
```

#### 🛡️ Helmet.js
- **What it is:** Security middleware for Express
- **Why used:** Sets HTTP headers to prevent XSS, clickjacking, MIME sniffing
- **Where in LMS:** Applied globally to all API responses

#### ⚡ Socket.IO (Server)
- **What it is:** Real-time bidirectional event-based communication
- **Why used:** WebRTC needs a signaling server to exchange connection info
- **Where in LMS:** Video call signaling, chat, whiteboard
- **Events used:**
  - `join-session` → user joins a room
  - `peer-joined` → notify mentor when student arrives
  - `signal` → WebRTC offer/answer/ICE
  - `chat-message` → broadcast chat
  - `whiteboard-stroke` → broadcast drawing

---

### Database Technology

#### 🗄️ MySQL 8.0
- **What it is:** Relational Database Management System (RDBMS)
- **Why used:** Structured data with relationships — perfect for LMS where users, courses, sessions are all related
- **Where in LMS:** Stores all data — 25 tables in `lms_db`
- **Why MySQL over MongoDB:**
  - Our data is highly relational (user → profile → sessions → feedback)
  - We need ACID transactions (enrollment + session creation must both succeed or both fail)
  - SQL JOINs are perfect for complex queries like "get mentor with subjects and availability"
  - MongoDB is better for unstructured/document data — our data is structured

#### 🔗 mysql2 (Node.js Driver)
- **What it is:** MySQL driver for Node.js
- **Why used:** Promise-based, supports prepared statements (prevents SQL injection)
- **Where in LMS:** All database queries
- **Example:**
```javascript
const result = await executeQuery(
  'SELECT * FROM users WHERE email = ?',  // ? = prepared statement
  [email]  // value injected safely
);
```

---

### External APIs

#### 🤖 Google Gemini API
- **What it is:** Google's AI language model
- **Why used:** Powers the StudyBot assistant on every dashboard
- **Where in LMS:** `/api/ai-chat` route
- **Model:** `gemini-1.5-flash` (fast, free tier available)

#### 📹 WebRTC (Browser API)
- **What it is:** Browser built-in peer-to-peer video/audio API
- **Why used:** No server needed for video — direct browser-to-browser connection
- **Where in LMS:** VideoRoom.tsx — `RTCPeerConnection`, `getUserMedia`

---

## 🗄️ 5. Database Understanding

### Real-Life Analogy
Think of the database like a **school office with filing cabinets:**

```
Filing Cabinet          →    Database Table
─────────────────────────────────────────────
Student register        →    users table
Student profile cards   →    profiles table
Course catalog          →    courses table
Admission forms         →    course_enrollments table
Class schedule          →    session_requests table
Homework records        →    assignments + submissions
Exam answer sheets      →    quiz_attempts table
Certificates issued     →    certificates table
Teacher feedback forms  →    session_feedback table
```

### How Data is Stored and Retrieved

**Storing (INSERT):**
```sql
-- When student enrolls
INSERT INTO course_enrollments (user_id, course_id, status, enrolled_at)
VALUES (13, 6, 'active', NOW());
```

**Retrieving (SELECT with JOIN):**
```sql
-- Get student's enrolled courses with mentor name
SELECT c.title, c.domain, u.full_name as mentor_name
FROM courses c
JOIN course_enrollments ce ON c.id = ce.course_id
JOIN users u ON c.created_by = u.id
WHERE ce.user_id = 13;
```

**Updating:**
```sql
-- Update mentor rating after feedback
UPDATE profiles
SET rating = (SELECT AVG(rating) FROM session_feedback WHERE mentor_id = 31)
WHERE user_id = 31;
```

**Deleting (with CASCADE):**
```sql
-- Delete user → automatically deletes profile (ON DELETE CASCADE)
DELETE FROM users WHERE id = 13;
-- profiles row for user_id=13 is automatically deleted
```

---

## 🔄 6. End-to-End Working Example (Story Format)

**"Sumeet wants to learn DSA from Neha"**

**Morning 9 AM — Sumeet registers:**
> Sumeet opens the app, goes to Student Login, fills his name, email, and password. The system hashes his password with bcrypt and stores it. A JWT token is created. Sumeet is now logged in as a student.

**9:05 AM — Sumeet finds Neha:**
> Sumeet opens his dashboard, clicks "Find a Mentor", selects "DSA" subject. The system queries the database — finds Neha who teaches DSA, available Sunday 9-10 AM, rated 4.0 stars. Sumeet sees her card.

**9:10 AM — Sumeet enrolls in Neha's course:**
> Sumeet clicks "Enroll Now" on Neha's "DSA Masterclass" course. The system:
> 1. Inserts a row in `course_enrollments`
> 2. Automatically creates an approved session in `session_requests`
> 3. Generates a video room ID: `room_c6_s13_1234567`
> Both Sumeet and Neha now see this session in their dashboards.

**Sunday 9 AM — Live Class:**
> Sumeet opens his dashboard, sees "Join Live Class (Room: room_c6_s13_1234567)". He clicks it. Neha also clicks it from her mentor dashboard. Their browsers connect via WebRTC — video call starts. Neha draws on the whiteboard, Sumeet asks questions in chat. 60 minutes later, Sumeet clicks "End Call". The session is marked 'completed'. Sumeet rates Neha 5 stars. Neha's rating updates. Both get credits.

**Monday — Assignment:**
> Neha creates an assignment: "Solve 10 array problems" due Tuesday. Sumeet sees it in his course page. He solves the problems, uploads a Google Drive link, submits. Neha reviews and gives 85/100.

**Tuesday — Quiz:**
> Neha creates a 5-question DSA quiz. Sumeet attempts it, scores 40/50 = 80%. Since 80% ≥ 60%, the system automatically generates a certificate: "DSA - Certificate of Completion" with a unique shareable link. Sumeet can share it on LinkedIn!

---

## ⚙️ 7. Key Functionalities

### 1. User Management
- Separate registration for Student and Mentor
- Role-based access control (student can't access mentor pages)
- Profile management (bio, subjects, availability)
- JWT authentication with 7-day token expiry

### 2. Course Management (Mentor)
- Create/Edit/Delete courses with title, domain, description, duration
- View enrolled students count
- Manage assignments per course

### 3. Session Management
- Auto-session creation on enrollment
- Mentor can also manually create sessions for specific students
- Approve/Reject pending requests
- Session status tracking: pending → approved → completed

### 4. Assignment System
- Mentor creates assignments with due dates and total marks
- Student submits via file URL (Google Drive, GitHub)
- Mentor grades with marks and feedback
- Status tracking: submitted → reviewed

### 5. Quiz System
- Mentor creates MCQ quizzes with multiple questions
- Each question has 4 options, one marked correct
- Auto-scoring on submission
- Certificate auto-generated on ≥60%

### 6. Live Video System
- WebRTC peer-to-peer video/audio
- Real-time chat during session
- Collaborative whiteboard with colors and tools
- Session auto-marked completed on end call

### 7. Certificate System
- Auto-generated on quiz pass
- Unique share token for public URL
- Viewable at `/certificate/:shareToken` without login

### 8. Gamification
- Credits earned per session (student: +10, mentor: +20)
- Contribution score for leaderboard
- Achievements page with stats

---

## 🔐 8. Security & Validation

### Login Security
```
1. Email format validated (express-validator)
2. Password minimum 8 characters enforced
3. bcrypt hash comparison (timing-safe, prevents timing attacks)
4. JWT token with expiry (7 days)
5. Token verified on EVERY protected route
6. Role checked before accessing role-specific routes
```

### Data Validation
```javascript
// Backend validation example
body('email').trim().isEmail().withMessage('Valid email required')
body('password').isLength({min: 8}).withMessage('Min 8 characters')
body('rating').isInt({min: 1, max: 5}).withMessage('Rating must be 1-5')
```

### Preventing Wrong Inputs
- `UNIQUE` constraint on `users.email` — no duplicate accounts
- `UNIQUE` on `course_enrollments(user_id, course_id)` — can't enroll twice
- `CHECK` on `session_feedback.rating` — only 1-5 allowed
- `NOT NULL` on required fields — can't submit empty data
- Prepared statements — `?` placeholders prevent SQL injection
- Rate limiting — 500 requests per 15 minutes per IP

---

## 📊 9. Why These Technologies Were Chosen

### MySQL vs MongoDB
| Feature | MySQL (Our Choice) | MongoDB |
|---|---|---|
| Data structure | Structured, relational | Unstructured, document |
| Relationships | Perfect with JOINs | Complex with lookups |
| ACID transactions | Built-in | Limited |
| Our data | Users, courses, sessions are related | Not document-based |
| **Verdict** | ✅ Better for LMS | ❌ Not ideal |

### React vs Angular vs Vue
| Feature | React (Our Choice) | Angular | Vue |
|---|---|---|---|
| Learning curve | Medium | High | Low |
| Ecosystem | Huge | Large | Medium |
| Performance | Excellent | Good | Good |
| TypeScript | Optional | Built-in | Optional |
| **Verdict** | ✅ Best balance | Too complex | Smaller community |

### Node.js vs PHP vs Java
| Feature | Node.js (Our Choice) | PHP | Java |
|---|---|---|---|
| Language | JavaScript (same as frontend) | PHP | Java |
| Real-time | Excellent (Socket.IO) | Poor | Good |
| Speed | Fast (non-blocking) | Slower | Fast |
| Setup | Simple | Simple | Complex |
| **Verdict** | ✅ Best for real-time LMS | ❌ No real-time | ❌ Too heavy |

### JWT vs Session-Based Auth
| Feature | JWT (Our Choice) | Sessions |
|---|---|---|
| Storage | Client (localStorage) | Server (memory/DB) |
| Scalability | Stateless, scales easily | Needs shared session store |
| Mobile-friendly | Yes | Harder |
| **Verdict** | ✅ Better for REST APIs | ❌ Server overhead |

---

## 🚀 10. What Makes My Project Unique

### 1. Fully Automated Learning Flow
Most LMS platforms require manual session booking. Ours auto-creates an approved session the moment a student enrolls — zero friction.

### 2. Real-Time Peer-to-Peer Video
No third-party video service (Zoom, Meet). Built directly with WebRTC — free, private, browser-native.

### 3. Collaborative Whiteboard
Mentor can draw diagrams, write code, explain concepts visually — all synced in real-time to student's screen.

### 4. Auto Certificate Generation
No manual certificate creation. Pass the quiz → certificate instantly available with a shareable public link.

### 5. AI Study Assistant
Google Gemini AI chatbot on every dashboard — students can ask study questions anytime.

### 6. Separate Role Portals
Student and Mentor have completely different UIs, dashboards, and features. No confusion, no overlap.

### 7. Subject-Based Discovery
Students don't just browse mentors — they select a subject and instantly see mentors who teach it with their availability slots.

---

## 📚 11. What I Learned from This Project

### Technical Skills
1. **Full-Stack Development** — Built complete frontend + backend + database
2. **Database Design** — Designed 25 tables with proper normalization (1NF, 2NF, 3NF)
3. **Real-Time Systems** — WebRTC + Socket.IO for live video and chat
4. **Authentication** — JWT + bcrypt industry-standard security
5. **REST API Design** — Proper HTTP methods, status codes, middleware
6. **SQL Mastery** — Complex JOINs, transactions, aggregations, constraints

### DBMS Concepts Applied
- **Normalization** — Extracted subjects to junction tables (1NF)
- **Foreign Keys** — Referential integrity across all tables
- **Transactions** — Enrollment + session creation as atomic operation
- **Indexes** — On frequently queried columns (user_id, status, mentor_id)
- **Constraints** — UNIQUE, NOT NULL, CHECK, DEFAULT, CASCADE

### Problem-Solving
- Solved WebRTC timing issues with signal queuing
- Fixed rate limiting with localStorage caching
- Resolved duplicate key issues with deduplication
- Handled type mismatches between frontend (string) and backend (number)

---

## ❓ 12. Viva/Interview Questions & Answers

**Q1: What is your project about?**
> "I built a Learning Management System — a web platform where students find mentors by subject, enroll in courses, attend live video classes, submit assignments, take quizzes, and earn certificates. It automates the entire learning flow."

**Q2: What database did you use and why?**
> "MySQL 8.0. I chose it because our data is highly relational — users, courses, sessions, and feedback are all connected. MySQL's ACID transactions ensure data consistency, and SQL JOINs make complex queries easy. MongoDB would be better for unstructured data, but our data is structured."

**Q3: How many tables does your database have?**
> "25 tables in the `lms_db` database. Key tables include users, profiles, courses, course_enrollments, session_requests, assignments, assignment_submissions, challenges, quiz_questions, quiz_options, quiz_attempts, and certificates."

**Q4: What is normalization? How did you apply it?**
> "Normalization eliminates data redundancy. I applied:
> - 1NF: Subjects stored in a separate `profile_subjects` table, not as comma-separated strings
> - 2NF: `assignment_submissions` depends on the full composite key (assignment_id + user_id)
> - 3NF: `subjects` is a lookup table — subject names don't transitively depend on user_id"

**Q5: What is a foreign key? Give an example from your project.**
> "`profiles.user_id` is a foreign key referencing `users.id`. This means every profile must belong to a valid user. With `ON DELETE CASCADE`, if a user is deleted, their profile is automatically deleted too — maintaining referential integrity."

**Q6: How does authentication work in your project?**
> "User logs in → password verified with bcrypt (timing-safe comparison) → JWT token generated with 7-day expiry → stored in browser localStorage → every API request sends `Authorization: Bearer <token>` → `authenticateToken` middleware verifies the token on every protected route."

**Q7: How do you prevent SQL injection?**
> "We use mysql2 prepared statements with `?` placeholders. User input is never concatenated directly into SQL strings. Example: `SELECT * FROM users WHERE email = ?` with `[email]` as parameter — the driver handles escaping."

**Q8: What is a transaction? Where did you use it?**
> "A transaction is a group of SQL operations that either all succeed or all fail (ACID). I used it when a student enrolls — both the `course_enrollments` INSERT and the `session_requests` INSERT must succeed together. If one fails, both are rolled back."

**Q9: What is the difference between INNER JOIN and LEFT JOIN?**
> "INNER JOIN returns only rows where both tables have matching data. LEFT JOIN returns all rows from the left table even if there's no match in the right table. Example: I use LEFT JOIN for sessions with subjects — a session might not have a subject, but I still want to show it."

**Q10: How is the certificate generated?**
> "When a student submits a quiz, the system calculates `(score/total)*100`. If ≥60%, it generates a UUID as `share_token` and inserts a row into the `certificates` table. The certificate is accessible at `/certificate/:shareToken` without login."

**Q11: What is WebRTC? How did you implement it?**
> "WebRTC is a browser API for peer-to-peer video/audio. Implementation: Mentor creates an RTCPeerConnection offer → sends via Socket.IO → Student receives offer, creates answer → ICE candidates exchanged → direct video connection established. Socket.IO acts as the signaling server."

**Q12: What is the difference between student and mentor roles?**
> "Both are stored in the `users` table with a `role` column (ENUM: student/mentor/admin). They have separate login portals, separate dashboards, and separate features. A `RequireRole` component in React redirects users to their correct dashboard if they try to access the wrong one."

**Q13: What constraints did you use in your database?**
> "PRIMARY KEY (unique identifier), FOREIGN KEY (referential integrity), UNIQUE (users.email, enrollment per student per course), NOT NULL (required fields), CHECK (rating 1-5), DEFAULT (credits=0), ON DELETE CASCADE (auto-delete child records)."

**Q14: What is bcrypt and why is it used?**
> "bcrypt is a password hashing algorithm. Passwords are never stored in plain text. bcrypt applies 10 salt rounds — even if the database is hacked, passwords cannot be reversed. It's also timing-safe, preventing timing attacks."

**Q15: What challenges did you face?**
> "Three main challenges:
> 1. WebRTC timing — offer sent before student joined. Solved with signal queuing.
> 2. Rate limiting — too many API calls caused 429 errors. Solved with localStorage caching.
> 3. Normalization — subjects stored as JSON violated 1NF. Solved by creating `profile_subjects` junction table."

---

## 🗺️ Quick Summary Card (For Last-Minute Revision)

```
PROJECT:    Learning Management System (LMS)
DATABASE:   MySQL 8.0 | lms_db | 25 tables
BACKEND:    Node.js + Express.js + Socket.IO
FRONTEND:   React 18 + TypeScript + TailwindCSS
AUTH:       JWT + bcrypt
REAL-TIME:  WebRTC (video) + Socket.IO (chat/whiteboard)
AI:         Google Gemini API (chatbot)
NORMAL:     3NF (1NF + 2NF + 3NF)
ROLES:      Student | Mentor | Admin
FLOW:       Enroll → Session → Assignment → Quiz → Certificate
KEY SQL:    JOIN, GROUP BY, GROUP_CONCAT, AVG, COUNT, TRANSACTION
SECURITY:   bcrypt, JWT, helmet, rate-limit, prepared statements
```
