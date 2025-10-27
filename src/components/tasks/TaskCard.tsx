'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Task {
  id: string
  title: string
  description: string | null
  category: 'Work' | 'Study' | 'Personal'
  difficulty: 1 | 2 | 3
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  due_date?: string | null
  completed: boolean
  created_at: string
}

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  showScore?: boolean
  score?: number
}

const difficultyColors = {
  1: 'from-green-400 to-green-500',
  2: 'from-yellow-400 to-orange-500', 
  3: 'from-red-400 to-red-500'
}

const categoryColors = {
  Work: 'bg-blue-100 text-blue-800',
  Study: 'bg-purple-100 text-purple-800',
  Personal: 'bg-green-100 text-green-800'
}

const priorityColors = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800'
}

const priorityIcons = {
  Low: '⬇️',
  Medium: '➡️',
  High: '⬆️',
  Urgent: '🚨'
}

export default function TaskCard({ task, onComplete, showScore, score }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    await onComplete(task.id)
    setIsCompleting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-2xl shadow-lg border-t-4 bg-gradient-to-r ${difficultyColors[task.difficulty]} p-6 hover:shadow-xl transition-all duration-200 ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      {/* Difficulty indicator */}
      <div className={`h-1 w-full bg-gradient-to-r ${difficultyColors[task.difficulty]} rounded-full mb-4`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold text-dark-charcoal mb-2 ${
            task.completed ? 'line-through' : ''
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          )}
          
          <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[task.category]}`}>
              <Tag className="h-3 w-3 inline mr-1" />
              {task.category}
            </span>
            
            {task.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                {priorityIcons[task.priority]} {task.priority}
              </span>
            )}
            
            {task.due_date && (
              <span className={`text-xs flex items-center px-2 py-1 rounded-full ${
                new Date(task.due_date) < new Date() 
                  ? 'bg-red-100 text-red-700' 
                  : new Date(task.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 mb-4">
            <span className="text-xs text-gray-500">Difficulty:</span>
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= task.difficulty ? 'bg-accent' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          {showScore && score !== undefined && !isNaN(score) && (
            <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
              {Math.round(score)}
            </div>
          )}
          <button
            onClick={handleComplete}
            disabled={task.completed || isCompleting}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-gray-400 hover:text-accent" />
            )}
          </button>
        </div>
      </div>
      
      {task.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"
        >
          <p className="text-green-700 text-sm font-medium">
            🌱 Task completed! Your plant is growing!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}