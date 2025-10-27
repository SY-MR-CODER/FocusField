'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SimpleUser } from '@/lib/simpleAuth'

interface SimpleAuthContextType {
  user: SimpleUser | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (username: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signOut: () => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: () => {},
})

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext)
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('focusfield_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('focusfield_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string) => {
    const { simpleAuth } = await import('@/lib/simpleAuth')
    const { user: authUser, error } = await simpleAuth.signIn(username, password)
    
    if (authUser) {
      setUser(authUser)
      localStorage.setItem('focusfield_user', JSON.stringify(authUser))
    }
    
    return { error }
  }

  const signUp = async (username: string, password: string, displayName: string) => {
    const { simpleAuth } = await import('@/lib/simpleAuth')
    const { user: authUser, error } = await simpleAuth.signUp(username, password, displayName)
    
    if (authUser) {
      setUser(authUser)
      localStorage.setItem('focusfield_user', JSON.stringify(authUser))
    }
    
    return { error }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('focusfield_user')
  }

  return (
    <SimpleAuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}