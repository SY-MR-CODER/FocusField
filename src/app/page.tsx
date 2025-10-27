'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'
import SimpleAuthForm from '@/components/auth/SimpleAuthForm'

export default function Home() {
  const { user, loading } = useSimpleAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F7F6] via-white to-[#A5D6A7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C946E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FocusField...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return <SimpleAuthForm />
}