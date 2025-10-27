'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'
import AchievementBadge from './AchievementBadge'

interface Achievement {
  id: string
  achievement_type: string
  achievement_name: string
  description: string
  icon: string
  unlocked_at: string
}

interface UserStats {
  total_tasks_completed: number
  total_focus_minutes: number
  longest_streak: number
  plants_grown: number
  level: number
  experience_points: number
}

export default function AchievementPanel() {
  const { user } = useSimpleAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchAchievements()
      fetchUserStats()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('unlocked_at', { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('simple_user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserStats(data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const checkAndUnlockAchievements = async (stats: UserStats) => {
    const achievementsToUnlock = []

    // First Task Achievement
    if (stats.total_tasks_completed >= 1 && !achievements.find(a => a.achievement_type === 'first_task')) {
      achievementsToUnlock.push({
        achievement_type: 'first_task',
        achievement_name: 'Getting Started',
        description: 'Completed your first task!',
        icon: '🌱'
      })
    }

    // Task Milestones
    if (stats.total_tasks_completed >= 10 && !achievements.find(a => a.achievement_type === 'task_10')) {
      achievementsToUnlock.push({
        achievement_type: 'task_10',
        achievement_name: 'Task Master',
        description: 'Completed 10 tasks!',
        icon: '⭐'
      })
    }

    if (stats.total_tasks_completed >= 50 && !achievements.find(a => a.achievement_type === 'task_50')) {
      achievementsToUnlock.push({
        achievement_type: 'task_50',
        achievement_name: 'Productivity Pro',
        description: 'Completed 50 tasks!',
        icon: '🏆'
      })
    }

    // Streak Achievements
    if (stats.longest_streak >= 7 && !achievements.find(a => a.achievement_type === 'streak_7')) {
      achievementsToUnlock.push({
        achievement_type: 'streak_7',
        achievement_name: 'Week Warrior',
        description: '7-day streak achieved!',
        icon: '🔥'
      })
    }

    // Focus Time Achievements
    if (stats.total_focus_minutes >= 60 && !achievements.find(a => a.achievement_type === 'focus_60')) {
      achievementsToUnlock.push({
        achievement_type: 'focus_60',
        achievement_name: 'Focus Master',
        description: '1 hour of focus time!',
        icon: '🎯'
      })
    }

    // Unlock new achievements
    for (const achievement of achievementsToUnlock) {
      try {
        const { data, error } = await supabase
          .from('simple_achievements')
          .insert([{
            user_id: user?.id,
            ...achievement
          }])
          .select()
          .single()

        if (error) throw error
        
        setAchievements(prev => [data, ...prev])
        setNewAchievements(prev => [...prev, data.id])
        
        // Remove "NEW" indicator after 5 seconds
        setTimeout(() => {
          setNewAchievements(prev => prev.filter(id => id !== data.id))
        }, 5000)
      } catch (error) {
        console.error('Error unlocking achievement:', error)
      }
    }
  }

  // Call this function when user completes tasks, focuses, etc.
  useEffect(() => {
    if (userStats) {
      checkAndUnlockAchievements(userStats)
    }
  }, [userStats])

  if (!userStats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
          <h2 className="text-xl font-bold text-[#1E2D2F]">Achievements</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
          <h2 className="text-xl font-bold text-[#1E2D2F]">Achievements</h2>
        </div>
        <div className="text-sm text-gray-600">
          Level {userStats.level} • {userStats.experience_points} XP
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{userStats.total_tasks_completed}</div>
          <div className="text-xs text-blue-700">Tasks Completed</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-orange-600">{userStats.longest_streak}</div>
          <div className="text-xs text-orange-700">Best Streak</div>
        </div>
      </div>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Complete tasks to unlock achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isNew={newAchievements.includes(achievement.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}