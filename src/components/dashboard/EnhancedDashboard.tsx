'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, Target, Clock, Zap, Settings, 
  Bell, User, Trophy, Leaf, Calendar,
  TrendingUp, Activity, Brain, Star
} from 'lucide-react'
import SmartTaskManager from '../tasks/SmartTaskManager'
import SimpleFocusMode from '../focus/SimpleFocusMode'
import AdvancedAchievementSystem from '../achievements/AdvancedAchievementSystem'
import SmartAnalyticsDashboard from '../analytics/SmartAnalyticsDashboard'
import GardenView from '../garden/GardenView'
import { Button } from '../ui/Button'
import { SimpleDataService as DataService } from '@/lib/simpleDataService'

interface DashboardTab {
  id: string
  name: string
  icon: any
  component: React.ComponentType<any>
}

interface EnhancedDashboardProps {
  user: {
    id: string
    username: string
    displayName: string
  }
}

export default function EnhancedDashboard({ user }: EnhancedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>()
  const [dashboardData, setDashboardData] = useState<any>({
    tasks: [],
    focusSessions: [],
    achievements: [],
    plants: [],
    userStats: {
      totalTasksCompleted: 0,
      totalFocusMinutes: 0,
      currentStreak: 0,
      bestStreak: 0,
      plantsGrown: 0,
      level: 1,
      experiencePoints: 0,
      achievementsUnlocked: 0
    },
    streakData: {
      current: 0,
      best: 0,
      history: []
    },
    plantGrowth: {
      totalPlants: 0,
      averageHealth: 0,
      growthRate: 0
    }
  })
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week')
  const [loading, setLoading] = useState(true)

  // Load real data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        

        const data = await DataService.getDashboardData(user.id)
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user.id) {
      loadDashboardData()
    }
  }, [user.id])

  // Refresh data when needed
  const refreshData = async () => {
    try {
      const data = await DataService.getDashboardData(user.id)
      setDashboardData(data)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      component: () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            <QuickStatsPanel userStats={dashboardData.userStats} />
            <RecentActivityPanel 
              tasks={dashboardData.tasks.slice(0, 3)} 
              focusSessions={dashboardData.focusSessions.slice(0, 3)} 
            />
          </div>
          
          {/* Garden Preview */}
          <div className="space-y-6">
            <GardenView 
              plants={dashboardData.plants}
              totalTasks={dashboardData.tasks.length}
              completedTasks={dashboardData.tasks.filter((t: any) => t.completed).length}
            />
            <QuickActionsPanel 
              onStartFocus={() => setIsFocusModeOpen(true)}
              onAddTask={() => setActiveTab('tasks')}
            />
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: Target,
      component: () => (
        <SmartTaskManager
          tasks={dashboardData.tasks}
          onAddTask={async (task) => {
            try {
              console.log('Adding task:', task)
              const result = await DataService.addTask(user.id, task)
              console.log('Task added successfully:', result)
              await refreshData()
            } catch (error) {
              console.error('Error adding task:', error)
              alert('Failed to add task. Please try again.')
            }
          }}
          onCompleteTask={async (taskId) => {
            try {
              const task = dashboardData.tasks.find((t: any) => t.id === taskId)
              if (task) {
                await DataService.completeTask(taskId)
                await DataService.handleTaskCompletion(user.id, task)
                await refreshData()
              }
            } catch (error) {
              console.error('Error completing task:', error)
            }
          }}
          onUpdateTask={async (taskId, updates) => {
            try {
              await DataService.updateTask(taskId, updates)
              await refreshData()
            } catch (error) {
              console.error('Error updating task:', error)
            }
          }}
        />
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      component: () => (
        <SmartAnalyticsDashboard
          data={{
            tasks: dashboardData.tasks.map((t: any) => ({
              ...t,
              createdAt: new Date(t.created_at),
              completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
              focusTime: t.actual_minutes || t.estimated_minutes || 25
            })),
            focusSessions: dashboardData.focusSessions.map((s: any) => ({
              ...s,
              startTime: new Date(s.started_at),
              endTime: s.completed_at ? new Date(s.completed_at) : undefined
            })),
            streakData: dashboardData.streakData,
            plantGrowth: dashboardData.plantGrowth
          }}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      )
    },
    {
      id: 'achievements',
      name: 'Achievements',
      icon: Trophy,
      component: () => (
        <AdvancedAchievementSystem
          userStats={dashboardData.userStats}
          achievements={dashboardData.achievements}
          onClaimReward={async (achievementId) => {
            try {
              // Log the reward claim
              await DataService.logAnalyticsEvent(user.id, 'achievement_claimed', { achievementId })
              console.log('Reward claimed for:', achievementId)
            } catch (error) {
              console.error('Error claiming reward:', error)
            }
          }}
        />
      )
    },
    {
      id: 'garden',
      name: 'Garden',
      icon: Leaf,
      component: () => (
        <div className="max-w-4xl mx-auto">
          <GardenView 
            plants={dashboardData.plants}
            totalTasks={dashboardData.tasks.length}
            completedTasks={dashboardData.tasks.filter((t: any) => t.completed).length}
          />
        </div>
      )
    }
  ]

  const handleFocusSessionComplete = async (session: any) => {
    try {
      // Complete the focus session in database
      await DataService.completeFocusSession(session.id, session.notes)
      
      // Log analytics event
      await DataService.logAnalyticsEvent(user.id, 'focus_session_completed', {
        duration: session.duration,
        session_type: session.sessionType,
        task_id: session.taskId
      })

      // Refresh dashboard data
      await refreshData()
      
      console.log('Focus session completed successfully')
    } catch (error) {
      console.error('Error handling focus session completion:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your enhanced dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-dark-charcoal">FocusField</h1>
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Level {dashboardData.userStats.level}</span>
                <span className="text-xs text-gray-500">
                  {dashboardData.userStats.experiencePoints} XP
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const activeTabData = tabs.find(tab => tab.id === activeTab)
              if (activeTabData) {
                const Component = activeTabData.component
                return <Component />
              }
              return null
            })()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Focus Mode */}
      <SimpleFocusMode
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        onSessionComplete={handleFocusSessionComplete}
        userId={user.id}
      />
    </div>
  )
}

// Helper Components
function QuickStatsPanel({ userStats }: { userStats: any }) {
  const stats = [
    {
      label: 'Tasks Completed',
      value: userStats.totalTasksCompleted,
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Focus Minutes',
      value: userStats.totalFocusMinutes,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Current Streak',
      value: userStats.currentStreak,
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Plants Grown',
      value: userStats.plantsGrown,
      icon: Leaf,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-dark-charcoal mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} rounded-xl p-4 text-center`}
            >
              <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function RecentActivityPanel({ tasks, focusSessions }: { tasks: any[], focusSessions: any[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-dark-charcoal mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{task.title}</div>
              <div className="text-sm text-gray-500">{task.category}</div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(task.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActionsPanel({ onStartFocus, onAddTask }: { onStartFocus: () => void, onAddTask: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-dark-charcoal mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button onClick={onStartFocus} className="w-full">
          <Clock className="h-4 w-4 mr-2" />
          Start Focus Session
        </Button>
        <Button onClick={onAddTask} variant="outline" className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>
    </div>
  )
}