'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
}

export default function FocusMode({ isOpen, onClose }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(25)
  const audioRef = useRef<HTMLAudioElement>(null)

  const durations = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // Show completion notification
      if (Notification.permission === 'granted') {
        new Notification('Focus session completed! 🎉', {
          body: 'Great job staying focused!',
          icon: '/favicon.ico'
        })
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(selectedDuration * 60)
  }

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    setIsRunning(false)
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
          >
            <source src="/focus-music.mp3" type="audio/mpeg" />
            {/* Fallback for browsers that don't support MP3 */}
            Your browser does not support the audio element.
          </audio>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
          >
            <X className="h-6 w-6 text-dark-charcoal" />
          </motion.button>

          {/* Music Toggle */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={toggleMusic}
            className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
          >
            {isMusicPlaying ? (
              <Volume2 className="h-6 w-6 text-accent" />
            ) : (
              <VolumeX className="h-6 w-6 text-gray-600" />
            )}
          </motion.button>

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
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-accent/20 rounded-full"
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