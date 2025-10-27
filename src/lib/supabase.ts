import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: 'Work' | 'Study' | 'Personal'
          difficulty: 1 | 2 | 3
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: 'Work' | 'Study' | 'Personal'
          difficulty: 1 | 2 | 3
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: 'Work' | 'Study' | 'Personal'
          difficulty?: 1 | 2 | 3
          completed?: boolean
          created_at?: string
        }
      }
      plants: {
        Row: {
          id: string
          user_id: string
          growth_stage: number
          health_level: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          growth_stage?: number
          health_level?: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          growth_stage?: number
          health_level?: number
          last_updated?: string
        }
      }
      streaks: {
        Row: {
          user_id: string
          current_streak: number
          best_streak: number
          last_activity_date: string
        }
        Insert: {
          user_id: string
          current_streak?: number
          best_streak?: number
          last_activity_date?: string
        }
        Update: {
          user_id?: string
          current_streak?: number
          best_streak?: number
          last_activity_date?: string
        }
      }
    }
  }
}