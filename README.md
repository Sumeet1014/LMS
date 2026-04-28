# Learning Management System (LMS)

A full-stack Learning Management System built with React, Node.js, and MySQL.

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS + shadcn-ui
- Socket.io (real-time chat & video signaling)

**Backend**
- Node.js + Express
- MySQL
- JWT Authentication
- Google OAuth
- Gemini AI integration

## Getting Started

### Prerequisites
- Node.js & npm
- MySQL

### Installation

```sh
# Clone the repo
git clone https://github.com/Sumeet1014/LMS.git
cd LMS

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Configuration

Create `.env` in root and `backend/.env` with your own credentials (see `.env.example` for reference).

### Run

```sh
# Start backend
cd backend
npm run dev

# Start frontend (in root)
npm run dev
```

## Features

- Student & Mentor dashboards
- Session booking & management
- Real-time chat & video calls
- AI chatbot assistant
- Quizzes, challenges & leaderboard
- Badge & certificate system
- Google OAuth login
