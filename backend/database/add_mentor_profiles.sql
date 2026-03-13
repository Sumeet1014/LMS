-- Create mentor_profiles table to allow users to have multiple mentor profiles
-- Each profile can be for different subjects/expertise areas

USE lms_db;

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  profile_name VARCHAR(255) NOT NULL,
  bio TEXT,
  subjects JSON NOT NULL,
  expertise_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
  availability JSON,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_sessions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_mentor_profiles_user (user_id),
  INDEX idx_mentor_profiles_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing mentors to mentor_profiles table
INSERT INTO mentor_profiles (user_id, profile_name, bio, subjects, availability, rating, total_sessions, is_active)
SELECT 
  u.id,
  CONCAT(u.full_name, '''s Mentoring'),
  p.bio,
  COALESCE(p.subjects, '[]'),
  p.availability,
  COALESCE(p.rating, 0.00),
  COALESCE(p.total_sessions_taught, 0),
  TRUE
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.role = 'mentor' OR p.is_mentor = TRUE;

SELECT 'Mentor profiles table created and existing mentors migrated!' as status;
