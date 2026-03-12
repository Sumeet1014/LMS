-- Run this in MySQL Workbench or your MySQL client
-- This updates the password column to password_hash

USE lms_db;

-- Update the column name
ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255);

-- Verify the change
DESCRIBE users;

-- You should see password_hash in the output
SELECT 'Migration completed successfully!' as status;
