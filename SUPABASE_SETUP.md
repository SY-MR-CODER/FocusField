# Supabase Setup Guide for FocusField

## Quick Setup Commands

### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Click "New Project"
# Fill in project details and wait for creation
```

### 2. Set up Environment Variables
```bash
# Copy your project details from Supabase Dashboard > Settings > API
cp .env.local.example .env.local

# Edit .env.local with your actual values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Setup
Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Work', 'Study', 'Personal')) NOT NULL,
  difficulty INTEGER CHECK (difficulty IN (1, 2, 3)) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  growth_stage INTEGER DEFAULT 0 CHECK (growth_stage >= 0 AND growth_stage <= 100),
  health_level INTEGER DEFAULT 100 CHECK (health_level >= 0 AND health_level <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streaks table
CREATE TABLE streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Plants policies
CREATE POLICY "Users can view own plants" ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON plants FOR DELETE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Configure Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Set Site URL to `http://localhost:3000`
3. Add redirect URLs: `http://localhost:3000/auth/callback`
4. **IMPORTANT**: Disable "Enable email confirmations" for immediate user access



### 5. Restart Development Server
```bash
npm run dev
```

## Verification

After setup, you should be able to:
- ✅ Sign up with email/password
- ✅ Sign in to existing accounts  
- ✅ Create and complete tasks
- ✅ See plants grow in your garden
- ✅ Track daily streaks
- ✅ Use focus mode timer

## Troubleshooting

**Can't connect to Supabase?**
- Check your environment variables are correct
- Ensure your project is fully created (not still setting up)
- Verify the URL doesn't have trailing slashes

**Authentication not working?**
- Check Site URL in Supabase Auth settings
- Verify RLS policies are created
- Make sure the user trigger function is created

**Database errors?**
- Ensure all tables are created
- Check that RLS is enabled on all tables
- Verify foreign key relationships are correct

## Production Deployment

When deploying to production:
1. Update Site URL in Supabase to your production domain
2. Add production redirect URLs
3. Update environment variables in your hosting platform
4. Test all authentication flows

## Need Help?

- Check the Supabase documentation: https://supabase.com/docs
- Review the project README.md for additional details
- Open an issue if you encounter problems