'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { DataService } from '@/lib/dataService'

interface DataContextType {
  refreshData: () => Promise<void>
  isLoading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      // This will be called by components that need to refresh data
      // The actual data fetching is handled by individual components
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UX
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <DataContext.Provider value={{ refreshData, isLoading }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}