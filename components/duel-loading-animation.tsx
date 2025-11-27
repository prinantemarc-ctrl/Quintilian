"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"

interface DuelLoadingAnimationProps {
  brand1: string
  brand2: string
}

export function DuelLoadingAnimation({ brand1, brand2 }: DuelLoadingAnimationProps) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 3)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const getInitial = (name: string) => {
    const parts = name.trim().split(/\s+/)
    return parts.length > 0 ? parts[0].charAt(0).toUpperCase() : "?"
  }

  return (
    <div className="relative w-full min-h-[400px] flex items-center justify-center p-8">
      <div className="flex items-center justify-center gap-12 w-full max-w-5xl">
        {/* Brand 1 - Left side */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            {/* Animated circles */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse"
                style={{
                  width: `${100 - i * 20}%`,
                  height: `${100 - i * 20}%`,
                  animationDelay: `${i * 200}ms`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
            {/* Initial letter */}
            <div className="absolute text-5xl font-bold text-red-500 font-heading">{getInitial(brand1)}</div>
          </div>
          <div className="text-xl font-bold text-white font-heading text-center truncate w-full px-2">{brand1}</div>
          <div className="text-red-500 text-xs mt-2 font-heading tracking-widest">SCANNING...</div>
        </div>

        {/* Center - VS indicator */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-2 border-red-500 transition-all duration-300 ${
                pulse === 0 ? "scale-100 opacity-100" : "scale-150 opacity-0"
              }`}
            />
            <Zap className="w-8 h-8 text-red-500 animate-pulse" strokeWidth={3} />
          </div>
          <div className="text-xl font-bold text-red-500 font-heading tracking-wider">VS</div>
          <div className="w-32 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-red-500 animate-pulse" />
          </div>
        </div>

        {/* Brand 2 - Right side */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            {/* Animated circles */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse"
                style={{
                  width: `${100 - i * 20}%`,
                  height: `${100 - i * 20}%`,
                  animationDelay: `${i * 200 + 300}ms`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
            {/* Initial letter */}
            <div className="absolute text-5xl font-bold text-red-500 font-heading">{getInitial(brand2)}</div>
          </div>
          <div className="text-xl font-bold text-white font-heading text-center truncate w-full px-2">{brand2}</div>
          <div className="text-red-500 text-xs mt-2 font-heading tracking-widest">SCANNING...</div>
        </div>
      </div>
    </div>
  )
}
