# 🔗 MySQL Workbench Setup Guide

## 📋 Your Database Configuration
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Neha@2001
DB_NAME=lms_db
PORT=5000 (Backend)
```

## 🗄️ MySQL Workbench Setup Steps

### **Step 1: Open MySQL Workbench**
- Launch MySQL Workbench from your applications
- Or open from XAMPP Control Panel if using XAMPP

### **Step 2: Create Connection**
1. Click **"+"** to add new connection
2. **Connection Name**: `LMS Database`
3. **Hostname**: `localhost`
4. **Port**: `3306`
5. **Username**: `root`
6. **Password**: Click **"Store in Keychain"** and enter `Neha@2001`
7. Click **"Test Connection"** - should show "Successfully connected"
8. Click **"OK"**

### **Step 3: Connect to Database**
1. Double-click the "LMS Database" connection
2. Enter password: `Neha@2001`
3. You should see the MySQL query editor

### **Step 4: Create LMS Database**
Run this SQL in the query editor:
```sql
CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Click the **lightning bolt** (Execute) to run the query.

### **Step 5: Import Schema**
1. **File** → **Run SQL Script**
2. Navigate to: `backend\database\lms_schema.sql`
3. Select the file and click **Open**
4. Click the **lightning bolt** to execute
5. You should see "Database schema created successfully!"

### **Step 6: Verify Setup**
Run this query to verify tables:
```sql
USE lms_db;
SHOW TABLES;
```

**Expected Result:** 15 tables listed

### **Step 7: Check Seed Data**
```sql
-- Check subjects
SELECT * FROM subjects;

-- Check challenges
SELECT * FROM challenges;

-- Check quiz questions
SELECT COUNT(*) as total_questions FROM quiz_questions;
```

**Expected Results:**
- 5 subjects
- 5 challenges  
- 25 quiz questions

## 🚀 Alternative: Command Line Setup

If you prefer command line, open Command Prompt and run:
```cmd
mysql -u root -pNeha@2001 -e "CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -pNeha@2001 lms_db < backend\database\lms_schema.sql
```

## ✅ Verification After Setup

Once database is set up, restart the backend:

```cmd
cd backend
node server.js
```

Then test the API:
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

## 🔧 Troubleshooting

### **"Access denied for user 'root'@'localhost'"**
- Verify password: `Neha@2001`
- Check MySQL service is running
- Try connecting with MySQL Workbench first

### **"Can't connect to MySQL server"**
- Make sure MySQL service is running
- Check port 3306 is available
- Verify hostname is `localhost`

### **"Database doesn't exist"**
- Run the CREATE DATABASE query first
- Refresh MySQL Workbench connection
- Check database name spelling

### **Backend still shows database errors**
- Restart the backend after database setup
- Verify .env file has correct credentials
- Check backend logs for specific errors

## 🎯 Success Indicators

✅ MySQL Workbench connects successfully
✅ lms_db database created
✅ 15 tables imported successfully
✅ Seed data shows 5 subjects, 5 challenges, 25 questions
✅ Backend starts without database errors
✅ API test shows all endpoints working

## 📱 Quick Reference

**Connection Details:**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `Neha@2001`
- Database: `lms_db`

**Backend URL:** `http://localhost:5000`
**Frontend URL:** `http://localhost:5173`

**API Test:** `node test_lms_api.js`

## 🎉 Ready to Go!

Once you complete these steps:
1. ✅ Database will be fully set up
2. ✅ Backend will connect successfully
3. ✅ All API endpoints will work
4. ✅ Frontend can authenticate users
5. ✅ Quiz system will be functional
6. ✅ Session scheduling will work

**Your LMS platform will be complete! 🎓**
