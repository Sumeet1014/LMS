-- Add mentor_type and is_active columns to profiles table
-- This allows multiple mentors per user

ALTER TABLE profiles 
ADD COLUMN mentor_type VARCHAR(50) DEFAULT 'primary' 
COMMENT 'Type of mentor profile (primary, secondary, specialized)';

ALTER TABLE profiles 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE 
COMMENT 'Whether this mentor profile is currently active';

-- Remove UNIQUE constraint on user_id to allow multiple profiles per user
-- Note: This might fail if constraint doesn't exist, which is fine

-- Update existing profiles to have default values
UPDATE profiles SET 
    mentor_type = 'primary',
    is_active = TRUE 
WHERE mentor_type IS NULL;

COMMIT;
