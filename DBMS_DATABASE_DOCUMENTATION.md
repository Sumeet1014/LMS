# LMS Database Documentation
## Learning Management System — lms_db

---

## Overview

The LMS database is built on **MySQL** and contains **25 tables** organized into 6 functional groups:

1. User & Identity Management
2. Course & Enrollment Management
3. Session & Mentoring
4. Quiz & Challenge System
5. Certificates & Rewards
6. Supporting / Real-time Features

The database follows **3rd Normal Form (3NF)** normalization to eliminate redundancy, ensure data integrity, and make queries efficient.

---

## Normalization — Why We Did It

### What is Normalization?
Normalization is the process of organizing a database to reduce data redundancy and improve data integrity by dividing large tables into smaller related tables.

### 1NF — First Normal Form
**Rule:** Every column must have atomic (single) values. No repeating groups.

**Applied in our DB:**
- `subjects` (JSON) in `profiles` was separated into `profile_subjects` table — each subject is a separate row, not a comma-separated list.
- `availability` (JSON) in `profiles` was separated into `profile_availability` table — each day/time slot is a separate row.
- `quiz_options` is a separate table instead of storing options as a comma list inside `quiz_questions`.

### 2NF — Second Normal Form
**Rule:** Must be in 1NF + every non-key column must depend on the WHOLE primary key (no partial dependency).

**Applied in our DB:**
- `course_enrollments` — instead of storing `course_title`, `user_name` inside the enrollment, we only store `user_id` and `course_id` as foreign keys. The title/name comes from their own tables.
- `assignment_submissions` — stores only `assignment_id` and `user_id`, not the assignment title or user name again.
- `session_requests` — stores `student_id` and `mentor_id` as FKs, not their names/emails.

### 3NF — Third Normal Form
**Rule:** Must be in 2NF + no transitive dependencies (non-key column depending on another non-key column).

**Applied in our DB:**
- `profiles` is separate from `users` — bio, rating, credits depend on the profile, not directly on the user's email/password.
- `mentor_profiles` is separate from `profiles` — mentor-specific data (expertise_level, hourly_rate) depends on the mentor role, not on general profile data.
- `subjects` is a separate lookup table — subject name/description is stored once, referenced by ID everywhere else.
- `certificates` stores `challenge_id` as FK — score and title are certificate-specific, not repeated from challenges.

---

## Table-by-Table Explanation

---

### 1. `users`
**Purpose:** Core authentication table. Every person using the system is stored here.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Unique user identifier |
| email | VARCHAR UNIQUE | Login email |
| password_hash | VARCHAR | Bcrypt hashed password (never plain text) |
| full_name | VARCHAR | User's full name |
| username | VARCHAR | Display username |
| role | ENUM | student / mentor / admin |
| email_verified | BOOLEAN | Whether email is confirmed |
| created_at | TIMESTAMP | Account creation time |

**Why separate from profiles?**
Authentication data (email, password) and profile data (bio, rating) serve different purposes. Separating them follows the Single Responsibility Principle and 3NF — profile attributes depend on the profile entity, not on login credentials.

---

### 2. `profiles`
**Purpose:** Extended user information beyond authentication.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Profile ID |
| user_id | INT FK UNIQUE | Links to users (1:1) |
| bio | TEXT | About the user |
| is_mentor | BOOLEAN | Whether user is a mentor |
| rating | DECIMAL(3,2) | Average rating (0.00–5.00) |
| credits | INT | Reward credits earned |
| contribution_score | INT | Activity score |
| total_sessions_attended | INT | Sessions as student |
| total_sessions_taught | INT | Sessions as mentor |

**Normalization:** `subjects` and `availability` JSON columns were extracted into `profile_subjects` and `profile_availability` tables to achieve 1NF.

---

### 3. `profile_subjects`
**Purpose:** Stores subjects a user/mentor teaches or is interested in. Extracted from JSON to achieve 1NF.

| Column | Type | Description |
|---|---|---|
| profile_id | INT FK | Links to profiles |
| subject_id | INT FK | Links to subjects |

**Why separate?** Storing subjects as `"Math,Science,CS"` in one column violates 1NF. Each subject gets its own row here.

