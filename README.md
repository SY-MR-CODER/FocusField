# 🌱 FocusField - Gamified Productivity App

> Transform your productivity journey into an engaging plant-growing adventure!

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen)](https://focusfield-cgo22kdce-sy-mr-coders-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

FocusField is a revolutionary productivity app that gamifies task completion through virtual plant growth. Complete tasks, grow beautiful plants, and build lasting productivity habits in an engaging, visually appealing environment.

## ✨ Features

### 🎯 **Smart Task Management**
- **AI-Powered Prioritization**: Intelligent task scoring based on priority, due dates, difficulty, and age
- **Advanced Filtering**: Quick filters for today's tasks, overdue items, high priority, and quick wins
- **Smart Recommendations**: Get personalized suggestions for optimal task selection
- **Real-time Statistics**: Live tracking of completion rates and productivity metrics

### ⏰ **Enhanced Focus Mode**
- **Pomodoro Technique**: Full implementation with customizable timer durations (15, 25, 45, 60 minutes)
- **Session Types**: Focus sessions with visual progress tracking
- **Distraction-Free Environment**: Fullscreen mode with calming animations
- **Background Music**: Optional ambient sounds for better concentration
- **Notifications**: Browser notifications when sessions complete

### 🌱 **Gamified Plant Growth**
- **Dynamic Growth**: Plants grow based on actual task completion
- **Health System**: Plants require regular care through consistent productivity
- **Multiple Plants**: Unlock new plants as you complete more tasks
- **Visual Progress**: Beautiful SVG animations showing plant development
- **Garden Overview**: Comprehensive view of your productivity garden

### 📊 **Analytics & Insights**
- **Productivity Scoring**: 0-100 scale based on tasks, focus time, and streaks
- **Behavioral Insights**: AI-generated recommendations for improvement
- **Weekly Patterns**: Identify your peak productivity days and times
- **Performance Trends**: Track improvement over time with detailed charts
- **Category Analysis**: Breakdown of work across different task types

### 🏆 **Achievement System**
- **Multi-Tier Rewards**: Bronze, Silver, Gold, Platinum, and Legendary achievements
- **Real Benefits**: Unlock XP bonuses, plant growth boosts, themes, and features
- **Progress Tracking**: Visual progress bars for all achievements
- **Category-Based**: Achievements across tasks, focus, streaks, garden, and special categories

### 📱 **Cross-Platform Experience**
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **Progressive Web App**: Install on any device for native-like experience
- **Real-time Sync**: Data synchronizes across all your devices
- **Offline Support**: Basic functionality works without internet connection

## 🚀 Tech Stack

### **Frontend**
- **Next.js 16**: Latest React framework with App Router
- **React 19**: Modern React with concurrent features
- **TypeScript**: Full type safety and developer experience
- **TailwindCSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and micro-interactions

### **Backend & Database**
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Secure data access with user-based policies
- **Real-time Updates**: Live data synchronization across clients
- **Authentication**: Secure email/password authentication

### **Deployment & DevOps**
- **Vercel**: Serverless deployment with global CDN
- **GitHub Actions**: Automated CI/CD pipeline
- **Environment Management**: Secure environment variable handling
- **Performance Monitoring**: Built-in analytics and error tracking

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd focusfield
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tasks Table
```sql
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
```

#### Plants Table
```sql
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  growth_stage INTEGER DEFAULT 0 CHECK (growth_stage >= 0 AND growth_stage <= 100),
  health_level INTEGER DEFAULT 100 CHECK (health_level >= 0 AND health_level <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Streaks Table
```sql
CREATE TABLE streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE
);
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Plants policies
CREATE POLICY "Users can view own plants" ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON plants FOR UPDATE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);
```



### 6. Add Focus Music (Optional)

Replace the placeholder `public/focus-music.mp3` with an actual MP3 file of calming background music.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── focus/            # Focus mode components
│   ├── garden/           # Garden and plant components
│   ├── layout/           # Layout components
│   ├── tasks/            # Task management components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility functions and configurations
└── types/                # TypeScript type definitions
```

