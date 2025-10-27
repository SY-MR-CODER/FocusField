-- Simple Username/Password Authentication Setup
-- Run this in your Supabase SQL Editor

-- Create simple_users table for username-based authentication
CREATE TABLE simple_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table (updated for simple auth)
CREATE TABLE simple_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Work', 'Study', 'Personal')) NOT NULL,
  difficulty INTEGER CHECK (difficulty IN (1, 2, 3)) NOT NULL,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table (updated for simple auth)
CREATE TABLE simple_plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  growth_stage INTEGER DEFAULT 0 CHECK (growth_stage >= 0 AND growth_stage <= 100),
  health_level INTEGER DEFAULT 100 CHECK (health_level >= 0 AND health_level <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streaks table (updated for simple auth)
CREATE TABLE simple_streaks (
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE
);

-- Disable Row Level Security for simplicity (since we're handling auth in the app)
ALTER TABLE simple_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_plants DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_streaks DISABLE ROW LEVEL SECURITY;
--
 Create achievements table
CREATE TABLE simple_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user stats table for tracking progress
CREATE TABLE simple_user_stats (
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE PRIMARY KEY,
  total_tasks_completed INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  plants_grown INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for new tables
ALTER TABLE simple_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_user_stats DISABLE ROW LEVEL SECURITY;