---

### 4. `profile_availability`
**Purpose:** Stores when a user/mentor is available. Extracted from JSON to achieve 1NF.

| Column | Type | Description |
|---|---|---|
| availability_id | INT PK | Unique ID |
| profile_id | INT FK | Links to profiles |
| day | VARCHAR | e.g., Monday, Tuesday |
| start_time | TIME | Available from |
| end_time | TIME | Available until |

**Why separate?** Storing availability as JSON `{"Mon":"9-5","Tue":"10-4"}` violates 1NF. Each slot is a separate row.

---

### 5. `mentor_profiles`
**Purpose:** Mentor-specific extended data. A user can have multiple mentor profiles for different subjects.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Mentor profile ID |
| user_id | INT FK | Links to users |
| profile_name | VARCHAR | e.g., "John's DSA Mentoring" |
| bio | TEXT | Mentor bio |
| expertise_level | ENUM | beginner/intermediate/advanced/expert |
| hourly_rate | DECIMAL | Rate per session |
| rating | DECIMAL | Mentor-specific rating |
| total_sessions | INT | Total sessions taught |
| is_active | BOOLEAN | Profile active status |

**Why separate from profiles?** Mentor-specific attributes (expertise_level, hourly_rate) are not relevant to students. Keeping them in `profiles` would cause NULL values for all student rows — violating good design principles.

---

### 6. `mentor_subjects`
**Purpose:** Maps which subjects a mentor teaches.

| Column | Type | Description |
|---|---|---|
| mentor_id | INT FK | Links to mentor_profiles |
| subject_id | INT FK | Links to subjects |

**Composite PK** on (mentor_id, subject_id) prevents duplicate entries.

---

### 7. `mentor_availability`
**Purpose:** Stores mentor-specific availability slots.

| Column | Type | Description |
|---|---|---|
| availability_id | INT PK | Unique ID |
| mentor_id | INT FK | Links to mentor_profiles |
| day | VARCHAR | Day of week |
| start_time | TIME | Start of availability |
| end_time | TIME | End of availability |

---

### 8. `subjects`
**Purpose:** Master list of all subjects/topics in the system.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Subject ID |
| name | VARCHAR | Subject name |
| description | TEXT | What the subject covers |

**Why separate?** Without this table, subject names would be repeated in courses, sessions, profiles, and challenges — violating 2NF. One update here fixes it everywhere.

---

### 9. `courses`
**Purpose:** Courses created by mentors that students can enroll in.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Course ID |
| title | VARCHAR | Course title |
| domain | VARCHAR | Subject domain (e.g., Computer Science) |
| description | TEXT | Course details |
| duration | INT | Duration in hours |
| created_by | INT FK | Mentor who created it |
| is_active | BOOLEAN | Whether course is live |

**Relationship:** USER (mentor) 1:M creates COURSES

---

### 10. `course_enrollments`
**Purpose:** Junction table for the M:N relationship between users and courses.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Enrollment ID |
| user_id | INT FK | Student enrolled |
| course_id | INT FK | Course enrolled in |
| enrolled_at | TIMESTAMP | When they enrolled |
| status | ENUM | active / completed / dropped |

**Why separate?** A student can enroll in many courses, and a course can have many students — classic M:N. A junction table is the correct normalized solution.

---

### 11. `assignments`
**Purpose:** Assignments created under a course.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Assignment ID |
| course_id | INT FK | Which course it belongs to |
| title | VARCHAR | Assignment title |
| description | TEXT | What to do |
| due_date | TIMESTAMP | Submission deadline |
| total_marks | INT | Maximum marks |

**Relationship:** COURSE 1:M has ASSIGNMENTS

---

### 12. `assignment_submissions`
**Purpose:** Junction table for students submitting assignments.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Submission ID |
| assignment_id | INT FK | Which assignment |
| user_id | INT FK | Which student |
| submission_date | TIMESTAMP | When submitted |
| file_url | VARCHAR | Uploaded file link |
| pages | INT | Number of pages |
| marks_obtained | INT | Marks given by mentor |
| status | ENUM | submitted / reviewed / late |
| feedback | TEXT | Mentor's feedback |

