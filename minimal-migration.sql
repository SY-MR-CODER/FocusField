-- Minimal Migration to Fix Immediate Errors
-- Run this first to get your app working

-- 1. Create simple_user_stats table
CREATE TABLE IF NOT EXISTS simple_user_stats (
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE PRIMARY KEY,
  total_tasks_completed INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  total_focus_sessions INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  plants_grown INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  average_focus_duration DECIMAL(5,2) DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  themes_unlocked INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create simple_achievements table
CREATE TABLE IF NOT EXISTS simple_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create simple_focus_sessions table
CREATE TABLE IF NOT EXISTS simple_focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES simple_tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT CHECK (session_type IN ('focus', 'short_break', 'long_break')) DEFAULT 'focus',
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  interruptions INTEGER DEFAULT 0
);

-- 4. Add the missing column to simple_tasks
ALTER TABLE simple_tasks 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30;

-- 5. Disable Row Level Security for these tables
ALTER TABLE simple_user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_focus_sessions DISABLE ROW LEVEL SECURITY;