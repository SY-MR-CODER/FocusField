import { supabase } from './supabase'

// Ultra-simple data service that only uses confirmed existing fields
export class SimpleDataService {
  // Tasks - only use fields we know exist
  static async getTasks(userId: string) {
    const { data, error } = await supabase
      .from('simple_tasks')
      .select('id, user_id, title, description, category, difficulty, completed, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
    return data || []
  }

  static async addTask(userId: string, task: {
    title: string
    description: string
    category: 'Work' | 'Study' | 'Personal'
    difficulty: 1 | 2 | 3
  }) {
    console.log('Adding task with data:', { ...task, user_id: userId })
    
    const { data, error } = await supabase
      .from('simple_tasks')
      .insert([{ 
        title: task.title,
        description: task.description,
        category: task.category,
        difficulty: task.difficulty,
        user_id: userId
      }])
      .select('id, user_id, title, description, category, difficulty, completed, created_at')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Task added successfully:', data)
    return data
  }

  static async completeTask(taskId: string) {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update({ completed: true })
      .eq('id', taskId)
      .select('id, user_id, title, description, category, difficulty, completed, created_at')
      .single()

    if (error) {
      console.error('Error completing task:', error)
      throw error
    }
    return data
  }

  static async updateTask(taskId: string, updates: any) {
    const { data, error } = await supabase
      .from('simple_tasks')
      .update(updates)
      .eq('id', taskId)
      .select('id, user_id, title, description, category, difficulty, completed, created_at')
      .single()

    if (error) {
      console.error('Error updating task:', error)
      throw error
    }
    return data
  }

  // Plants
  static async getPlants(userId: string) {
    const { data, error } = await supabase
      .from('simple_plants')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) {
      console.error('Error fetching plants:', error)
      throw error
    }
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

    if (error) {
      console.error('Error creating plant:', error)
      throw error
    }
    return data
  }

  static async updatePlant(plantId: string, updates: any) {
    const { data, error } = await supabase
      .from('simple_plants')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', plantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating plant:', error)
      throw error
    }
    return data
  }

  // Streaks
  static async getStreakData(userId: string) {
    const { data, error } = await supabase
      .from('simple_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching streak:', error)
      throw error
    }
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

      if (error) {
        console.error('Error creating streak:', error)
        throw error
      }
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

    if (error) {
      console.error('Error updating streak:', error)
      throw error
    }
    return data
  }

  // Dashboard data
  static async getDashboardData(userId: string) {
    try {
      console.log('Loading dashboard data for user:', userId)
      
      const [tasks, plants, streakData] = await Promise.all([
        this.getTasks(userId),
        this.getPlants(userId),
        this.getStreakData(userId).catch(() => null)
      ])

      console.log('Loaded data:', { tasks: tasks.length, plants: plants.length, streakData })

      const completedTasks = tasks.filter(t => t.completed).length

      return {
        tasks,
        plants,
        achievements: [], // Empty for now
        focusSessions: [], // Empty for now
        userStats: {
          totalTasksCompleted: completedTasks,
          totalFocusMinutes: 0,
          currentStreak: streakData?.current_streak || 0,
          bestStreak: streakData?.best_streak || 0,
          plantsGrown: plants.filter(p => p.growth_stage >= 100).length,
          level: Math.floor(completedTasks / 10) + 1,
          experiencePoints: completedTasks * 10,
          achievementsUnlocked: 0
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

  // Handle task completion
  static async handleTaskCompletion(userId: string, task: any) {
    try {
      console.log('Handling task completion for:', task.title)
      
      // Update streak
      await this.updateStreak(userId)

      // Handle plant growth
      const plants = await this.getPlants(userId)
      const growthAmount = task.difficulty * 20

      if (plants.length === 0) {
        console.log('Creating first plant')
        await this.createPlant(userId, growthAmount)
      } else {
        const currentPlant = plants[plants.length - 1]
        
        if (currentPlant.growth_stage >= 100) {
          console.log('Creating new plant - current one is fully grown')
          await this.createPlant(userId, growthAmount)
        } else {
          console.log('Updating existing plant growth')
          const newGrowthStage = Math.min(100, currentPlant.growth_stage + growthAmount)
          const newHealthLevel = Math.min(100, currentPlant.health_level + 10)
          
          await this.updatePlant(currentPlant.id, {
            growth_stage: newGrowthStage,
            health_level: newHealthLevel
          })
        }
      }
      
      console.log('Task completion handled successfully')
    } catch (error) {
      console.error('Error handling task completion:', error)
      // Don't throw - let task completion succeed even if plant growth fails
    }
  }

  // Stub methods for enhanced features
  static async createFocusSession(userId: string, session: any) {
    console.log('Focus session created (stub):', session)
    return {
      id: Date.now().toString(),
      user_id: userId,
      ...session,
      started_at: new Date().toISOString()
    }
  }

  static async completeFocusSession(sessionId: string, notes?: string) {
    console.log('Focus session completed (stub):', sessionId)
    return { id: sessionId, completed: true }
  }

  static async logAnalyticsEvent(userId: string, eventType: string, eventData?: any) {
    console.log('Analytics event (stub):', eventType, eventData)
  }

  static async getUserStats(userId: string) {
    return null
  }

  static async updateUserStats(userId: string, updates: any) {
    console.log('User stats update (stub):', updates)
    return null
  }
}