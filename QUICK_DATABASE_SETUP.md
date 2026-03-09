# 🚀 Quick Database Setup Guide

## 📋 Current Status
- ✅ Backend server is running on port 3001
- ✅ Health endpoint working
- ❌ Database not connected yet
- ❌ Registration failing (needs database)

## 🎯 3 Ways to Set Up MySQL

### Option 1: XAMPP (Easiest - 5 minutes)
1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. **Install XAMPP** (choose default settings)
3. **Start XAMPP Control Panel**
4. **Start MySQL** service
5. **Run setup script**:
   ```cmd
   setup_database.bat
   ```

### Option 2: MySQL Installer (10 minutes)
1. **Download MySQL Installer**: https://dev.mysql.com/downloads/installer/
2. **Install MySQL** (choose "Developer Default")
3. **Set root password** (remember it!)
4. **Update backend/.env** with your password:
   ```env
   DB_PASSWORD=your_root_password
   ```
5. **Import schema**:
   ```cmd
   mysql -u root -p lms_db < backend\database\lms_schema.sql
   ```

### Option 3: Use Existing MySQL (2 minutes)
1. **Open MySQL Command Line** or MySQL Workbench
2. **Create database**:
   ```sql
   CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. **Import schema**:
   ```cmd
   mysql -u root -p lms_db < backend\database\lms_schema.sql
   ```

## 🔧 Quick Commands

### If Using XAMPP (no password):
```cmd
setup_database.bat
```

### If Using MySQL Installer (with password):
```cmd
mysql -u root -p lms_db < backend\database\lms_schema.sql
```

### Manual Setup:
```cmd
# Create database
mysql -u root -p -e "CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p lms_db < backend\database\lms_schema.sql

# Verify setup
mysql -u root -p -e "USE lms_db; SHOW TABLES;"
```

## ✅ Verification Steps

After setup, run this test:

```cmd
node test_lms_api.js
```

**Expected Output:**
```
🧪 Testing LMS API Endpoints...
✅ Health: { status: 'OK' }
✅ Registration Success: { user: 'test@lms.com', token: 'JWT token received' }
✅ Login Success: { user: 'test@lms.com', token: 'JWT token received' }
✅ Current User: { email: 'test@lms.com', role: 'student' }
✅ Subjects: 5 subjects found
✅ Challenges: 5 challenges found
✅ Quiz Questions: 5 questions found
🎉 LMS API Tests Complete!
```

## 🎯 What You Get After Setup

### Database Tables (15 total):
- ✅ **users** - User accounts
- ✅ **profiles** - User profiles and stats
- ✅ **subjects** - 5 subjects (DSA, OS, etc.)
- ✅ **session_requests** - Session scheduling
- ✅ **challenges** - 5 challenges with quizzes
- ✅ **quiz_questions** - 25 quiz questions
- ✅ **quiz_options** - Multiple choice answers
- ✅ **quiz_attempts** - Quiz results
- ✅ **certificates** - Achievement certificates
- ✅ **resources** - Learning materials
- ✅ **ai_chats** - AI conversation history
- ✅ **session_feedback** - Rating system
- ✅ **video_chat_messages** - Real-time chat
- ✅ **whiteboard_strokes** - Collaboration data

### API Endpoints Working:
- ✅ **Authentication** (register, login, profile)
- ✅ **User Management** (get users, profiles)
- ✅ **Session Management** (create, approve, manage)
- ✅ **Quiz System** (get questions, submit attempts)
- ✅ **Challenge System** (get challenges, progress)
- ✅ **Resource Management** (upload, share)
- ✅ **Feedback System** (ratings, reviews)
- ✅ **Real-time Features** (chat, whiteboard)

## 🚀 After Database Setup

1. **Test API**: `node test_lms_api.js`
2. **Start Frontend**: `npm run dev`
3. **Test Full Platform**: Register users, take quizzes, schedule sessions

## 🎉 Success Indicators

✅ Backend starts without database errors
✅ Registration returns user + JWT token
✅ Login works successfully
✅ Quiz questions load (25 questions total)
✅ 5 subjects are available
✅ 5 challenges are ready

**Your LMS platform will be fully functional! 🎓**

## 📞 Need Help?

If you get errors:
1. **"Access denied"** - Update DB_PASSWORD in backend/.env
2. **"Database doesn't exist"** - Run database creation first
3. **"Port already in use"** - Kill processes using port 3001
4. **"Connection refused"** - Make sure MySQL service is running

**Choose one option above and you'll be running in minutes! 🚀**
