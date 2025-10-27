import { supabase } from './supabase'

export interface SimpleUser {
  id: string
  username: string
  display_name: string
  created_at: string
}

// Simple hash function for passwords (not cryptographically secure, but simple)
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export const simpleAuth = {
  async signUp(username: string, password: string, displayName: string): Promise<{ user: SimpleUser | null; error: string | null }> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('simple_users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser) {
        return { user: null, error: 'Username already exists' }
      }

      // Hash password (simple hash for demo purposes)
      const hashedPassword = simpleHash(password + username)

      // Create user
      const { data: user, error } = await supabase
        .from('simple_users')
        .insert([
          {
            username: username.toLowerCase(),
            password_hash: hashedPassword,
            display_name: displayName,
          },
        ])
        .select('id, username, display_name, created_at')
        .single()

      if (error) throw error

      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  async signIn(username: string, password: string): Promise<{ user: SimpleUser | null; error: string | null }> {
    try {
      // Hash the provided password
      const hashedPassword = simpleHash(password + username.toLowerCase())

      // Get user by username and password
      const { data: userData, error } = await supabase
        .from('simple_users')
        .select('id, username, display_name, created_at')
        .eq('username', username.toLowerCase())
        .eq('password_hash', hashedPassword)
        .single()

      if (error || !userData) {
        return { user: null, error: 'Invalid username or password' }
      }

      return { user: userData, error: null }
    } catch (error: any) {
      return { user: null, error: 'Invalid username or password' }
    }
  },
}