**Why separate?** M:N between users and assignments. One student submits many assignments, one assignment has many student submissions.

---

### 13. `session_requests`
**Purpose:** Core mentoring session scheduling between student and mentor.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Session ID |
| student_id | INT FK | Requesting student |
| mentor_id | INT FK | Assigned mentor |
| subject_id | INT FK | Topic of session |
| title | VARCHAR | Session title |
| requested_time | TIMESTAMP | When session is scheduled |
| duration | INT | Duration in minutes |
| status | ENUM | pending/approved/rejected/completed/cancelled |
| video_room_id | VARCHAR | Video call room ID |
| rejection_reason | TEXT | Why it was rejected |

**Relationship:** USER M:N SESSION_REQUEST (student requests, mentor responds)

---

### 14. `session_feedback`
**Purpose:** Post-session rating and feedback from student to mentor.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Feedback ID |
| session_id | INT FK | Which session |
| student_id | INT FK | Who gave feedback |
| mentor_id | INT FK | Who received feedback |
| rating | INT | 1–5 star rating |
| feedback_text | TEXT | Written feedback |
| toxicity_score | DECIMAL | AI moderation score |
| toxicity_categories | JSON | Categories of toxic content detected |

**Why toxicity fields?** AI automatically checks feedback for abusive language before saving.

---

### 15. `challenges`
**Purpose:** Quiz challenges that users can attempt to earn points and certificates.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Challenge ID |
| title | VARCHAR | Challenge name |
| subject | VARCHAR | Topic area |
| description | TEXT | What the challenge is about |
| duration | INT | Time limit in minutes |
| points_reward | INT | Points earned on completion |
| is_active | BOOLEAN | Whether challenge is open |
| start_date | TIMESTAMP | When challenge opens |
| end_date | TIMESTAMP | When challenge closes |

---

### 16. `quiz_questions`
**Purpose:** Individual questions inside a challenge.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Question ID |
| challenge_id | INT FK | Which challenge |
| question_text | TEXT | The question |
| marks | INT | Marks for this question |
| question_order | INT | Display order |

**Relationship:** CHALLENGE 1:M contains QUIZ_QUESTIONS

---

### 17. `quiz_options`
**Purpose:** Answer choices for each quiz question.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Option ID |
| question_id | INT FK | Which question |
| option_text | TEXT | The answer choice |
| is_correct | BOOLEAN | Whether this is the right answer |
| option_order | INT | Display order |

**Why separate?** Each question has 4 options. Storing them as `option_a`, `option_b`, `option_c`, `option_d` columns would violate 1NF. Separate rows allow any number of options.

---

### 18. `quiz_attempts`
**Purpose:** Records a user's quiz attempt and score.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Attempt ID |
| user_id | INT FK | Who attempted |
| challenge_id | INT FK | Which challenge |
| score | INT | Marks obtained |
| total | INT | Total possible marks |
| passed | BOOLEAN | Whether they passed |
| answers | JSON | Snapshot of answers given |
| completed_at | TIMESTAMP | When finished |

---

### 19. `user_challenge_progress`
**Purpose:** Tracks ongoing progress of a user toward completing a challenge.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Progress ID |
| user_id | INT FK | Which user |
| challenge_id | INT FK | Which challenge |
| current_value | INT | Progress so far |
| completed | BOOLEAN | Whether completed |

**UNIQUE constraint** on (user_id, challenge_id) — one progress record per user per challenge.

---

### 20. `certificates`
**Purpose:** Certificates issued to users after completing a challenge.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Certificate ID |
| user_id | INT FK | Who earned it |
| challenge_id | INT FK | Which challenge |
| title | VARCHAR | Certificate title |
| score | INT | Score achieved |
| pdf_url | VARCHAR | Downloadable PDF link |
| share_token | VARCHAR UNIQUE | Public sharing token |

**Relationship:** USER 1:M receives CERTIFICATES

---

### 21. `resources`
**Purpose:** Learning materials uploaded by mentors.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Resource ID |
| title | VARCHAR | Resource title |
| content | TEXT | Resource content |
| ai_summary | TEXT | AI-generated summary |
| subject_id | INT FK | Related subject |
| uploaded_by | INT FK | Mentor who uploaded |

