import { supabase } from './supabase'

// Types
export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'Work' | 'Study' | 'Personal'
  difficulty: 1 | 2 | 3
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  estimated_minutes?: number
  actual_minutes?: number
  tags?: string[]
}

export interface Plant {
  id: string
  user_id: string
  growth_stage: number
  health_level: number
  last_updated: string
}

export interface FocusSession {
  id: string
  user_id: string
  task_id?: string
  duration_minutes: number
  session_type: 'focus' | 'short_break' | 'long_break'
  completed: boolean
  started_at: string
  completed_at?: string
  notes?: string
  interruptions: number
}

export interface UserStats {
  user_id: string
  total_tasks_completed: number
  total_focus_minutes: number
  total_focus_sessions: number
  level: number
  experience_points: number
  productivity_score: number
  last_updated: string
}

export interface StreakData {
  user_id: string
  current_streak: number
  best_streak: number
  last_activity_date: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  description: string
  icon: string
  unlocked_at: string
}

// Data Service Class
export class DataService {
  // Tasks
  static async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('simple_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async addTask(userId: string, task: {
    title: string
    description: string
    category: 'Work' | 'Study' | 'Personal'
    difficulty: 1 | 2 | 3
    priority: 'Low' | 'Medium' | 'High' | 'Urgent'
    due_date: string | null
    estimated_minutes?: number
  }): Promise<Task> {
    const { data, error } = await supabase
      .from('simple_tasks')
      .insert([{ ...task, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async completeTask(taskId: string): Promise<Task> {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('simple_tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  }

  // Plants
  static async getPlants(userId: string): Promise<Plant[]> {
    const { data, error } = await supabase
      .from('simple_plants')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPlant(userId: string, growthStage: number = 20): Promise<Plant> {
    const { data, error } = await supabase
      .from('simple_plants')
      .insert([{
        user_id: userId,
        growth_stage: growthStage,
        health_level: 100
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePlant(plantId: string, updates: Partial<Plant>): Promise<Plant> {
    const { data, error } = await supabase
      .from('simple_plants')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', plantId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Focus Sessions
  static async getFocusSessions(userId: string, limit?: number): Promise<FocusSession[]> {
    let query = supabase
      .from('simple_focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createFocusSession(userId: string, session: {
    task_id?: string
    duration_minutes: number
    session_type: 'focus' | 'short_break' | 'long_break'
  }): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('simple_focus_sessions')
      .insert([{ ...session, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async completeFocusSession(sessionId: string, notes?: string): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('simple_focus_sessions')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString(),
        notes 
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('simple_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async initializeUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .from('simple_user_stats')
      .insert([{ user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    const { data, error } = await supabase
      .from('simple_user_stats')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Streaks
  static async getStreakData(userId: string): Promise<StreakData | null> {
    const { data, error } = await supabase
      .from('simple_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateStreak(userId: string): Promise<StreakData> {
    const today = new Date().toISOString().split('T')[0]
    const existingStreak = await this.getStreakData(userId)

    if (!existingStreak) {
      // Create new streak
      const { data, error } = await supabase
        .from('simple_streaks')
        .insert([{
          user_id: userId,
          current_streak: 1,
          best_streak: 1,
          last_activity_date: today
        }])
        .select()
        .single()

      if (error) throw error
      return data
    }

    // Calculate new streak
    const lastActivity = new Date(existingStreak.last_activity_date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    let newStreak = existingStreak.current_streak
    if (daysDiff === 1) {
      newStreak += 1
    } else if (daysDiff > 1) {
      newStreak = 1
    }

    const newBestStreak = Math.max(existingStreak.best_streak, newStreak)

    const { data, error } = await supabase
      .from('simple_streaks')
      .update({
        current_streak: newStreak,
        best_streak: newBestStreak,
        last_activity_date: today
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Achievements
  static async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('simple_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async unlockAchievement(userId: string, achievement: {
    achievement_type: string
    achievement_name: string
    description: string
    icon: string
  }): Promise<Achievement> {
    const { data, error } = await supabase
      .from('simple_achievements')
      .insert([{ ...achievement, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Analytics
  static async logAnalyticsEvent(userId: string, eventType: string, eventData?: any): Promise<void> {
    const { error } = await supabase
      .from('simple_analytics')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_data: eventData
      }])

    if (error) throw error
  }

  static async getAnalyticsData(userId: string, timeRange: 'week' | 'month' | 'quarter' | 'year') {
    const now = new Date()
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }
    const startDate = ranges[timeRange]

    // Get tasks in time range
    const { data: tasks, error: tasksError } = await supabase
      .from('simple_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (tasksError) throw tasksError

    // Get focus sessions in time range
    const { data: focusSessions, error: sessionsError } = await supabase
      .from('simple_focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (sessionsError) throw sessionsError

    // Get streak data
    const streakData = await this.getStreakData(userId)

    // Get plants
    const plants = await this.getPlants(userId)

    return {
      tasks: tasks || [],
      focusSessions: focusSessions || [],
      streakData: streakData ? {
        current: streakData.current_streak,
        best: streakData.best_streak,
        history: [] // We'll need to implement history tracking separately
      } : { current: 0, best: 0, history: [] },
      plantGrowth: {
        totalPlants: plants.length,
        averageHealth: plants.length > 0 ? plants.reduce((sum, p) => sum + p.health_level, 0) / plants.length : 0,
        growthRate: plants.length > 0 ? plants.reduce((sum, p) => sum + p.growth_stage, 0) / plants.length : 0
      }
    }
  }

  // Dashboard Data
  static async getDashboardData(userId: string) {
    try {
      const [tasks, plants, userStats, streakData, achievements, focusSessions] = await Promise.all([
        this.getTasks(userId),
        this.getPlants(userId),
        this.getUserStats(userId),
        this.getStreakData(userId),
        this.getAchievements(userId),
        this.getFocusSessions(userId, 10)
      ])

      // Initialize user stats if they don't exist
      const stats = userStats || await this.initializeUserStats(userId)

      return {
        tasks,
        plants,
        achievements,
        focusSessions,
        userStats: {
          totalTasksCompleted: stats.total_tasks_completed,
          totalFocusMinutes: stats.total_focus_minutes,
          currentStreak: streakData?.current_streak || 0,
          bestStreak: streakData?.best_streak || 0,
          plantsGrown: plants.filter(p => p.growth_stage >= 100).length,
          level: stats.level,
          experiencePoints: stats.experience_points,
          achievementsUnlocked: achievements.length
        },
        streakData: {
          current: streakData?.current_streak || 0,
          best: streakData?.best_streak || 0,
          history: [] // Implement if needed
        },
        plantGrowth: {
          totalPlants: plants.length,
          averageHealth: plants.length > 0 ? plants.reduce((sum, p) => sum + p.health_level, 0) / plants.length : 0,
          growthRate: plants.length > 0 ? plants.reduce((sum, p) => sum + p.growth_stage, 0) / plants.length : 0
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      throw error
    }
  }

  // Plant Growth Logic
  static async handleTaskCompletion(userId: string, task: Task): Promise<void> {
    try {
      // Update streak
      await this.updateStreak(userId)

      // Handle plant growth
      const plants = await this.getPlants(userId)
      const growthAmount = task.difficulty * 20 // 20, 40, or 60 based on difficulty

      if (plants.length === 0) {
        // Create first plant
        await this.createPlant(userId, growthAmount)
      } else {
        // Update existing plant or create new one
        const currentPlant = plants[plants.length - 1]
        
        if (currentPlant.growth_stage >= 100) {
          // Create new plant
          await this.createPlant(userId, growthAmount)
        } else {
          // Update current plant
          const newGrowthStage = Math.min(100, currentPlant.growth_stage + growthAmount)
          const newHealthLevel = Math.min(100, currentPlant.health_level + 10)
          
          await this.updatePlant(currentPlant.id, {
            growth_stage: newGrowthStage,
            health_level: newHealthLevel
          })
        }
      }

      // Update user stats
      const stats = await this.getUserStats(userId)
      if (stats) {
        await this.updateUserStats(userId, {
          total_tasks_completed: stats.total_tasks_completed + 1
        })
      }

      // Log analytics event
      await this.logAnalyticsEvent(userId, 'task_completed', {
        task_id: task.id,
        category: task.category,
        difficulty: task.difficulty
      })

    } catch (error) {
      console.error('Error handling task completion:', error)
      throw error
    }
  }
}