# Tech Stack — Learning Management System

## Frontend

| Technology | Used For | Why |
|---|---|---|
| **React 18** | UI building | Component-based architecture, fast re-renders with concurrent mode |
| **TypeScript** | Type safety across frontend | Catches bugs at compile time, better IDE support |
| **Vite** | Dev server & bundler | Extremely fast HMR, faster than CRA/Webpack |
| **React Router v6** | Client-side routing | Declarative routing, nested routes, role-based navigation |
| **TailwindCSS** | Styling | Utility-first, no CSS files needed, rapid UI development |
| **shadcn/ui** | UI component library | Pre-built accessible components built on Radix UI |
| **Radix UI** | Headless UI primitives | Accessible, unstyled components (dialogs, dropdowns, etc.) |
| **TanStack Query** | Server state management | Caching, background refetching, loading/error states |
| **React Hook Form** | Form handling | Minimal re-renders, easy validation integration |
| **Zod** | Schema validation | Type-safe form and API response validation |
| **Socket.io-client** | Real-time communication | Live class signaling, chat, whiteboard sync |
| **WebRTC** | Peer-to-peer video | Browser-native video/audio streaming for live classes |
| **Recharts** | Data visualization | Dashboard charts for sessions, progress, leaderboard |
| **Lucide React** | Icons | Consistent, lightweight SVG icon set |
| **Sonner** | Toast notifications | Lightweight, beautiful toast alerts |
| **date-fns** | Date formatting | Lightweight alternative to moment.js |

---

## Backend

| Technology | Used For | Why |
|---|---|---|
| **Node.js** | Runtime environment | Non-blocking I/O, same language as frontend |
| **Express.js** | HTTP server & REST API | Minimal, flexible, huge ecosystem |
| **Socket.io** | WebSocket server | Real-time events — live class signaling, chat, whiteboard |
| **MySQL2** | Database driver | Fast MySQL queries with promise support and connection pooling |
| **bcrypt** | Password hashing | Industry-standard one-way hashing, salted by default |
| **JWT (jsonwebtoken)** | Authentication tokens | Stateless auth, no session storage needed on server |
| **express-validator** | Request validation | Validates and sanitizes incoming API request data |
| **helmet** | HTTP security headers | Protects against common web vulnerabilities (XSS, clickjacking) |
| **cors** | Cross-origin requests | Allows frontend (port 5173) to call backend (port 3001) |
| **express-rate-limit** | Rate limiting | Prevents brute-force attacks on auth endpoints |
| **morgan** | HTTP request logging | Logs every request for debugging |
| **multer** | File uploads | Handles assignment/resource file uploads |
| **uuid** | Unique ID generation | Generates video room IDs for live sessions |
| **dotenv** | Environment variables | Keeps secrets (DB password, JWT key) out of source code |
| **nodemon** | Dev auto-restart | Restarts server automatically on file changes |

---

## Database

| Technology | Used For | Why |
|---|---|---|
| **MySQL 8.0** | Primary database | Relational data (users, sessions, courses), ACID compliance, strong joins |

---

## Real-time & Video

| Technology | Used For | Why |
|---|---|---|
| **WebRTC** | Video/audio streaming | Peer-to-peer, no media server needed, browser-native |
| **STUN servers (Google)** | NAT traversal | Helps peers discover their public IP for direct connection |
| **TURN server (OpenRelay)** | Relay fallback | When direct P2P fails (strict firewalls), traffic relays through server |
| **Socket.io** | WebRTC signaling | Exchanges offer/answer/ICE candidates between peers to establish connection |

---

## Dev Tools

| Technology | Used For | Why |
|---|---|---|
| **ESLint** | Code linting | Enforces code quality and catches common mistakes |
| **PostCSS** | CSS processing | Required by Tailwind for utility class generation |
| **Autoprefixer** | CSS vendor prefixes | Adds `-webkit-`, `-moz-` prefixes automatically |
