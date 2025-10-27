'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, X, Volume2, VolumeX, 
  Coffee, Target, BarChart3, Settings, Timer 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FallbackDataService as DataService } from '@/lib/fallbackDataService'

interface FocusSession {
  id: string
  duration: number
  completed: boolean
  startTime: Date
  endTime?: Date
  sessionType: 'focus' | 'short_break' | 'long_break'
  taskId?: string
}

interface EnhancedFocusModeProps {
  isOpen: boolean
  onClose: () => void
  onSessionComplete: (session: any) => void
  selectedTaskId?: string
  userId: string
}

type SessionType = 'focus' | 'short_break' | 'long_break'
type PomodoroPhase = 'focus' | 'break'

interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

const defaultSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartFocus: false
}

export default function EnhancedFocusMode({ 
  isOpen, 
  onClose, 
  onSessionComplete,
  selectedTaskId,
  userId 
}: EnhancedFocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [currentSessionType, setCurrentSessionType] = useState<SessionType>('focus')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize timer based on session type
  useEffect(() => {
    const duration = getCurrentDuration()
    setTimeLeft(duration * 60)
  }, [currentSessionType, settings])

  const getCurrentDuration = () => {
    switch (currentSessionType) {
      case 'focus': return settings.focusDuration
      case 'short_break': return settings.shortBreakDuration
      case 'long_break': return settings.longBreakDuration
    }
  }

  const getNextSessionType = (): SessionType => {
    if (currentSessionType === 'focus') {
      const shouldTakeLongBreak = (completedSessions + 1) % settings.sessionsUntilLongBreak === 0
      return shouldTakeLongBreak ? 'long_break' : 'short_break'
    }
    return 'focus'
  }

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Notification permissions
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false)
    
    if (currentSession) {
      const completedSession: FocusSession = {
        ...currentSession,
        completed: true,
        endTime: new Date()
      }
      onSessionComplete(completedSession)
    }

    // Show notification
    const messages = {
      focus: 'Focus session completed! Time for a break 🎉',
      short_break: 'Break over! Ready to focus again? 💪',
      long_break: 'Long break finished! You\'re doing great! 🌟'
    }

    if (Notification.permission === 'granted') {
      new Notification(messages[currentSessionType], {
        body: currentSessionType === 'focus' 
          ? 'Great job staying focused!' 
          : 'Time to get back to work!',
        icon: '/favicon.ico'
      })
    }

    // Update completed sessions count
    if (currentSessionType === 'focus') {
      setCompletedSessions(prev => prev + 1)
    }

    // Auto-transition to next session
    const nextSessionType = getNextSessionType()
    const shouldAutoStart = currentSessionType === 'focus' 
      ? settings.autoStartBreaks 
      : settings.autoStartFocus

    if (shouldAutoStart) {
      setTimeout(() => {
        setCurrentSessionType(nextSessionType)
        handleStart()
      }, 3000) // 3 second delay
    } else {
      setCurrentSessionType(nextSessionType)
    }
  }, [currentSession, currentSessionType, settings, completedSessions, onSessionComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    try {
      setIsRunning(true)
      
      // Create focus session in database
      const dbSession = await DataService.createFocusSession(userId, {
        task_id: selectedTaskId,
        duration_minutes: getCurrentDuration(),
        session_type: currentSessionType
      })
      
      const session = {
        id: dbSession.id,
        duration: getCurrentDuration(),
        completed: false,
        startTime: new Date(),
        sessionType: currentSessionType,
        taskId: selectedTaskId
      }
      setCurrentSession(session)
    } catch (error) {
      console.error('Error starting focus session:', error)
      setIsRunning(false)
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(getCurrentDuration() * 60)
    setCurrentSession(null)
  }

  const handleSessionTypeChange = (type: SessionType) => {
    if (isRunning) return
    setCurrentSessionType(type)
  }

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const progress = ((getCurrentDuration() * 60 - timeLeft) / (getCurrentDuration() * 60)) * 100

  const sessionTypeConfig = {
    focus: {
      color: 'from-red-400 to-red-500',
      bgColor: 'from-red-50 to-red-100',
      icon: Target,
      label: 'Focus Time',
      description: 'Deep work session'
    },
    short_break: {
      color: 'from-green-400 to-green-500',
      bgColor: 'from-green-50 to-green-100',
      icon: Coffee,
      label: 'Short Break',
      description: 'Quick rest'
    },
    long_break: {
      color: 'from-blue-400 to-blue-500',
      bgColor: 'from-blue-50 to-blue-100',
      icon: Coffee,
      label: 'Long Break',
      description: 'Extended rest'
    }
  }

  const currentConfig = sessionTypeConfig[currentSessionType]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-green-200 via-white to-green-50"
        >
          {/* Background Audio */}
          <audio
            ref={audioRef}
            loop
            onPlay={() => setIsMusicPlaying(true)}
            onPause={() => setIsMusicPlaying(false)}
          >
            <source src="/focus-music.mp3" type="audio/mpeg" />
          </audio>

          {/* Header Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <div className="flex space-x-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleMusic}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                {isMusicPlaying ? (
                  <Volume2 className="h-6 w-6 text-accent" />
                ) : (
                  <VolumeX className="h-6 w-6 text-gray-600" />
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowStats(!showStats)}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Settings className="h-6 w-6 text-gray-600" />
              </motion.button>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClose}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <X className="h-6 w-6 text-dark-charcoal" />
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            {/* Session Type Indicator */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`bg-gradient-to-r ${currentConfig.bgColor} rounded-2xl p-4 mb-8 flex items-center space-x-3`}
            >
              <currentConfig.icon className="h-6 w-6 text-gray-700" />
              <div>
                <div className="font-semibold text-gray-800">{currentConfig.label}</div>
                <div className="text-sm text-gray-600">{currentConfig.description}</div>
              </div>
              <div className="bg-white rounded-full px-3 py-1 text-sm font-medium">
                Session {completedSessions + 1}
              </div>
            </motion.div>

            {/* Timer Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="relative mb-8">
                {/* Progress Ring */}
                <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={`url(#${currentSessionType}Gradient)`}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id={`${currentSessionType}Gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={currentConfig.color.split(' ')[0].replace('from-', '#')} />
                      <stop offset="100%" stopColor={currentConfig.color.split(' ')[2].replace('to-', '#')} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-bold text-dark-charcoal mb-2"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-lg text-gray-600">
                    {isRunning ? currentConfig.label : 'Ready to Start'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Session Type Selection */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-4 mb-8"
            >
              {Object.entries(sessionTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleSessionTypeChange(type as SessionType)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                    currentSessionType === type
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : 'bg-white/80 text-dark-charcoal hover:bg-white'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <config.icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Control Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex space-x-6"
            >
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Start Session
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <Pause className="h-6 w-6 mr-2" />
                  Pause
                </Button>
              )}

              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                <RotateCcw className="h-6 w-6 mr-2" />
                Reset
              </Button>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center space-x-2"
            >
              {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < completedSessions % settings.sessionsUntilLongBreak
                      ? 'bg-accent'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {completedSessions % settings.sessionsUntilLongBreak} / {settings.sessionsUntilLongBreak} until long break
              </span>
            </motion.div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-6">Pomodoro Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Focus Duration (minutes)</label>
                    <input
                      type="number"
                      value={settings.focusDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, focusDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="120"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Break (minutes)</label>
                    <input
                      type="number"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Long Break (minutes)</label>
                    <input
                      type="number"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Sessions until long break</label>
                    <input
                      type="number"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="2"
                      max="8"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-start breaks</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.autoStartFocus}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoStartFocus: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-start focus sessions</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-6">Session Stats</h3>
                
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-600">{completedSessions}</div>
                    <div className="text-sm text-gray-600">Focus Sessions Today</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(completedSessions / settings.sessionsUntilLongBreak)}
                    </div>
                    <div className="text-sm text-gray-600">Pomodoro Cycles</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {completedSessions * settings.focusDuration}
                    </div>
                    <div className="text-sm text-gray-600">Minutes Focused</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Particles Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r ${currentConfig.color} rounded-full opacity-30`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                }}
                animate={{
                  y: -10,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}