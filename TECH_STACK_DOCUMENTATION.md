# LMS — Technology Stack Documentation
## Learning Management System (Peer Pivot Learn)

---

## Project Architecture Overview

```
Frontend (React + Vite)  ←→  Backend (Node.js + Express)  ←→  Database (MySQL)
                                        ↕
                              Socket.IO (Real-time)
                                        ↕
                              Gemini AI API (AI Chat)
```

--- 

## 1. FRONTEND TECHNOLOGIES

---

### React 18
- **What:** JavaScript UI library for building component-based interfaces
- **Why:** Component reusability, fast rendering via Virtual DOM, large ecosystem
- **Used for:** Every page and UI component in the application — Dashboard, Find Mentor, Sessions, Quizzes, Certificates, etc.
- **Version:** 18.3.1

---

### TypeScript
- **What:** Typed superset of JavaScript
- **Why:** Catches bugs at compile time, better IDE support, safer code especially for API responses and form data
- **Used for:** All frontend `.tsx` files — type-safe props, API response types, form validation types
- **Version:** 5.8.3

---

### Vite
- **What:** Modern frontend build tool and dev server
- **Why:** Extremely fast Hot Module Replacement (HMR), faster than Webpack, instant server start
- **Used for:** Running the dev server (`npm run dev`), building for production (`npm run build`)
- **Version:** 5.4.19

---

### React Router DOM
- **What:** Client-side routing library for React
- **Why:** Enables navigation between pages without full page reload (Single Page Application)
- **Used for:** All page navigation — `/login`, `/dashboard`, `/find-mentor`, `/sessions`, `/quizzes`, `/certificates`, `/become-mentor`
- **Version:** 6.30.1

---

### TailwindCSS
- **What:** Utility-first CSS framework
- **Why:** Rapid UI development without writing custom CSS, consistent design system, responsive by default
- **Used for:** All styling across every component and page
- **Version:** 3.4.17

---

### shadcn/ui + Radix UI
- **What:** Accessible, unstyled component library built on Radix UI primitives
- **Why:** Pre-built accessible components (dialogs, dropdowns, tabs, cards) that follow WAI-ARIA standards
- **Used for:**
  - `Card` — Mentor cards, session cards, quiz cards
  - `Dialog` — Quiz modal, rating modal, confirmation dialogs
  - `Badge` — Subject tags, status badges
  - `Button` — All buttons across the app
  - `Tabs` — Dashboard tabs, session tabs
  - `Avatar` — User profile pictures
  - `Select`, `Input`, `Textarea` — All form elements
  - `Toast` / `Sonner` — Success/error notifications

---

### TanStack React Query
- **What:** Server state management and data fetching library
- **Why:** Handles caching, background refetching, loading/error states automatically — no manual `useEffect` for API calls
- **Used for:** Fetching mentors list, sessions, challenges, certificates, leaderboard data
- **Version:** 5.83.0

---

### React Hook Form + Zod
- **What:** Form state management (React Hook Form) + schema validation (Zod)
- **Why:** Performant forms with minimal re-renders, declarative validation rules
- **Used for:** Login form, Register form, Session request form, Feedback form
- **Versions:** react-hook-form 7.61.1, zod 3.25.76

---

### Socket.IO Client
- **What:** WebSocket client library
- **Why:** Enables real-time bidirectional communication between browser and server
- **Used for:**
  - Live session chat messages
  - Whiteboard stroke broadcasting
  - WebRTC signaling for video calls
- **Version:** 4.8.3

---

### Recharts
- **What:** Chart library built on D3 for React
- **Why:** Easy-to-use declarative charts with good TypeScript support
- **Used for:** Dashboard statistics — session counts, quiz scores, contribution score graphs
- **Version:** 2.15.4

---

### Lucide React
- **What:** Icon library with 1000+ SVG icons
- **Why:** Consistent, clean icons that match the design system
- **Used for:** All icons throughout the UI — Clock, Star, User, Book, etc.
- **Version:** 0.462.0

---

### date-fns
- **What:** JavaScript date utility library
- **Why:** Lightweight, modular date formatting and manipulation
- **Used for:** Formatting session dates/times, due dates for assignments, certificate issue dates
- **Version:** 3.6.0

---

## 2. BACKEND TECHNOLOGIES

---

### Node.js
- **What:** JavaScript runtime built on Chrome's V8 engine
- **Why:** Non-blocking I/O, same language as frontend, huge npm ecosystem, great for real-time apps
- **Used for:** Running the entire backend server

---

### Express.js
- **What:** Minimal web framework for Node.js
- **Why:** Simple routing, middleware support, widely used, easy to structure REST APIs
- **Used for:** All REST API routes — auth, users, sessions, quizzes, certificates, AI chat, etc.
- **Version:** 4.18.2
- **API Routes:**
  - `POST /api/auth/register` — User registration
  - `POST /api/auth/login` — User login
  - `GET /api/users/mentors` — Get all mentors
  - `POST /api/sessions` — Create session request
  - `GET /api/challenges` — Get all quizzes
  - `POST /api/ai-chat` — Send message to AI
  - `GET /api/certificates` — Get user certificates
  - And 30+ more routes

