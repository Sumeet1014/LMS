# Bug Fixes Testing Instructions

## Prerequisites

1. **Update Database Schema**
   
   Choose one option:

   ### Option A: Fresh Database (No existing data)
   ```bash
   mysql -u root -pNeha@2001
   ```
   Then in MySQL:
   ```sql
   DROP DATABASE IF EXISTS lms_db;
   CREATE DATABASE lms_db;
   USE lms_db;
   SOURCE backend/database/schema.sql;
   EXIT;
   ```

   ### Option B: Migrate Existing Database (Keep data)
   ```bash
   mysql -u root -pNeha@2001 lms_db
   ```
   Then in MySQL:
   ```sql
   ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255);
   EXIT;
   ```

2. **Install Dependencies** (if not already done)
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Running the Tests

### Step 1: Start Backend Server
```bash
cd backend
npm start
```

Wait for the message: `Server running on port 3001`

### Step 2: Run Test Suite (in a new terminal)
```bash
cd backend
node test_bug_fixes.js
```

## What the Tests Verify

### ✅ Test 1: Weak Password Validation
- Verifies passwords must be at least 8 characters
- Tests that 3-character passwords are rejected

### ✅ Test 2: User Registration
- Tests user registration with strong password
- Verifies `password_hash` column is working
- Confirms JWT token is generated

### ✅ Test 3: User Login
- Tests login functionality
- Verifies password verification with `password_hash`
- Confirms authentication works end-to-end

### ✅ Test 4: Port Configuration
- Verifies server is running on port 3001
- Tests health check endpoint

### ✅ Test 5: Auth Rate Limiting
- Tests that auth endpoints have rate limiting
- Verifies protection against brute force attacks

### ✅ Test 6: Future Date Validation
- Tests that sessions can only be booked in the future
- Verifies past dates are rejected

### ✅ Test 7: Change Password
- Tests password change functionality
- Verifies `password_hash` field access is correct

### ✅ Test 8: CORS Configuration
- Verifies CORS is configured
- Checks for proper headers

## Expected Output

You should see:
```
╔════════════════════════════════════════════════════════════╗
║         BUG FIXES VERIFICATION TEST SUITE                 ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: Bug Fix #1: Weak Password Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Weak password rejected correctly

[... more tests ...]

╔════════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                            ║
╚════════════════════════════════════════════════════════════╝

Total Tests: 8
Passed: 8
Failed: 0

🎉 ALL TESTS PASSED! All bugs are fixed!

Success Rate: 100.0%
```

## Manual Testing (Optional)

### Test Socket.io Authentication

1. Start the backend server
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Open browser console (F12)
4. Try to connect to a session
5. Check console for "Socket connected" message
6. Verify authentication is working

### Test Frontend Integration

1. Register a new user (password must be 8+ characters)
2. Login with the new user
3. Try to book a session in the past (should fail)
4. Book a session in the future (should succeed)
5. Test real-time chat/whiteboard features

## Troubleshooting

### Test fails with "Backend server is not running"
- Make sure you started the backend: `cd backend && npm start`
- Check if port 3001 is available

### Test fails with database errors
- Make sure you ran the database migration
- Check database credentials in `backend/.env`

### Rate limiting test shows warning
- This is normal - rate limits reset after 15 minutes
- The test won't fail, just shows a warning

### Socket connection errors
- Clear browser localStorage
- Login again to get a fresh token
- Check browser console for detailed errors

## Security Reminders

After testing:

1. **Never commit `.env` files** - they're now in `.gitignore`
2. **Change JWT_SECRET** in production
3. **Use strong database passwords**
4. **Set ALLOWED_ORIGINS** for production domains

## Next Steps

Once all tests pass:

1. Test the frontend application manually
2. Deploy to production with proper environment variables
3. Monitor logs for any issues
4. Set up proper logging and monitoring
