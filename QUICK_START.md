# 🚀 Quick Start Guide

## Step 1: Database Setup

### Option A: Using MySQL Command Line
```bash
# 1. Connect to MySQL
mysql -u root -p

# 2. Create database
CREATE DATABASE peer_pivot_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Exit MySQL
exit

# 4. Import schema
mysql -u root -p peer_pivot_learn < backend/database/schema.sql
```

### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Create new connection (root user)
3. Execute: `CREATE DATABASE peer_pivot_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
4. Import file: `backend/database/schema.sql`

## Step 2: Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies (already done)
npm install

# 3. Update .env file with your MySQL password
# Edit backend/.env and set DB_PASSWORD=your_password

# 4. Start backend server
node server.js
```

## Step 3: Frontend Setup

```bash
# 1. Install axios for API calls (if not already installed)
npm install axios

# 2. Start frontend (in new terminal)
npm run dev
```

## Step 4: Test the Migration

### 1. Test Backend Health
Open browser: http://localhost:3001/health

### 2. Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

### 3. Test User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Test Frontend
Open browser: http://localhost:5173
- Try registering a new user
- Try logging in
- Check that authentication works

## 🎯 Success Indicators

✅ Backend server starts without errors
✅ Health endpoint returns: `{"status":"OK"}`
✅ User registration returns success with token
✅ User login returns success with token
✅ Frontend loads and can authenticate users
✅ Dashboard shows user information

## 🔧 Troubleshooting

### Database Connection Error
```
ER_ACCESS_DENIED_ERROR
```
**Solution**: Update `DB_PASSWORD` in `backend/.env` with your MySQL password

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution**: Kill process using port 3001 or change PORT in .env

### Frontend API Errors
```
Network Error
```
**Solution**: Ensure backend is running on port 3001

## 📞 Need Help?

1. Check backend logs for detailed error messages
2. Verify MySQL is running and accessible
3. Confirm all environment variables are set correctly
4. Test with Postman/Insomnia for detailed API responses

## 🎉 You're Ready!

Once you complete these steps, you'll have:
- ✅ Custom Node.js backend running
- ✅ MySQL database with all data
- ✅ Frontend connected to new backend
- ✅ Full authentication system
- ✅ All platform features working

**Migration Complete! 🚀**
