import { supabase } from './supabase'

// Fallback data service that works with existing database structure
export class FallbackDataService {
  // Tasks - works with existing simple_tasks table
  static async getTasks(userId: string) {
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
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
    due_date?: string | null
    estimated_minutes?: number
  }) {
    // Only include fields that exist in the current database schema
    const taskData: any = {
      title: task.title,
      description: task.description,
      category: task.category,
      difficulty: task.difficulty,
      user_id: userId
    }

    // Only add optional fields if they exist in the schema
    try {
      const { data, error } = await supabase
        .from('simple_tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      return data
    } catch (err) {
      console.error('Error adding task:', err)
      throw err
    }
  }

  static async completeTask(taskId: string) {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update({ completed: true })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTask(taskId: string, updates: any) {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Plants - works with existing simple_plants table
  static async getPlants(userId: string) {
    const { data, error } = await supabase
      .from('simple_plants')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPlant(userId: string, growthStage: number = 20) {
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

  static async updatePlant(plantId: string, updates: any) {
    const { data, error } = await supabase
      .from('simple_plants')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', plantId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Streaks - works with existing simple_streaks table
  static async getStreakData(userId: string) {
    const { data, error } = await supabase
      .from('simple_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateStreak(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const existingStreak = await this.getStreakData(userId)

    if (!existingStreak) {
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

  // Fallback methods for enhanced features (return empty/default data)
  static async getFocusSessions(userId: string) {
    // Return empty array if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .limit(10)

      if (error) return []
      return data || []
    } catch {
      return []
    }
  }

  static async getUserStats(userId: string) {
    // Return default stats if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) return null
      return data
    } catch {
      return null
    }
  }

  static async getAchievements(userId: string) {
    // Return empty array if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_achievements')
        .select('*')
        .eq('user_id', userId)

      if (error) return []
      return data || []
    } catch {
      return []
    }
  }

  static async createFocusSession(userId: string, session: any) {
    // Try to create, return mock data if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_focus_sessions')
        .insert([{ ...session, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch {
      return {
        id: Date.now().toString(),
        user_id: userId,
        ...session,
        started_at: new Date().toISOString()
      }
    }
  }

  static async completeFocusSession(sessionId: string, notes?: string) {
    // Try to complete, return success if table doesn't exist
    try {
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
    } catch {
      return { id: sessionId, completed: true }
    }
  }

  // Dashboard data with fallbacks
  static async getDashboardData(userId: string) {
    try {
      const [tasks, plants, streakData] = await Promise.all([
        this.getTasks(userId),
        this.getPlants(userId),
        this.getStreakData(userId)
      ])

      // Try to get enhanced data, fallback to defaults
      const [userStats, achievements, focusSessions] = await Promise.all([
        this.getUserStats(userId).catch(() => null),
        this.getAchievements(userId).catch(() => []),
        this.getFocusSessions(userId).catch(() => [])
      ])

      const completedTasks = tasks.filter(t => t.completed).length
      const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

      return {
        tasks,
        plants,
        achievements,
        focusSessions,
        userStats: {
          totalTasksCompleted: userStats?.total_tasks_completed || completedTasks,
          totalFocusMinutes: userStats?.total_focus_minutes || totalFocusMinutes,
          currentStreak: streakData?.current_streak || 0,
          bestStreak: streakData?.best_streak || 0,
          plantsGrown: plants.filter(p => p.growth_stage >= 100).length,
          level: userStats?.level || 1,
          experiencePoints: userStats?.experience_points || completedTasks * 10,
          achievementsUnlocked: achievements.length
        },
        streakData: {
          current: streakData?.current_streak || 0,
          best: streakData?.best_streak || 0,
          history: []
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

  // Handle task completion with existing database
  static async handleTaskCompletion(userId: string, task: any) {
    try {
      // Update streak
      await this.updateStreak(userId)

      // Handle plant growth
      const plants = await this.getPlants(userId)
      const growthAmount = task.difficulty * 20

      if (plants.length === 0) {
        await this.createPlant(userId, growthAmount)
      } else {
        const currentPlant = plants[plants.length - 1]
        
        if (currentPlant.growth_stage >= 100) {
          await this.createPlant(userId, growthAmount)
        } else {
          const newGrowthStage = Math.min(100, currentPlant.growth_stage + growthAmount)
          const newHealthLevel = Math.min(100, currentPlant.health_level + 10)
          
          await this.updatePlant(currentPlant.id, {
            growth_stage: newGrowthStage,
            health_level: newHealthLevel
          })
        }
      }
    } catch (error) {
      console.error('Error handling task completion:', error)
      // Don't throw error - let the task completion succeed even if plant growth fails
    }
  }

  static async updateUserStats(userId: string, updates: any) {
    // Try to update stats, silently fail if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_user_stats')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return null
      return data
    } catch {
      return null
    }
  }

  static async initializeUserStats(userId: string) {
    // Try to initialize stats, return null if table doesn't exist
    try {
      const { data, error } = await supabase
        .from('simple_user_stats')
        .insert([{ user_id: userId }])
        .select()
        .single()

      if (error) return null
      return data
    } catch {
      return null
    }
  }

  // Stub methods for features that require new tables
  static async logAnalyticsEvent(userId: string, eventType: string, eventData?: any) {
    // Silently succeed if analytics table doesn't exist
    try {
      const { error } = await supabase
        .from('simple_analytics')
        .insert([{
          user_id: userId,
          event_type: eventType,
          event_data: eventData
        }])

      if (error) console.log('Analytics logging skipped - table not found')
    } catch {
      // Silently fail
    }
  }
}