---

### Socket.IO (Server)
- **What:** Real-time event-based communication library
- **Why:** WebSockets with automatic fallback, room-based broadcasting, built-in authentication
- **Used for:**
  - `join-session` event — User joins a session room
  - `chat-message` event — Broadcasts chat to session participants
  - `whiteboard-stroke` event — Broadcasts drawing strokes to all in room
  - `whiteboard-clear` event — Clears whiteboard for all participants
  - `signal` event — WebRTC peer-to-peer video call signaling
- **Version:** 4.7.4

---

### MySQL2
- **What:** MySQL database driver for Node.js
- **Why:** Promise-based, faster than the original `mysql` package, supports prepared statements to prevent SQL injection
- **Used for:** All database queries — SELECT, INSERT, UPDATE, DELETE across all 25 tables
- **Version:** 3.6.5

---

### JSON Web Token (JWT)
- **What:** Compact, self-contained token for authentication
- **Why:** Stateless authentication — no session storage needed on server, works well with REST APIs
- **How it works:**
  1. User logs in → server generates JWT signed with `JWT_SECRET`
  2. Frontend stores token in localStorage
  3. Every API request sends `Authorization: Bearer <token>` header
  4. `authenticateToken` middleware verifies token on every protected route
- **Expiry:** 7 days (`JWT_EXPIRES_IN=7d`)
- **Version:** jsonwebtoken 9.0.2

---

### Bcrypt
- **What:** Password hashing library
- **Why:** One-way hashing with salt — even if DB is compromised, passwords cannot be reversed
- **How it works:** `bcrypt.hash(password, 10)` — 10 salt rounds applied before storing
- **Used for:** Hashing passwords on register, comparing on login
- **Version:** 5.1.1

---

### Helmet
- **What:** Express security middleware
- **Why:** Sets HTTP security headers automatically — prevents XSS, clickjacking, MIME sniffing attacks
- **Used for:** Applied globally to all API responses
- **Version:** 7.1.0

---

### Express Rate Limit
- **What:** Rate limiting middleware for Express
- **Why:** Prevents brute force attacks and API abuse
- **Configuration:**
  - General routes: 100 requests per 15 minutes per IP
  - Auth routes (`/api/auth/*`): 50 requests per 15 minutes per IP
- **Version:** 7.1.5

---

### Express Validator
- **What:** Input validation and sanitization middleware
- **Why:** Validates request body before it reaches controllers — prevents bad data entering the DB
- **Used for:** Validating email format, password length, required fields on register/login/become-mentor
- **Version:** 7.0.1

---

### CORS
- **What:** Cross-Origin Resource Sharing middleware
- **Why:** Controls which frontend origins can access the backend API
- **Configuration:** Allows `http://localhost:5173` (Vite dev server) and `http://localhost:8080`
- **Version:** 2.8.5

---

### Morgan
- **What:** HTTP request logger middleware
- **Why:** Logs every incoming request with method, URL, status code, and response time for debugging
- **Used for:** Development logging — you see `GET /api/challenges 200 50ms` in terminal
- **Version:** 1.10.1

---

### Nodemon
- **What:** Development utility that auto-restarts Node.js server on file changes
- **Why:** No need to manually restart server after every code change
- **Used for:** `npm run dev` in backend
- **Version:** 3.0.2

---

### UUID
- **What:** Generates universally unique identifiers
- **Why:** Creates unique IDs for records where auto-increment INT is not used
- **Used for:** Generating IDs for ai_chats, certificates, feedback records
- **Version:** 9.0.1

---

### Axios
- **What:** HTTP client for making API requests
- **Why:** Promise-based, automatic JSON parsing, request/response interceptors
- **Used for:** Backend making outbound HTTP calls (e.g., to AI APIs)
- **Version:** 1.6.2

---

### Multer
- **What:** Middleware for handling multipart/form-data (file uploads)
- **Why:** Handles file upload parsing, stores files to disk or memory
- **Used for:** Uploading assignment files, learning resources
- **Version:** 1.4.5

---

## 3. DATABASE

---

### MySQL 8.0
- **What:** Relational database management system
- **Why:** ACID compliant, strong consistency, perfect for structured LMS data with relationships
- **Database name:** `lms_db`
- **Tables:** 25 tables
- **Tool:** MySQL Workbench for management

---

### Database Connection Pool
- **What:** Pool of reusable database connections
- **Why:** Creating a new DB connection for every request is slow. Pool keeps connections open and reuses them
- **Configuration:** `connectionLimit: 10` — max 10 simultaneous connections
- **File:** `backend/config/db.js`

---

## 4. AI CHAT FEATURE

---

### Google Gemini API
- **What:** Google's large language model API
- **Model used:** `gemini-1.5-flash`
- **Why Gemini:** Free tier available, fast response time, good for educational Q&A
- **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

**How the AI Chat works step by step:**

