-- Corrected Enhanced Features Migration
-- Run this in your Supabase SQL Editor to add new features
-- This creates tables in the correct order to avoid dependency issues

-- First, create the simple_user_stats table (referenced by other tables)
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

-- Create simple_achievements table
CREATE TABLE IF NOT EXISTS simple_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing simple_tasks table
ALTER TABLE simple_tasks 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS actual_minutes INTEGER,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES simple_tasks(id),
ADD COLUMN IF NOT EXISTS recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly'
ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5) DEFAULT 3;

-- Create focus sessions table
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

-- Create analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS simple_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'task_completed', 'focus_session', 'login', etc.
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS simple_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  icon TEXT DEFAULT '✅',
  color TEXT DEFAULT '#5C946E',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit completions table
CREATE TABLE IF NOT EXISTS simple_habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES simple_habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create themes table for customization
CREATE TABLE IF NOT EXISTS simple_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL, -- Store color scheme as JSON
  unlocked BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT FALSE,
  unlock_condition TEXT -- Achievement or purchase requirement
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS simple_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('achievement', 'reminder', 'streak', 'plant_health')) DEFAULT 'reminder',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS simple_user_preferences (
  user_id UUID REFERENCES simple_users(id) ON DELETE CASCADE PRIMARY KEY,
  theme_id UUID REFERENCES simple_themes(id),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  focus_session_duration INTEGER DEFAULT 25,
  short_break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  auto_start_breaks BOOLEAN DEFAULT TRUE,
  auto_start_focus BOOLEAN DEFAULT FALSE,
  daily_goal_tasks INTEGER DEFAULT 5,
  daily_goal_focus_minutes INTEGER DEFAULT 120,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  sound_effects BOOLEAN DEFAULT TRUE,
  background_music BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON simple_focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON simple_focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON simple_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON simple_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON simple_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON simple_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON simple_habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON simple_habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON simple_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON simple_notifications(read);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON simple_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON simple_user_stats(user_id);

-- Create functions for automatic stat updates
CREATE OR REPLACE FUNCTION update_user_stats_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    INSERT INTO simple_user_stats (user_id, total_tasks_completed, last_updated)
    VALUES (NEW.user_id, 1, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_tasks_completed = simple_user_stats.total_tasks_completed + 1,
      last_updated = NOW();
      
    -- Update streak
    INSERT INTO simple_streaks (user_id, current_streak, best_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      current_streak = CASE 
        WHEN simple_streaks.last_activity_date = CURRENT_DATE THEN simple_streaks.current_streak
        WHEN simple_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN simple_streaks.current_streak + 1
        ELSE 1
      END,
      best_streak = GREATEST(simple_streaks.best_streak, CASE 
        WHEN simple_streaks.last_activity_date = CURRENT_DATE THEN simple_streaks.current_streak
        WHEN simple_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN simple_streaks.current_streak + 1
        ELSE 1
      END),
      last_activity_date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_stats_on_focus_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    INSERT INTO simple_user_stats (user_id, total_focus_minutes, total_focus_sessions, last_updated)
    VALUES (NEW.user_id, NEW.duration_minutes, 1, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_focus_minutes = simple_user_stats.total_focus_minutes + NEW.duration_minutes,
      total_focus_sessions = simple_user_stats.total_focus_sessions + 1,
      last_updated = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_stats_on_task_completion ON simple_tasks;
CREATE TRIGGER trigger_update_stats_on_task_completion
  AFTER UPDATE ON simple_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_task_completion();

DROP TRIGGER IF EXISTS trigger_update_stats_on_focus_completion ON simple_focus_sessions;
CREATE TRIGGER trigger_update_stats_on_focus_completion
  AFTER UPDATE ON simple_focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_focus_completion();

-- Insert default themes (only if they don't exist)
INSERT INTO simple_themes (name, colors, unlocked, unlock_condition) 
SELECT * FROM (VALUES
  ('Default', '{"primary": "#5C946E", "secondary": "#A5D6A7", "background": "#F4F7F6", "text": "#1E2D2F"}', TRUE, 'default'),
  ('Ocean Blue', '{"primary": "#2196F3", "secondary": "#64B5F6", "background": "#E3F2FD", "text": "#0D47A1"}', FALSE, 'complete_50_tasks'),
  ('Sunset Orange', '{"primary": "#FF9800", "secondary": "#FFB74D", "background": "#FFF3E0", "text": "#E65100"}', FALSE, 'focus_25_hours'),
  ('Forest Green', '{"primary": "#4CAF50", "secondary": "#81C784", "background": "#E8F5E8", "text": "#1B5E20"}', FALSE, 'grow_10_plants'),
  ('Royal Purple', '{"primary": "#9C27B0", "secondary": "#BA68C8", "background": "#F3E5F5", "text": "#4A148C"}', FALSE, 'achieve_30_day_streak'),
  ('Golden Luxury', '{"primary": "#FFD700", "secondary": "#FFF176", "background": "#FFFDE7", "text": "#F57F17"}', FALSE, 'unlock_all_achievements')
) AS t(name, colors, unlocked, unlock_condition)
WHERE NOT EXISTS (SELECT 1 FROM simple_themes WHERE simple_themes.name = t.name);

-- Disable Row Level Security for new tables
ALTER TABLE simple_focus_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_habit_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_themes DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE simple_user_stats DISABLE ROW LEVEL SECURITY;

-- Create function to calculate productivity score
CREATE OR REPLACE FUNCTION calculate_productivity_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  task_score INTEGER := 0;
  focus_score INTEGER := 0;
  streak_score INTEGER := 0;
  total_score INTEGER := 0;
  user_stats RECORD;
BEGIN
  SELECT * INTO user_stats FROM simple_user_stats WHERE user_id = user_uuid;
  
  IF user_stats IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Task completion score (max 40 points)
  task_score := LEAST(user_stats.total_tasks_completed * 2, 40);
  
  -- Focus time score (max 30 points) - 1 point per hour
  focus_score := LEAST(user_stats.total_focus_minutes / 60, 30);
  
  -- Streak score (max 30 points) - 2 points per day
  SELECT current_streak INTO streak_score FROM simple_streaks WHERE user_id = user_uuid;
  streak_score := LEAST(COALESCE(streak_score, 0) * 2, 30);
  
  total_score := task_score + focus_score + streak_score;
  
  -- Update the productivity score
  UPDATE simple_user_stats 
  SET productivity_score = total_score 
  WHERE user_id = user_uuid;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old analytics data (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM simple_analytics 
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE simple_focus_sessions IS 'Tracks user focus sessions with Pomodoro technique';
COMMENT ON TABLE simple_analytics IS 'Stores user behavior analytics for insights';
COMMENT ON TABLE simple_habits IS 'User-defined habits to track';
COMMENT ON TABLE simple_habit_completions IS 'Records of habit completions';
COMMENT ON TABLE simple_themes IS 'Available UI themes for users';
COMMENT ON TABLE simple_notifications IS 'In-app notifications for users';
COMMENT ON TABLE simple_user_preferences IS 'User customization preferences';
COMMENT ON TABLE simple_achievements IS 'User achievements and rewards';
COMMENT ON TABLE simple_user_stats IS 'Aggregated user statistics and progress';