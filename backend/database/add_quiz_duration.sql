-- Patch: Add duration column to challenges (QUIZ) table
-- ER Diagram shows duration as a QUIZ attribute

USE lms_db;

ALTER TABLE challenges 
ADD COLUMN duration INT DEFAULT 30 COMMENT 'Quiz duration in minutes' 
AFTER description;

-- Update existing quiz records with a default duration
UPDATE challenges SET duration = 30 WHERE duration IS NULL;

SELECT 'duration column added to challenges table!' AS status;
