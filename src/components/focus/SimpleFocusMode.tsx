'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SimpleFocusModeProps {
  isOpen: boolean
  onClose: () => void
  onSessionComplete: (session: any) => void
  userId: string
}

export default function SimpleFocusMode({ 
  isOpen, 
  onClose, 
  onSessionComplete,
  userId 
}: SimpleFocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [currentSession, setCurrentSession] = useState<any>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const durations = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ]

  // Initialize timer based on selected duration
  useEffect(() => {
    setTimeLeft(selectedDuration * 60)
  }, [selectedDuration])

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
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  const handleSessionComplete = () => {
    setIsRunning(false)
    
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completed: true,
        endTime: new Date(),
        duration: selectedDuration
      }
      onSessionComplete(completedSession)
    }

    // Show notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus session completed! 🎉', {
        body: 'Great job staying focused!',
        icon: '/favicon.ico'
      })
    }

    // Reset for next session
    setTimeLeft(selectedDuration * 60)
    setCurrentSession(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    const session = {
      id: Date.now().toString(),
      duration: selectedDuration,
      completed: false,
      startTime: new Date(),
      sessionType: 'focus',
      userId: userId
    }
    setCurrentSession(session)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(selectedDuration * 60)
    setCurrentSession(null)
  }

  const handleDurationChange = (duration: number) => {
    if (isRunning) return
    setSelectedDuration(duration)
  }

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {
          // Ignore audio play errors
        })
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100

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
            onError={() => {
              // Ignore audio errors
            }}
          >
            <source src="/focus-music.mp3" type="audio/mpeg" />
          </audio>

          {/* Header Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
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
              onClick={onClose}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <X className="h-6 w-6 text-dark-charcoal" />
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
                    stroke="url(#focusGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5C946E" />
                      <stop offset="100%" stopColor="#A5D6A7" />
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
                    {isRunning ? 'Focus Time' : 'Ready to Focus'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Duration Selection */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-4 mb-8"
            >
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => handleDurationChange(duration.value)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedDuration === duration.value
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-white/80 text-dark-charcoal hover:bg-white'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {duration.label}
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
                  Start Focus
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

            {/* Motivational Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center max-w-md"
            >
              <p className="text-lg text-gray-700 italic">
                "The successful warrior is the average person with laser-like focus."
              </p>
              <p className="text-sm text-gray-500 mt-2">- Bruce Lee</p>
            </motion.div>
          </div>

          {/* Floating Particles Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-accent/20 rounded-full"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                  y: typeof window !== 'undefined' ? window.innerHeight + 10 : 0,
                }}
                animate={{
                  y: -10,
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
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