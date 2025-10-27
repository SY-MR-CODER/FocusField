'use client'

import { motion } from 'framer-motion'
import { Plus, Target, Calendar, BarChart3, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QuickActionsProps {
  onAddTask: () => void
  onFocusMode: () => void
  onViewStats: () => void
  onClearCompleted: () => void
  completedTasksCount: number
}

export default function QuickActions({ 
  onAddTask, 
  onFocusMode, 
  onViewStats, 
  onClearCompleted,
  completedTasksCount 
}: QuickActionsProps) {
  const quickActions = [
    {
      icon: Plus,
      label: 'Add Task',
      color: 'from-green-500 to-green-600',
      onClick: onAddTask,
    },
    {
      icon: Target,
      label: 'Focus Mode',
      color: 'from-blue-500 to-blue-600',
      onClick: onFocusMode,
    },
    {
      icon: BarChart3,
      label: 'View Stats',
      color: 'from-purple-500 to-purple-600',
      onClick: onViewStats,
    },
    {
      icon: Calendar,
      label: 'Today\'s Goals',
      color: 'from-orange-500 to-orange-600',
      onClick: () => {
        // Could open a today's goals modal
        console.log('Today\'s goals clicked')
      },
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#1E2D2F]">Quick Actions</h2>
        {completedTasksCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear {completedTasksCount} completed</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              className={`relative overflow-hidden bg-gradient-to-r ${action.color} text-white p-4 rounded-xl hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
          )
        })}
      </div>

      {/* Daily Goal Progress */}
      <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-800">Daily Goal</span>
          <span className="text-xs text-indigo-600">3 tasks</span>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((completedTasksCount / 3) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
          />
        </div>
        <div className="text-xs text-indigo-600 mt-1">
          {completedTasksCount >= 3 ? '🎉 Goal achieved!' : `${3 - completedTasksCount} tasks to go`}
        </div>
      </div>
    </div>
  )
}