-- Migration: Fix password column name
-- This updates the column name from 'password' to 'password_hash'

USE lms_db;

-- Check if the old 'password' column exists and rename it
ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255);

-- Verify the change
DESCRIBE users;
