@echo off
echo ===== LMS Database Setup =====
echo.

echo Step 1: Creating LMS database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create database. Please check MySQL credentials.
    pause
    exit /b 1
)

echo Database created successfully!

echo.
echo Step 2: Importing LMS schema...
mysql -u root -p lms_db < backend\database\lms_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to import schema. Please check the schema file.
    pause
    exit /b 1
)

echo Schema imported successfully!

echo.
echo Step 3: Verifying database setup...
mysql -u root -p -e "USE lms_db; SHOW TABLES;"

echo.
echo ===== Database Setup Complete! =====
echo.
echo Next steps:
echo 1. The backend is already configured for lms_db
echo 2. Test the API endpoints
echo 3. Start the frontend: npm run dev
echo.
pause
