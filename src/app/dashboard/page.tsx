'use client'

import { useState, useEffect } from 'react'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'
import Navbar from '@/components/layout/Navbar'
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'

export default function Dashboard() {
  const { user } = useSimpleAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Simulate loading time
      setTimeout(() => setLoading(false), 500)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your enhanced dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-charcoal mb-4">Please log in</h2>
            <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <EnhancedDashboard 
          user={{
            id: user.id,
            username: user.username,
            displayName: user.display_name || user.username
          }} 
        />
      </div>
    </div>
  )
}