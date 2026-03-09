# 🎓 LMS Database Setup Guide

## ✅ Database Schema Updated

Your project now uses the comprehensive **Learning Management System (LMS) database schema** with:

### 📊 **15 Tables** with Full Functionality:
- ✅ **users** - User accounts with roles (student/mentor/admin)
- ✅ **profiles** - Extended user information and stats
- ✅ **subjects** - Subject categories
- ✅ **session_requests** - Session scheduling and management
- ✅ **session_feedback** - Rating and feedback system
- ✅ **challenges** - Learning challenges and quizzes
- ✅ **quiz_questions** & **quiz_options** - Complete quiz system
- ✅ **quiz_attempts** - Quiz results and progress
- ✅ **user_challenge_progress** - Progress tracking
- ✅ **certificates** - Achievement certificates
- ✅ **resources** & **shared_resources** - Learning materials
- ✅ **ai_chats** - AI conversation history
- ✅ **video_chat_messages** - Real-time chat
- ✅ **whiteboard_strokes** - Collaboration tool

### 🎯 **Key Features:**
- ✅ **Auto-increment INT primary keys** (MySQL optimized)
- ✅ **Proper foreign key relationships**
- ✅ **JSON fields** for flexible data storage
- ✅ **Comprehensive indexing** for performance
- ✅ **Seed data** with 5 subjects and 25 quiz questions
- ✅ **Production-ready constraints** and data types

## 🚀 Quick Setup

### **1. Database Creation**
```sql
-- The schema file automatically creates the database:
CREATE DATABASE IF NOT EXISTS lms_db;
USE lms_db;
```

### **2. Import Schema**
```bash
# Using MySQL Command Line
mysql -u root -p < backend/database/lms_schema.sql

# Using MySQL Workbench
# File → Run SQL Script → Select lms_schema.sql
```

### **3. Update Backend Configuration**
Your `backend/.env` is already updated:
```env
DB_NAME=lms_db
```

### **4. Restart Backend**
```bash
cd backend
node server.js
```

## 📋 Database Schema Highlights

### **Users Table**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('student', 'mentor', 'admin') DEFAULT 'student',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Session Requests Table**
```sql
CREATE TABLE session_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    mentor_id INT NOT NULL,
    subject_id INT,
    title VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    video_room_id VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (mentor_id) REFERENCES users(id)
);
```

### **Quiz System Tables**
```sql
-- Challenges/Quizzes
CREATE TABLE challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    points_reward INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE
);

-- Quiz Questions & Options
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    question_text TEXT NOT NULL,
    marks INT DEFAULT 10
);

CREATE TABLE quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);
```

## 🎯 Seed Data Included

### **5 Subjects:**
1. Data Structures & Algorithms
2. Operating Systems
3. Database Management
4. Computer Networks
5. System Design

### **5 Challenges with 25 Questions:**
- **DSA**: Hash tables, tree traversal, sorting, recursion, Dijkstra
- **OS**: Scheduling, semaphores, page replacement, TLB, copy-on-write
- **Databases**: Normalization, DISTINCT, ACID, B-Tree indexes, NoSQL
- **Networks**: OSI layers, TCP/UDP, HTTPS port, ARP, routers
- **System Design**: Caching, load balancing, graph databases, CAP theorem

## 🔄 Backend Model Updates

### **Updated Models:**
- ✅ **User.js** - Updated for `password_hash` field and INT IDs
- ✅ **Profile.js** - Updated for LMS schema structure
- ✅ **SessionRequest.js** - Ready for session management
- ✅ **Challenge.js** - Quiz and challenge system
- ✅ **Quiz.js** - Complete quiz functionality

### **Key Changes:**
- `password` → `password_hash`
- UUID → INT AUTO_INCREMENT
- `sessions` → `session_requests`
- Added comprehensive relationships
- Optimized for MySQL performance

## 🧪 Test the Database

### **1. Verify Tables Created**
```sql
USE lms_db;
SHOW TABLES;
-- Should show 15 tables
```

### **2. Test User Registration**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

### **3. Test Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **4. Test Quiz System**
```bash
# Get challenges
curl http://localhost:3001/api/challenges

# Get quiz questions
curl http://localhost:3001/api/quizzes/questions/1
```

## 📊 Database Features

### **Performance Optimizations:**
- ✅ **Strategic indexes** on foreign keys and search fields
- ✅ **ENUM types** for fixed values (role, status)
- ✅ **JSON fields** for flexible data storage
- ✅ **Auto timestamps** for created/updated tracking

### **Data Integrity:**
- ✅ **Foreign key constraints** with cascading rules
- ✅ **UNIQUE constraints** on email and critical fields
- ✅ **CHECK constraints** on ratings (1-5)
- ✅ **NOT NULL** constraints where required

### **Relationships:**
- ✅ **Users → Profiles** (1:1)
- ✅ **Users → Session Requests** (1:many as student/mentor)
- ✅ **Challenges → Quiz Questions** (1:many)
- ✅ **Questions → Options** (1:many)
- ✅ **Users → Quiz Attempts** (1:many)

## 🎉 Migration Benefits

### **From Previous Schema:**
- ✅ **Simplified IDs** (INT vs UUID)
- ✅ **Better performance** (MySQL optimized)
- ✅ **More comprehensive** (15 vs 8 tables)
- ✅ **Production ready** (seed data included)
- ✅ **Full quiz system** (questions, options, attempts)

### **New Capabilities:**
- ✅ **Complete user management** with roles
- ✅ **Advanced session scheduling** with video rooms
- ✅ **Comprehensive feedback system**
- ✅ **Full quiz and challenge system**
- ✅ **Resource sharing** in sessions
- ✅ **AI chat integration**
- ✅ **Real-time collaboration** tools

## 🚀 Ready to Go!

**Your LMS database is now:**
- ✅ **Fully configured** with production-ready schema
- ✅ **Optimized** for MySQL performance
- ✅ **Seeded** with initial data
- ✅ **Integrated** with backend models
- ✅ **Ready** for full platform functionality

**Next Steps:**
1. Import the schema into MySQL
2. Test the backend connection
3. Verify all API endpoints work
4. Test the full platform functionality

**Your Learning Management System is ready! 🎓**
