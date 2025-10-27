'use client'

import { motion } from 'framer-motion'
import { Calendar, Flame, Trophy } from 'lucide-react'

interface StreakData {
  current_streak: number
  best_streak: number
  last_activity_date: string
}

interface StreakTrackerProps {
  streakData: StreakData | null
  todayTasksCompleted: number
}

export default function StreakTracker({ streakData, todayTasksCompleted }: StreakTrackerProps) {
  const currentStreak = streakData?.current_streak || 0
  const bestStreak = streakData?.best_streak || 0
  
  // Calculate progress ring
  const circumference = 2 * Math.PI * 45
  const progress = Math.min(todayTasksCompleted / 3, 1) // Assuming 3 tasks per day target
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress * circumference)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-dark-charcoal">Daily Progress</h2>
        <Calendar className="h-5 w-5 text-accent" />
      </div>

      <div className="space-y-6">
        {/* Progress Ring */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5C946E" />
                  <stop offset="100%" stopColor="#A5D6A7" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-2xl font-bold text-dark-charcoal"
              >
                {todayTasksCompleted}
              </motion.div>
              <div className="text-sm text-gray-600">tasks today</div>
            </div>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-orange-500 mr-1" />
              <span className="text-sm font-medium text-gray-700">Current</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
            <div className="text-xs text-gray-600">day streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-gray-700">Best</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{bestStreak}</div>
            <div className="text-xs text-gray-600">day streak</div>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 text-center border border-accent/20"
        >
          <p className="text-sm text-dark-charcoal font-medium">
            {todayTasksCompleted === 0
              ? "Start your day with a task! 🌱"
              : todayTasksCompleted < 3
              ? `Great start! ${3 - todayTasksCompleted} more to go! 💪`
              : "Amazing work today! Keep it up! 🎉"}
          </p>
        </motion.div>

        {/* Weekly Calendar Preview */}
        <div>
          <h3 className="text-sm font-medium text-dark-charcoal mb-3">This Week</h3>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
              const isToday = index === new Date().getDay()
              const hasActivity = Math.random() > 0.5 // Placeholder - replace with actual data
              
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                    isToday
                      ? 'bg-accent text-white'
                      : hasActivity
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}