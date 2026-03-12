-- Migration: Allow multiple mentors per user
-- Remove UNIQUE constraint from user_id in profiles table

-- First, drop the existing index if it exists
DROP INDEX IF EXISTS idx_user_id ON profiles;

-- Then modify the table to remove the UNIQUE constraint
ALTER TABLE profiles DROP INDEX idx_user_id;

-- Add a new index without UNIQUE constraint (allows multiple profiles per user)
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Add a mentor_type field to distinguish different mentor profiles
ALTER TABLE profiles ADD COLUMN mentor_type VARCHAR(50) DEFAULT 'primary' COMMENT 'Type of mentor profile (primary, secondary, etc.)';

-- Add is_active field to manage which mentor profile is active
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this mentor profile is currently active';

-- Update existing profiles to have mentor_type and is_active
UPDATE profiles SET 
    mentor_type = 'primary',
    is_active = TRUE
WHERE mentor_type IS NULL;

COMMIT;