1. User types a message in the chat widget
2. Frontend sends `POST /api/ai-chat` with `{ message, sessionId, use_ai: true }`
3. Backend checks if `AI_PROVIDER=gemini` and API key is set
4. Backend builds a prompt:
   ```
   System: "You are LMS assistant. Be short, polite and practical..."
   Context: Last 6 session messages (for context awareness)
   User: <user's message>
   ```
5. Sends request to Gemini API with:
   - `temperature: 0.2` — Low randomness, more factual answers
   - `maxOutputTokens: 400` — Keeps responses concise
6. Gemini returns a response
7. Response is saved to `ai_chats` table with `source = 'gemini'`
8. Response sent back to frontend

**Fallback system:** If Gemini API fails or is not configured, the system falls back to local keyword-based responses:
- "hello/hi" → greeting response
- "study/learn" → Pomodoro technique tip
- "mentor/help" → mentor booking suggestion
- "challenge/badge" → gamification info
- etc.

**OpenAI fallback:** The system also supports `AI_PROVIDER=openai` with `gpt-4o-mini` model as an alternative.

---

## 5. REAL-TIME FEATURES (Socket.IO)

---

### Session Chat
- User joins room: `socket.emit('join-session', sessionId)`
- Send message: `socket.emit('chat-message', { sessionId, content })`
- Receive message: `socket.on('chat-message', callback)`
- Messages saved to `session_messages` table

### Collaborative Whiteboard
- Draw stroke: `socket.emit('whiteboard-stroke', { sessionId, strokeData })`
- Receive stroke: `socket.on('whiteboard-stroke', callback)`
- Clear board: `socket.emit('whiteboard-clear', { sessionId })`
- Strokes saved to `whiteboard_strokes` table as JSON

### Video Call (WebRTC)
- Signal exchange: `socket.emit('signal', { sessionId, signalData })`
- Receive signal: `socket.on('signal', callback)`
- Socket.IO acts as the signaling server for WebRTC peer connection setup
- After connection established, video/audio streams directly peer-to-peer

---

## 6. SECURITY IMPLEMENTATION

---

| Security Feature | Technology | Purpose |
|---|---|---|
| Password hashing | bcrypt (10 rounds) | Passwords never stored in plain text |
| Authentication | JWT (7 day expiry) | Stateless, secure API access |
| Authorization | Role-based middleware | Students can't access mentor-only routes |
| Rate limiting | express-rate-limit | Prevents brute force and DDoS |
| HTTP headers | helmet | Prevents XSS, clickjacking |
| Input validation | express-validator | Prevents bad/malicious input |
| SQL injection | mysql2 prepared statements | `?` placeholders, never string concatenation |
| CORS | cors middleware | Only allowed origins can call the API |

---

## 7. ENVIRONMENT CONFIGURATION

---

All sensitive config is stored in `.env` files, never hardcoded:

```env
# Backend (.env)
DB_NAME=lms_db              # MySQL database name
DB_USER=root                # MySQL username
DB_PASSWORD=****            # MySQL password
JWT_SECRET=****             # Secret for signing JWT tokens
AI_PROVIDER=gemini          # Which AI to use: gemini / openai / local
GEMINI_API_KEY=****         # Google Gemini API key
GEMINI_MODEL=gemini-1.5-flash  # Which Gemini model
OPENAI_API_KEY=****         # OpenAI API key (optional)
OPENAI_MODEL=gpt-4o-mini    # OpenAI model (optional)
```

---

## 8. COMPLETE FEATURE → TECHNOLOGY MAPPING

---

| Feature | Frontend | Backend | Database | External API |
|---|---|---|---|---|
| User Registration/Login | React Hook Form + Zod | Express + bcrypt + JWT | `users` table | — |
| Find Mentor | React Query + shadcn Card | Express GET /api/users/mentors | `users`, `profiles`, `profile_subjects`, `profile_availability` | — |
| Become Mentor | React form + time picker | Express POST /api/auth/become-mentor | `profiles`, `profile_subjects`, `profile_availability` | — |
| Session Booking | React Router + Dialog | Express POST /api/sessions | `session_requests` table | — |
| Session Chat | Socket.IO client | Socket.IO server | `session_messages` | — |
| Video Call | WebRTC + Socket.IO | Socket.IO signaling | `video_chat_messages` | — |
| Whiteboard | Canvas + Socket.IO | Socket.IO broadcast | `whiteboard_strokes` | — |
| AI Chat | Chat widget component | Express + fetch | `ai_chats` | Google Gemini API |
| Quizzes | React state + Dialog | Express GET/POST /api/quizzes | `challenges`, `quiz_questions`, `quiz_options`, `quiz_attempts` | — |
| Certificates | React + PDF link | Express GET /api/certificates | `certificates` table | — |
| Session Feedback | Rating modal | Express POST /api/feedback | `session_feedback` | — |
| Courses | React pages | Express /api/courses | `courses`, `course_enrollments` | — |
| Assignments | React form | Express /api/assignments | `assignments`, `assignment_submissions` | — |
| Leaderboard | Recharts | Express GET /api/users/leaderboard | `profiles` contribution_score | — |
| Resources | File upload | Multer + Express | `resources`, `shared_resources` | — |
