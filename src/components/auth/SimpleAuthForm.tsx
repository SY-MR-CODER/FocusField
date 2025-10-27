'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Leaf, User, Lock } from 'lucide-react'

export default function SimpleAuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { simpleAuth } = await import('@/lib/simpleAuth')

      if (isLogin) {
        const { user, error } = await simpleAuth.signIn(username, password)
        if (error) throw new Error(error)
        if (user) {
          localStorage.setItem('focusfield_user', JSON.stringify(user))
          window.location.href = '/dashboard'
        }
      } else {
        if (!displayName.trim()) {
          throw new Error('Display name is required')
        }
        const { user, error } = await simpleAuth.signUp(username, password, displayName)
        if (error) throw new Error(error)
        if (user) {
          localStorage.setItem('focusfield_user', JSON.stringify(user))
          window.location.href = '/dashboard'
        }
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7F6] via-white to-[#A5D6A7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-[#5C946E] mr-2" />
            <h1 className="text-3xl font-bold text-[#1E2D2F]">FocusField</h1>
          </div>
          <p className="text-gray-600">Grow your productivity, one task at a time</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                isLogin
                  ? 'bg-[#5C946E] text-white'
                  : 'text-gray-500 hover:text-[#5C946E]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                !isLogin
                  ? 'bg-[#5C946E] text-white'
                  : 'text-gray-500 hover:text-[#5C946E]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C946E] focus:border-transparent"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C946E] focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C946E] focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {message && (
            <div className="mt-4 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}