-- Disable email confirmation for immediate user access
-- Run this in your Supabase SQL Editor

-- This will allow users to sign up without email verification
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Alternative: You can also disable it via the dashboard
-- Go to Authentication → Settings → Disable "Enable email confirmations"