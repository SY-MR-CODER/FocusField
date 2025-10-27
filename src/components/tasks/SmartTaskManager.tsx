'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, Search, Calendar, Zap, Target, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'

interface Task {
  id: string
  title: string
  description: string | null
  category: 'Work' | 'Study' | 'Personal'
  difficulty: 1 | 2 | 3
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  due_date: string | null
  completed: boolean
  created_at: string
  estimated_minutes?: number
}

interface SmartTaskManagerProps {
  tasks: Task[]
  onAddTask: (task: {
    title: string
    description: string
    category: 'Work' | 'Study' | 'Personal'
    difficulty: 1 | 2 | 3
  }) => void
  onCompleteTask: (taskId: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

type SortOption = 'smart' | 'priority' | 'due_date' | 'difficulty' | 'created_at'
type FilterOption = 'all' | 'today' | 'overdue' | 'high_priority' | 'quick_wins'

export default function SmartTaskManager({ 
  tasks, 
  onAddTask, 
  onCompleteTask, 
  onUpdateTask 
}: SmartTaskManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('smart')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  // Smart scoring algorithm for task prioritization
  const calculateTaskScore = (task: Task): number => {
    let score = 0
    
    // Priority weight (40% of score) - fallback to Medium if not set
    const priorityWeights = { 'Urgent': 40, 'High': 30, 'Medium': 20, 'Low': 10 }
    const priority = task.priority || 'Medium'
    score += priorityWeights[priority] || 20 // Default to Medium priority
    
    // Due date urgency (30% of score)
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) score += 30 // Overdue
      else if (daysUntilDue === 0) score += 25 // Due today
      else if (daysUntilDue === 1) score += 20 // Due tomorrow
      else if (daysUntilDue <= 3) score += 15 // Due this week
      else score += 5 // Future
    } else {
      // No due date - give moderate score
      score += 10
    }
    
    // Difficulty impact (20% of score) - easier tasks get slight boost for momentum
    const difficultyWeights = { 1: 15, 2: 20, 3: 10 }
    score += difficultyWeights[task.difficulty] || 15 // Default to easy if undefined
    
    // Age factor (10% of score) - older tasks get slight boost
    const daysOld = Math.ceil((new Date().getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
    score += Math.min(Math.max(daysOld * 2, 0), 10) // Ensure non-negative
    
    // Ensure we return a valid number
    return isNaN(score) ? 0 : Math.max(score, 0)
  }

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!task.title.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false
        }
      }
      
      // Completion filter
      if (!showCompleted && task.completed) return false
      
      // Special filters
      switch (filterBy) {
        case 'today':
          return task.due_date === new Date().toISOString().split('T')[0]
        case 'overdue':
          return task.due_date && new Date(task.due_date) < new Date() && !task.completed
        case 'high_priority':
          return ['High', 'Urgent'].includes(task.priority)
        case 'quick_wins':
          return task.difficulty === 1 && !task.completed
        default:
          return true
      }
    })

    // Sort tasks
    switch (sortBy) {
      case 'smart':
        return filtered.sort((a, b) => calculateTaskScore(b) - calculateTaskScore(a))
      case 'priority':
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
        return filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      case 'due_date':
        return filtered.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
      case 'difficulty':
        return filtered.sort((a, b) => b.difficulty - a.difficulty)
      case 'created_at':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default:
        return filtered
    }
  }, [tasks, searchQuery, sortBy, filterBy, showCompleted])

  // Task statistics
  const stats = useMemo(() => {
    const incompleteTasks = tasks.filter(t => !t.completed)
    const overdueTasks = incompleteTasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date()
    )
    const todayTasks = incompleteTasks.filter(t => 
      t.due_date === new Date().toISOString().split('T')[0]
    )
    const urgentTasks = incompleteTasks.filter(t => t.priority === 'Urgent')
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      urgent: urgentTasks.length
    }
  }, [tasks])

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-charcoal">Smart Task Manager</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.today}</div>
            <div className="text-xs text-gray-600">Due Today</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.urgent}</div>
            <div className="text-xs text-gray-600">Urgent</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="smart">🧠 Smart Sort</option>
            <option value="priority">⚡ Priority</option>
            <option value="due_date">📅 Due Date</option>
            <option value="difficulty">🎯 Difficulty</option>
            <option value="created_at">🕒 Created</option>
          </select>

          {/* Filter Options */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Tasks</option>
            <option value="today">📅 Due Today</option>
            <option value="overdue">⚠️ Overdue</option>
            <option value="high_priority">🚨 High Priority</option>
            <option value="quick_wins">⚡ Quick Wins</option>
          </select>

          {/* Show Completed Toggle */}
          <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Completed</span>
          </label>
        </div>
      </div>

      {/* Smart Recommendations */}
      {sortBy === 'smart' && processedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
        >
          <h3 className="font-semibold text-dark-charcoal mb-3 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Smart Recommendations
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-xl p-3">
              <div className="font-medium text-blue-600 mb-1">🎯 Focus Next</div>
              <div className="text-gray-700">{processedTasks[0]?.title || 'No tasks'}</div>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="font-medium text-green-600 mb-1">⚡ Quick Win</div>
              <div className="text-gray-700">
                {processedTasks.find(t => t.difficulty === 1 && !t.completed)?.title || 'No easy tasks'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="font-medium text-red-600 mb-1">🚨 Urgent</div>
              <div className="text-gray-700">
                {processedTasks.find(t => t.priority === 'Urgent' && !t.completed)?.title || 'Nothing urgent'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {processedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <TaskCard
                task={task}
                onComplete={onCompleteTask}
                showScore={sortBy === 'smart'}
                score={sortBy === 'smart' ? calculateTaskScore(task) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {processedTasks.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your filters or add a new task</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddTask}
      />
    </div>
  )
}