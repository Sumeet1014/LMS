-- Verify the table structures after migration
USE lms_db;

SELECT 'users table:' as info;
DESCRIBE users;

SELECT 'video_chat_messages table:' as info;
DESCRIBE video_chat_messages;

SELECT 'whiteboard_strokes table:' as info;
DESCRIBE whiteboard_strokes;

-- Check if tables exist and have data
SELECT 'Table existence check:' as info;
SELECT 
  TABLE_NAME, 
  TABLE_ROWS,
  CREATE_TIME,
  UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'lms_db' 
  AND TABLE_NAME IN ('users', 'video_chat_messages', 'whiteboard_strokes');
