'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import PlantSVG from './PlantSVG'

interface Plant {
  id: string
  growth_stage: number
  health_level: number
  last_updated: string
}

interface GardenViewProps {
  plants: Plant[]
  totalTasks: number
  completedTasks: number
}

export default function GardenView({ plants, totalTasks, completedTasks }: GardenViewProps) {
  // Memoize average health calculation for performance
  const averageHealth = useMemo(() => {
    if (plants.length === 0) return 0
    return Math.round(plants.reduce((acc, plant) => acc + plant.health_level, 0) / plants.length)
  }, [plants])

  // Limit plants shown for better performance
  const displayedPlants = useMemo(() => plants.slice(0, 6), [plants])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1E2D2F]">Your Garden 🌱</h2>
        <div className="text-sm text-gray-600">
          {completedTasks} / {totalTasks} tasks completed
        </div>
      </div>

      {plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🌱</span>
          </div>
          <h3 className="text-lg font-medium text-[#1E2D2F] mb-2">
            Your garden is empty
          </h3>
          <p className="text-gray-600 text-sm">
            Complete tasks to grow beautiful plants!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Garden Stats - no animation for instant load */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#5C946E]">{plants.length}</div>
              <div className="text-sm text-gray-600">Plants Growing</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{averageHealth}%</div>
              <div className="text-sm text-gray-600">Avg Health</div>
            </div>
          </div>

          {/* Plants Grid - optimized for performance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {displayedPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }} // Faster, shorter delays
                className="bg-gradient-to-b from-sky-50 to-green-50 rounded-xl p-4 text-center border border-green-100"
              >
                <PlantSVG
                  growthStage={plant.growth_stage}
                  healthLevel={plant.health_level}
                  size="md"
                  animate={index < 3} // Only animate first 3 plants for performance
                />
                
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Growth</span>
                    <span>{plant.growth_stage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${plant.growth_stage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Health</span>
                    <span>{plant.health_level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        plant.health_level > 70
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : plant.health_level > 40
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${plant.health_level}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Show "more plants" indicator if there are more than 6 */}
            {plants.length > 6 && (
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200 flex items-center justify-center">
                <div className="text-gray-500">
                  <div className="text-lg font-bold">+{plants.length - 6}</div>
                  <div className="text-xs">more plants</div>
                </div>
              </div>
            )}
          </div>

          {/* Garden Tips - simplified */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <h3 className="font-medium text-[#1E2D2F] mb-2">🌿 Garden Tips</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Complete tasks regularly to keep plants healthy</div>
              <div>• Higher difficulty tasks grow plants faster</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}