---

### 22. `shared_resources`
**Purpose:** Files/links shared within a specific session.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Shared resource ID |
| session_id | INT FK | Which session |
| title | VARCHAR | File title |
| resource_url | VARCHAR | File/link URL |
| resource_type | VARCHAR | Type (pdf, video, link) |
| mime_type | VARCHAR | MIME type |
| file_size | INT | Size in bytes |
| shared_by | INT FK | Who shared it |

---

### 23. `ai_chats`
**Purpose:** Stores full AI chatbot conversation history per user.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Chat ID |
| user_id | INT FK | Who chatted |
| session_id | INT FK | Optional session context |
| user_message | TEXT | What user asked |
| assistant_reply | TEXT | AI response |
| source | VARCHAR | Which AI model (gemini/openai) |

---

### 24. `video_chat_messages`
**Purpose:** Real-time chat messages inside a video call room.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Message ID |
| room_id | VARCHAR | Video room identifier |
| user_id | INT FK | Who sent it |
| message | TEXT | Message content |
| created_at | TIMESTAMP | When sent |

---

### 25. `whiteboard_strokes`
**Purpose:** Stores collaborative whiteboard drawing data per room.

| Column | Type | Description |
|---|---|---|
| id | INT PK | Stroke ID |
| room_id | VARCHAR | Whiteboard room ID |
| user_id | INT FK | Who drew |
| stroke_data | JSON | Drawing coordinates and style |

---

## Relationships Summary

| Relationship | Type | Tables Involved |
|---|---|---|
| User has Profile | 1:1 | users → profiles |
| User creates Course | 1:M | users → courses |
| User enrolls in Course | M:N | users ↔ course_enrollments ↔ courses |
| Course has Assignments | 1:M | courses → assignments |
| User submits Assignment | M:N | users ↔ assignment_submissions ↔ assignments |
| User requests Session | M:N | users ↔ session_requests |
| User attempts Challenge | 1:M | users → quiz_attempts |
| Challenge contains Questions | 1:M | challenges → quiz_questions |
| Question has Options | 1:M | quiz_questions → quiz_options |
| User receives Certificate | 1:M | users → certificates |
| Mentor has Mentor Profile | 1:M | users → mentor_profiles |
| Profile has Subjects | M:N | profiles ↔ profile_subjects ↔ subjects |
| Mentor teaches Subjects | M:N | mentor_profiles ↔ mentor_subjects ↔ subjects |

---

## Common Professor Questions & Answers

**Q: Why did you separate users and profiles?**
A: To follow 3NF. Authentication data (email, password) and profile data (bio, rating, credits) serve different purposes. Mixing them creates unnecessary coupling and violates single responsibility.

**Q: Why is availability a separate table?**
A: Storing availability as JSON or comma-separated values in one column violates 1NF. Each availability slot (day, start_time, end_time) is atomic data and deserves its own row.

**Q: Why use a junction table for enrollments?**
A: Because USER and COURSE have a M:N relationship — one student can enroll in many courses, one course can have many students. A junction table (course_enrollments) is the standard normalized solution.

**Q: What normal form is your database in?**
A: 3NF. All tables have atomic values (1NF), no partial dependencies (2NF), and no transitive dependencies (3NF). For example, `subjects` is a separate table so subject names don't transitively depend on user_id through profile.

**Q: Why store password as password_hash?**
A: Security. Plain text passwords are never stored. We use bcrypt hashing so even if the database is compromised, passwords cannot be recovered.

**Q: What is the purpose of share_token in certificates?**
A: It allows public sharing of certificates via a unique URL without requiring login. The token is randomly generated and unique per certificate.

**Q: Why does session_feedback have toxicity_score?**
A: The system uses AI (Gemini/OpenAI) to automatically moderate feedback text for abusive or toxic content before it is saved, protecting mentors from harassment.

**Q: How does the quiz system work end to end?**
A: challenges → quiz_questions → quiz_options form the quiz structure. When a user takes a quiz, a quiz_attempts record is created with their answers (JSON) and score. On passing, a certificate is generated and linked via challenge_id.
