'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, Clock, Target, Calendar, 
  Zap, Brain, Leaf, Award, Filter, Download,
  ChevronUp, ChevronDown, Activity, PieChart
} from 'lucide-react'

interface TaskData {
  id: string
  title: string
  category: 'Work' | 'Study' | 'Personal'
  difficulty: 1 | 2 | 3
  completed: boolean
  completedAt?: Date
  createdAt: Date
  focusTime?: number
}

interface FocusSession {
  id: string
  duration: number
  completed: boolean
  startTime: Date
  endTime?: Date
  taskId?: string
}

interface AnalyticsData {
  tasks: TaskData[]
  focusSessions: FocusSession[]
  streakData: {
    current: number
    best: number
    history: { date: string; completed: boolean }[]
  }
  plantGrowth: {
    totalPlants: number
    averageHealth: number
    growthRate: number
  }
}

interface SmartAnalyticsDashboardProps {
  data: AnalyticsData
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void
}

export default function SmartAnalyticsDashboard({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}: SmartAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')
  const [showInsights, setShowInsights] = useState(true)

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }
    return { start: ranges[timeRange], end: now }
  }, [timeRange])

  // Filter data by time range
  const filteredData = useMemo(() => {
    const tasks = data.tasks.filter(task => 
      task.createdAt >= dateRange.start && task.createdAt <= dateRange.end
    )
    const sessions = data.focusSessions.filter(session => 
      session.startTime >= dateRange.start && session.startTime <= dateRange.end
    )
    return { ...data, tasks, focusSessions: sessions }
  }, [data, dateRange])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const completedTasks = filteredData.tasks.filter(t => t.completed)
    const totalFocusTime = filteredData.focusSessions
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.duration, 0)
    
    const avgTasksPerDay = completedTasks.length / Math.max(1, 
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    )
    
    const avgFocusPerDay = totalFocusTime / Math.max(1,
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    )

    // Productivity score (0-100)
    const taskScore = Math.min(avgTasksPerDay * 20, 40) // Max 40 points for tasks
    const focusScore = Math.min(avgFocusPerDay / 60 * 30, 30) // Max 30 points for focus (1hr = 30pts)
    const streakScore = Math.min(data.streakData.current * 2, 30) // Max 30 points for streaks
    const productivityScore = Math.round(taskScore + focusScore + streakScore)

    // Category breakdown
    const categoryStats = ['Work', 'Study', 'Personal'].map(category => {
      const categoryTasks = completedTasks.filter(t => t.category === category)
      return {
        category,
        count: categoryTasks.length,
        percentage: completedTasks.length > 0 ? (categoryTasks.length / completedTasks.length) * 100 : 0
      }
    })

    // Difficulty breakdown
    const difficultyStats = [1, 2, 3].map(difficulty => {
      const difficultyTasks = completedTasks.filter(t => t.difficulty === difficulty)
      return {
        difficulty,
        count: difficultyTasks.length,
        percentage: completedTasks.length > 0 ? (difficultyTasks.length / completedTasks.length) * 100 : 0
      }
    })

    // Weekly pattern
    const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
      const dayTasks = completedTasks.filter(task => {
        const taskDay = task.completedAt?.getDay() || task.createdAt.getDay()
        return taskDay === i
      })
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        tasks: dayTasks.length,
        focusTime: filteredData.focusSessions
          .filter(s => s.startTime.getDay() === i && s.completed)
          .reduce((sum, s) => sum + s.duration, 0)
      }
    })

    return {
      totalTasks: filteredData.tasks.length,
      completedTasks: completedTasks.length,
      completionRate: filteredData.tasks.length > 0 ? (completedTasks.length / filteredData.tasks.length) * 100 : 0,
      totalFocusTime,
      avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
      avgFocusPerDay: Math.round(avgFocusPerDay),
      productivityScore,
      categoryStats,
      difficultyStats,
      weeklyPattern,
      streakData: data.streakData
    }
  }, [filteredData, dateRange, data.streakData])

  // Generate insights
  const insights = useMemo(() => {
    const insights = []

    // Productivity insights
    if (metrics.productivityScore >= 80) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Excellent Productivity!',
        description: `Your productivity score of ${metrics.productivityScore} is outstanding. Keep up the great work!`
      })
    } else if (metrics.productivityScore >= 60) {
      insights.push({
        type: 'good',
        icon: '👍',
        title: 'Good Progress',
        description: `You're doing well with a productivity score of ${metrics.productivityScore}. Consider increasing focus time for even better results.`
      })
    } else {
      insights.push({
        type: 'improvement',
        icon: '💡',
        title: 'Room for Growth',
        description: `Your productivity score is ${metrics.productivityScore}. Try setting smaller, achievable goals to build momentum.`
      })
    }

    // Focus insights
    const avgFocusHours = metrics.avgFocusPerDay / 60
    if (avgFocusHours < 0.5) {
      insights.push({
        type: 'suggestion',
        icon: '🎯',
        title: 'Increase Focus Time',
        description: `You're averaging ${Math.round(avgFocusHours * 60)} minutes of focus per day. Try to reach at least 25 minutes daily.`
      })
    } else if (avgFocusHours > 2) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Avoid Burnout',
        description: `You're focusing ${Math.round(avgFocusHours * 10) / 10} hours daily. Make sure to take regular breaks to avoid burnout.`
      })
    }

    // Best day insight
    const bestDay = metrics.weeklyPattern.reduce((best, day) => 
      day.tasks > best.tasks ? day : best
    )
    if (bestDay.tasks > 0) {
      insights.push({
        type: 'info',
        icon: '📅',
        title: 'Peak Performance Day',
        description: `${bestDay.day} is your most productive day with ${bestDay.tasks} tasks completed on average.`
      })
    }

    // Category balance insight
    const dominantCategory = metrics.categoryStats.reduce((max, cat) => 
      cat.count > max.count ? cat : max
    )
    if (dominantCategory.percentage > 70) {
      insights.push({
        type: 'suggestion',
        icon: '⚖️',
        title: 'Balance Your Categories',
        description: `${dominantCategory.category} tasks make up ${Math.round(dominantCategory.percentage)}% of your work. Consider diversifying your task categories.`
      })
    }

    return insights
  }, [metrics])

  const metricCards = [
    {
      id: 'tasks',
      title: 'Tasks Completed',
      value: metrics.completedTasks,
      subtitle: `${Math.round(metrics.completionRate)}% completion rate`,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      id: 'focus',
      title: 'Focus Time',
      value: `${Math.round(metrics.totalFocusTime / 60)}h`,
      subtitle: `${metrics.avgFocusPerDay}min daily avg`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      change: '+8%'
    },
    {
      id: 'streak',
      title: 'Current Streak',
      value: metrics.streakData.current,
      subtitle: `Best: ${metrics.streakData.best} days`,
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      change: '+2'
    },
    {
      id: 'productivity',
      title: 'Productivity Score',
      value: metrics.productivityScore,
      subtitle: 'Out of 100',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      change: '+5%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-charcoal flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-500" />
            Analytics Dashboard
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${metric.color} rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => setSelectedMetric(metric.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8" />
                  <div className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {metric.change}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm opacity-90">{metric.title}</div>
                <div className="text-xs opacity-75 mt-1">{metric.subtitle}</div>
                
                {/* Background Pattern */}
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Icon className="h-24 w-24" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark-charcoal flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-500" />
            Smart Insights
          </h3>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {showInsights ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {showInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  insight.type === 'good' ? 'bg-blue-50 border-blue-400' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  insight.type === 'improvement' ? 'bg-red-50 border-red-400' :
                  'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Pattern Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-dark-charcoal mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Weekly Pattern
          </h3>
          <div className="space-y-3">
            {metrics.weeklyPattern.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="text-sm text-gray-700">{day.tasks} tasks</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(day.focusTime / 60)}h focus
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((day.tasks / Math.max(...metrics.weeklyPattern.map(d => d.tasks))) * 100, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-dark-charcoal mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-500" />
            Task Categories
          </h3>
          <div className="space-y-4">
            {metrics.categoryStats.map((category, index) => {
              const colors = ['from-blue-400 to-blue-500', 'from-purple-400 to-purple-500', 'from-green-400 to-green-500']
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-600">
                      {category.count} ({Math.round(category.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-dark-charcoal mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-red-500" />
          Task Difficulty Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.difficultyStats.map((difficulty, index) => {
            const labels = ['Easy', 'Medium', 'Hard']
            const colors = ['from-green-400 to-green-500', 'from-yellow-400 to-orange-500', 'from-red-400 to-red-500']
            return (
              <div key={difficulty.difficulty} className="text-center">
                <div className={`bg-gradient-to-r ${colors[index]} rounded-2xl p-6 text-white mb-3`}>
                  <div className="text-3xl font-bold">{difficulty.count}</div>
                  <div className="text-sm opacity-90">{labels[index]} Tasks</div>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(difficulty.percentage)}% of completed tasks
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}