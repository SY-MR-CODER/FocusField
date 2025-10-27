'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface PlantSVGProps {
  growthStage: number // 0-100
  healthLevel: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
}

export default function PlantSVG({ growthStage, healthLevel, size = 'md', animate = true }: PlantSVGProps) {
  // Memoize expensive calculations
  const plantData = useMemo(() => {
    const stemHeight = Math.max(20, (growthStage / 100) * 60)
    const leafCount = Math.min(Math.floor((growthStage / 100) * 4) + 1, 4) // Reduced from 6 to 4 leaves max
    const leafOpacity = Math.max(0.4, healthLevel / 100)
    const leafColor = healthLevel > 70 ? '#4ade80' : healthLevel > 40 ? '#facc15' : '#f87171'
    
    return { stemHeight, leafCount, leafOpacity, leafColor }
  }, [growthStage, healthLevel])

  // Pre-calculate leaf positions to avoid recalculation on each render
  const leaves = useMemo(() => {
    const leafElements = []
    for (let i = 0; i < plantData.leafCount; i++) {
      const angle = (i * 90) - 45 // Spread leaves more evenly
      const leafY = 85 - (plantData.stemHeight * (0.4 + (i * 0.2)))
      const leafX = 50 + Math.sin((angle * Math.PI) / 180) * 12
      
      leafElements.push({
        id: i,
        x: leafX,
        y: leafY,
        angle
      })
    }
    return leafElements
  }, [plantData.leafCount, plantData.stemHeight])

  return (
    <div className={`${sizeClasses[size]} flex items-end justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pot - no animation for instant load */}
        <path
          d="M25 85 L75 85 L70 95 L30 95 Z"
          fill="#8B4513"
          stroke="#654321"
          strokeWidth="1"
        />
        
        {/* Soil - no animation for instant load */}
        <ellipse
          cx="50"
          cy="85"
          rx="22"
          ry="3"
          fill="#4a5568"
        />

        {/* Stem - simplified animation */}
        {animate ? (
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            x1="50"
            y1="85"
            x2="50"
            y2={85 - plantData.stemHeight}
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          <line
            x1="50"
            y1="85"
            x2="50"
            y2={85 - plantData.stemHeight}
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Leaves - simplified shapes for better performance */}
        {leaves.map((leaf, index) => {
          const LeafComponent = animate ? motion.ellipse : 'ellipse'
          
          return (
            <LeafComponent
              key={leaf.id}
              {...(animate ? {
                initial: { scale: 0, opacity: 0 },
                animate: { scale: 1, opacity: plantData.leafOpacity },
                transition: { duration: 0.4, delay: 0.3 + index * 0.1 }
              } : {})}
              cx={leaf.x}
              cy={leaf.y}
              rx="6"
              ry="3"
              fill={plantData.leafColor}
              opacity={plantData.leafOpacity}
              transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`}
            />
          )
        })}

        {/* Flower - simplified version */}
        {growthStage > 80 && (
          <g>
            <circle
              cx="50"
              cy={85 - plantData.stemHeight - 5}
              r="4"
              fill="#fbbf24"
            />
            {/* Simplified petals - just 4 circles instead of complex ellipses */}
            <circle cx="46" cy={85 - plantData.stemHeight - 5} r="2" fill="#f472b6" />
            <circle cx="54" cy={85 - plantData.stemHeight - 5} r="2" fill="#f472b6" />
            <circle cx="50" cy={85 - plantData.stemHeight - 9} r="2" fill="#f472b6" />
            <circle cx="50" cy={85 - plantData.stemHeight - 1} r="2" fill="#f472b6" />
          </g>
        )}

        {/* Sparkles - only show for very healthy plants and reduce count */}
        {healthLevel > 90 && (
          <>
            <circle cx="35" cy="30" r="1" fill="#fbbf24" opacity="0.8" />
            <circle cx="65" cy="25" r="1" fill="#fbbf24" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  )
}