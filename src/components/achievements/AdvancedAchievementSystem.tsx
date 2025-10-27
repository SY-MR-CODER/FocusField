'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Star, Target, Zap, Calendar, Clock, 
  Flame, Award, Crown, Medal, Gift, Sparkles,
  TrendingUp, CheckCircle2, Lock
} from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'tasks' | 'focus' | 'streaks' | 'garden' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary'
  requirement: number
  currentProgress: number
  unlocked: boolean
  unlockedAt?: Date
  reward: {
    type: 'xp' | 'plant_boost' | 'theme' | 'title' | 'feature'
    value: number | string
    description: string
  }
}

interface UserStats {
  totalTasksCompleted: number
  totalFocusMinutes: number
  currentStreak: number
  bestStreak: number
  plantsGrown: number
  level: number
  experiencePoints: number
  achievementsUnlocked: number
}

interface AdvancedAchievementSystemProps {
  userStats: UserStats
  achievements: Achievement[]
  onClaimReward: (achievementId: string) => void
}

const achievementTemplates: Omit<Achievement, 'id' | 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
  // Task Achievements
  {
    name: "First Steps",
    description: "Complete your first task",
    icon: "🎯",
    category: "tasks",
    tier: "bronze",
    requirement: 1,
    reward: { type: "xp", value: 50, description: "+50 XP" }
  },
  {
    name: "Getting Started",
    description: "Complete 10 tasks",
    icon: "✅",
    category: "tasks",
    tier: "bronze",
    requirement: 10,
    reward: { type: "xp", value: 100, description: "+100 XP" }
  },
  {
    name: "Task Master",
    description: "Complete 50 tasks",
    icon: "🏆",
    category: "tasks",
    tier: "silver",
    requirement: 50,
    reward: { type: "plant_boost", value: 20, description: "+20% plant growth" }
  },
  {
    name: "Productivity Guru",
    description: "Complete 100 tasks",
    icon: "👑",
    category: "tasks",
    tier: "gold",
    requirement: 100,
    reward: { type: "theme", value: "golden", description: "Golden theme unlocked" }
  },
  {
    name: "Task Legend",
    description: "Complete 500 tasks",
    icon: "⭐",
    category: "tasks",
    tier: "legendary",
    requirement: 500,
    reward: { type: "title", value: "Task Legend", description: "Legendary title" }
  },

  // Focus Achievements
  {
    name: "Focus Rookie",
    description: "Focus for 25 minutes",
    icon: "🎯",
    category: "focus",
    tier: "bronze",
    requirement: 25,
    reward: { type: "xp", value: 75, description: "+75 XP" }
  },
  {
    name: "Deep Work",
    description: "Focus for 5 hours total",
    icon: "🧠",
    category: "focus",
    tier: "silver",
    requirement: 300,
    reward: { type: "feature", value: "advanced_timer", description: "Advanced timer features" }
  },
  {
    name: "Focus Master",
    description: "Focus for 25 hours total",
    icon: "🔥",
    category: "focus",
    tier: "gold",
    requirement: 1500,
    reward: { type: "plant_boost", value: 50, description: "+50% plant growth" }
  },
  {
    name: "Zen Master",
    description: "Focus for 100 hours total",
    icon: "🧘",
    category: "focus",
    tier: "platinum",
    requirement: 6000,
    reward: { type: "theme", value: "zen", description: "Zen theme unlocked" }
  },

  // Streak Achievements
  {
    name: "Consistency",
    description: "Maintain a 3-day streak",
    icon: "📅",
    category: "streaks",
    tier: "bronze",
    requirement: 3,
    reward: { type: "xp", value: 100, description: "+100 XP" }
  },
  {
    name: "Habit Former",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streaks",
    tier: "silver",
    requirement: 7,
    reward: { type: "plant_boost", value: 25, description: "+25% plant health" }
  },
  {
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "⚡",
    category: "streaks",
    tier: "gold",
    requirement: 30,
    reward: { type: "feature", value: "streak_protection", description: "Streak protection (1 free miss)" }
  },
  {
    name: "Legend",
    description: "Maintain a 100-day streak",
    icon: "👑",
    category: "streaks",
    tier: "legendary",
    requirement: 100,
    reward: { type: "title", value: "Streak Legend", description: "Legendary streak title" }
  },

  // Garden Achievements
  {
    name: "Green Thumb",
    description: "Grow your first plant to 100%",
    icon: "🌱",
    category: "garden",
    tier: "bronze",
    requirement: 1,
    reward: { type: "xp", value: 150, description: "+150 XP" }
  },
  {
    name: "Gardener",
    description: "Grow 5 plants to maturity",
    icon: "🌿",
    category: "garden",
    tier: "silver",
    requirement: 5,
    reward: { type: "plant_boost", value: 30, description: "+30% growth speed" }
  },
  {
    name: "Garden Master",
    description: "Grow 25 plants to maturity",
    icon: "🌳",
    category: "garden",
    tier: "gold",
    requirement: 25,
    reward: { type: "theme", value: "garden", description: "Garden paradise theme" }
  },

  // Special Achievements
  {
    name: "Night Owl",
    description: "Complete a task after 10 PM",
    icon: "🦉",
    category: "special",
    tier: "bronze",
    requirement: 1,
    reward: { type: "xp", value: 50, description: "+50 XP" }
  },
  {
    name: "Early Bird",
    description: "Complete a task before 6 AM",
    icon: "🐦",
    category: "special",
    tier: "bronze",
    requirement: 1,
    reward: { type: "xp", value: 50, description: "+50 XP" }
  },
  {
    name: "Weekend Warrior",
    description: "Complete 10 tasks on weekends",
    icon: "⚔️",
    category: "special",
    tier: "silver",
    requirement: 10,
    reward: { type: "plant_boost", value: 15, description: "+15% weekend bonus" }
  },
  {
    name: "Perfectionist",
    description: "Complete all daily tasks for 7 days",
    icon: "💎",
    category: "special",
    tier: "platinum",
    requirement: 7,
    reward: { type: "feature", value: "perfect_day_bonus", description: "Perfect day XP bonus" }
  }
]

