'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Target, Leaf, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MobileNavProps {
  currentPage: 'dashboard' | 'focus' | 'garden' | 'profile'
  onPageChange: (page: string) => void
}

export default function MobileNav({ currentPage, onPageChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'focus', label: 'Focus Mode', icon: Target },
    { id: 'garden', label: 'Garden', icon: Leaf },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg"
      >
        <Menu className="h-6 w-6 text-dark-charcoal" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Leaf className="h-8 w-8 text-accent mr-2" />
                  <span className="text-xl font-bold text-dark-charcoal">FocusField</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-sage-green rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-charcoal">
                      {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-6">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPage === item.id

                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            onPageChange(item.id)
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-accent text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Sign Out Button */}
              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}