## Design System

### Colors
- **Background**: `#F4F7F6` (soft off-white)
- **Accent**: `#5C946E` (sage green)
- **Secondary**: `#A5D6A7` (mint green)
- **Text**: `#1E2D2F` (dark charcoal)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- Rounded corners (`rounded-2xl`)
- Soft shadows
- Gradient hover effects
- Smooth animations with Framer Motion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## 🎮 How It Works

1. **Create Tasks**: Add tasks with categories (Work, Study, Personal) and difficulty levels
2. **Focus Sessions**: Use the Pomodoro timer to work on your tasks with full concentration
3. **Complete Tasks**: Mark tasks as done to trigger plant growth in your garden
4. **Watch Plants Grow**: Your virtual garden flourishes as you stay productive
5. **Build Streaks**: Maintain daily productivity to keep your plants healthy
6. **Unlock Achievements**: Earn rewards and unlock new features as you progress

## 🌟 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/5C946E/FFFFFF?text=FocusField+Dashboard)

### Focus Mode
![Focus Mode](https://via.placeholder.com/800x400/A5D6A7/FFFFFF?text=Pomodoro+Focus+Timer)

### Garden View
![Garden](https://via.placeholder.com/800x400/F4F7F6/1E2D2F?text=Virtual+Plant+Garden)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/focusfield.git
cd focusfield
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**
- Go to your Supabase project dashboard
- Run the SQL commands from `simple-auth-setup.sql` in the SQL Editor
- Optionally run `minimal-migration.sql` for enhanced features

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile App

FocusField also includes a React Native mobile app for iOS and Android:

```bash
cd FocusFieldMobile
npm install
npm start
```

## 🛠️ Development

### Project Structure
```
focusfield/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── focus/          # Focus mode components
│   │   ├── garden/         # Garden and plant components
│   │   ├── tasks/          # Task management components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and services
│   ├── contexts/           # React contexts
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Database Schema

The app uses a PostgreSQL database with the following main tables:
- `simple_users` - User accounts and profiles
- `simple_tasks` - Task management
- `simple_plants` - Virtual plant data
- `simple_streaks` - Productivity streak tracking
- `simple_focus_sessions` - Focus session history (optional)
- `simple_achievements` - User achievements (optional)

## 🎨 Design System

### Color Palette
- **Primary**: `#5C946E` (Sage Green) - Growth and nature
- **Secondary**: `#A5D6A7` (Mint Green) - Freshness and energy  
- **Background**: `#F4F7F6` (Soft Off-white) - Calm and clean
- **Text**: `#1E2D2F` (Dark Charcoal) - Readability and contrast

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Components
- Rounded corners with `border-radius: 1rem` (16px)
- Soft shadows for depth and elevation
- Gradient hover effects for interactive elements
- Smooth animations with Framer Motion

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Add JSDoc comments for complex functions
- Write tests for new features
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern productivity apps and nature-based themes
- **Icons**: [Lucide React](https://lucide.dev/) for beautiful, consistent icons
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth interactions
- **Database**: [Supabase](https://supabase.com/) for backend infrastructure
- **Deployment**: [Vercel](https://vercel.com/) for seamless hosting

## 📞 Support

- **Documentation**: Check our [docs](./docs) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/focusfield/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/focusfield/discussions)

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Social Features**: Share gardens with friends and team challenges
- [ ] **AI Coaching**: Personalized productivity recommendations
- [ ] **Advanced Analytics**: Deeper insights into productivity patterns
- [ ] **Team Workspaces**: Collaborative productivity for organizations
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Integrations**: Calendar, Slack, and project management tool connections
- [ ] **Seasonal Events**: Special plants and themes for holidays
- [ ] **Habit Tracking**: Expand beyond tasks to daily habits

### Long-term Vision
- Become the leading gamified productivity platform
- Help millions of people build sustainable productivity habits
- Create a positive, engaging approach to personal development
- Foster a community of productive, motivated individuals

---

**Made with 🌱 by the FocusField Team**

*Transform your productivity journey into an engaging adventure!*