const tierColors = {
  bronze: { bg: 'from-amber-100 to-orange-100', border: 'border-amber-300', text: 'text-amber-700' },
  silver: { bg: 'from-gray-100 to-slate-100', border: 'border-gray-300', text: 'text-gray-700' },
  gold: { bg: 'from-yellow-100 to-amber-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  platinum: { bg: 'from-purple-100 to-indigo-100', border: 'border-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'from-pink-100 to-red-100', border: 'border-pink-400', text: 'text-pink-700' }
}

const categoryIcons = {
  tasks: Target,
  focus: Clock,
  streaks: Flame,
  garden: Sparkles,
  special: Star
}

export default function AdvancedAchievementSystem({ 
  userStats, 
  achievements: userAchievements, 
  onClaimReward 
}: AdvancedAchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  // Generate achievements with current progress
  const allAchievements = useMemo(() => {
    return achievementTemplates.map((template, index) => {
      const existing = userAchievements.find(a => a.name === template.name)
      
      let currentProgress = 0
      switch (template.category) {
        case 'tasks':
          currentProgress = userStats.totalTasksCompleted
          break
        case 'focus':
          currentProgress = userStats.totalFocusMinutes
          break
        case 'streaks':
          currentProgress = Math.max(userStats.currentStreak, userStats.bestStreak)
          break
        case 'garden':
          currentProgress = userStats.plantsGrown
          break
        case 'special':
          currentProgress = existing?.currentProgress || 0
          break
      }

      const unlocked = currentProgress >= template.requirement
      
      return {
        ...template,
        id: existing?.id || `achievement_${index}`,
        currentProgress,
        unlocked,
        unlockedAt: existing?.unlockedAt || (unlocked ? new Date() : undefined)
      }
    })
  }, [userStats, userAchievements])

  // Check for newly unlocked achievements
  useEffect(() => {
    const newUnlocked = allAchievements
      .filter(a => a.unlocked && !userAchievements.find(ua => ua.id === a.id && ua.unlocked))
      .map(a => a.id)
    
    if (newUnlocked.length > 0) {
      setNewlyUnlocked(newUnlocked)
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNewlyUnlocked([])
      }, 5000)
    }
  }, [allAchievements, userAchievements])

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(achievement => {
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false
      }
      if (showUnlockedOnly && !achievement.unlocked) {
        return false
      }
      return true
    })
  }, [allAchievements, selectedCategory, showUnlockedOnly])

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const total = allAchievements.length
    const unlocked = allAchievements.filter(a => a.unlocked).length
    const percentage = Math.round((unlocked / total) * 100)
    
    return { total, unlocked, percentage }
  }, [allAchievements])

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'tasks', name: 'Tasks', icon: Target },
    { id: 'focus', name: 'Focus', icon: Clock },
    { id: 'streaks', name: 'Streaks', icon: Flame },
    { id: 'garden', name: 'Garden', icon: Sparkles },
    { id: 'special', name: 'Special', icon: Star }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-charcoal flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
            Achievements
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{progressStats.unlocked}</div>
            <div className="text-sm text-gray-600">of {progressStats.total} unlocked</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{progressStats.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressStats.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Show Unlocked Toggle */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Show unlocked only</span>
        </label>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const tierConfig = tierColors[achievement.tier]
            const CategoryIcon = categoryIcons[achievement.category]
            const progress = Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)
            const isNewlyUnlocked = newlyUnlocked.includes(achievement.id)

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-to-br ${tierConfig.bg} rounded-2xl p-6 border-2 ${tierConfig.border} relative overflow-hidden ${
                  achievement.unlocked ? 'shadow-lg' : 'opacity-75'
                } ${isNewlyUnlocked ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}`}
              >
                {/* Tier Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${tierConfig.text} bg-white/80`}>
                  {achievement.tier.toUpperCase()}
                </div>

                {/* Lock Overlay */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                    <Lock className="h-12 w-12 text-gray-600" />
                  </div>
                )}

                {/* New Achievement Glow */}
                {isNewlyUnlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="flex items-start space-x-4 mb-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${tierConfig.text} mb-1`}>
                      {achievement.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <CategoryIcon className="h-3 w-3" />
                      <span>{achievement.category}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">
                      {achievement.currentProgress} / {achievement.requirement}
                    </span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        achievement.unlocked 
                          ? 'from-green-400 to-green-500' 
                          : 'from-blue-400 to-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="bg-white/80 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Reward</span>
                  </div>
                  <p className="text-xs text-gray-600">{achievement.reward.description}</p>
                  
                  {achievement.unlocked && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onClaimReward(achievement.id)}
                      className="mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      Claim Reward
                    </motion.button>
                  )}
                </div>

                {/* Unlocked Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No achievements found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}

      {/* Newly Unlocked Notification */}
      <AnimatePresence>
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-2xl max-w-sm z-50"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="h-6 w-6" />
              <h4 className="font-bold">Achievement Unlocked!</h4>
            </div>
            <p className="text-sm opacity-90">
              You've unlocked {newlyUnlocked.length} new achievement{newlyUnlocked.length > 1 ? 's' : ''}!
            </p>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-400/20 rounded-2xl"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}