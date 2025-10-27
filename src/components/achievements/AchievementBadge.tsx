'use client'

import { motion } from 'framer-motion'

interface Achievement {
  id: string
  achievement_type: string
  achievement_name: string
  description: string
  icon: string
  unlocked_at: string
}

interface AchievementBadgeProps {
  achievement: Achievement
  isNew?: boolean
}

export default function AchievementBadge({ achievement, isNew = false }: AchievementBadgeProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180 } : { scale: 1 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.6 
      }}
      className={`relative bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 border-2 border-yellow-300 ${
        isNew ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
      }`}
    >
      {isNew && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
        >
          NEW!
        </motion.div>
      )}
      
      <div className="text-center">
        <div className="text-3xl mb-2">{achievement.icon}</div>
        <h3 className="font-bold text-yellow-800 text-sm mb-1">
          {achievement.achievement_name}
        </h3>
        <p className="text-yellow-700 text-xs">
          {achievement.description}
        </p>
        <div className="text-xs text-yellow-600 mt-2">
          {new Date(achievement.unlocked_at).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  )
}