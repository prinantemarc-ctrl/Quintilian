"use client"

import { useEffect, useState } from "react"
import { Zap, Swords, Flame } from "lucide-react"

interface DuelLoadingAnimationProps {
  brand1: string
  brand2: string
}

export function DuelLoadingAnimation({ brand1, brand2 }: DuelLoadingAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Phase animation (0-3)
    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4)
    }, 600)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 200)

    return () => {
      clearInterval(phaseInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const getInitial = (name: string) => {
    const parts = name.trim().split(/\s+/)
    return parts.length > 0 ? parts[0].charAt(0).toUpperCase() : "?"
  }

  const phaseTexts = [
    "Collecte des données...",
    "Analyse comparative...",
    "Évaluation des métriques...",
    "Génération du verdict...",
  ]

  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-black via-violet-950/20 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Radial glow from center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main battle area */}
      <div className="relative flex items-center justify-center w-full max-w-4xl gap-4 sm:gap-8 md:gap-16">
        {/* Brand 1 - Left Fighter */}
        <div className="flex flex-col items-center flex-1 z-10">
          {/* Avatar with animated rings */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4">
            {/* Outer pulsing ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            {/* Middle rotating ring */}
            <div
              className="absolute inset-2 rounded-full border-2 border-dashed border-violet-400/40"
              style={{
                animation: "spin 8s linear infinite",
              }}
            />
            {/* Inner solid ring */}
            <div className="absolute inset-4 rounded-full border-2 border-violet-500 bg-violet-950/50 backdrop-blur-sm" />
            {/* Avatar circle */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading">
                {getInitial(brand1)}
              </span>
            </div>
            {/* Energy particles */}
            <div
              className={`absolute -right-2 top-1/2 w-2 h-2 rounded-full bg-violet-400 ${phase === 0 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
            <div
              className={`absolute -left-2 top-1/3 w-1.5 h-1.5 rounded-full bg-violet-300 ${phase === 1 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
          </div>

          {/* Name - Full display */}
          <div className="text-center max-w-[180px] sm:max-w-[220px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-heading leading-tight">{brand1}</h3>
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-violet-500 ${phase % 2 === 0 ? "animate-pulse" : ""}`} />
            <span className="text-violet-400 text-xs sm:text-sm font-medium tracking-wider uppercase">Analyse...</span>
          </div>
        </div>

        {/* Center - VS Battle indicator */}
        <div className="flex flex-col items-center z-20 flex-shrink-0">
          {/* Battle icon with effects */}
          <div className="relative mb-2">
            {/* Glow effect */}
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-violet-500/30 rounded-full blur-xl animate-pulse" />

            {/* Main icon container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 border-2 border-violet-400 flex items-center justify-center shadow-2xl shadow-violet-500/50">
              <Swords
                className={`w-8 h-8 sm:w-10 sm:h-10 text-white transition-transform duration-300 ${phase === 2 ? "scale-125 rotate-12" : "scale-100 rotate-0"}`}
                strokeWidth={2.5}
              />
            </div>

            {/* Spark effects */}
            <Flame
              className={`absolute -top-2 -right-2 w-4 h-4 text-orange-400 ${phase === 3 ? "opacity-100" : "opacity-0"} transition-opacity`}
            />
            <Zap
              className={`absolute -bottom-1 -left-2 w-4 h-4 text-yellow-400 ${phase === 1 ? "opacity-100" : "opacity-0"} transition-opacity`}
            />
          </div>

          {/* VS Text */}
          <div className="relative">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-violet-400 font-heading tracking-widest">
              VS
            </span>
          </div>
        </div>

        {/* Brand 2 - Right Fighter */}
        <div className="flex flex-col items-center flex-1 z-10">
          {/* Avatar with animated rings */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4">
            {/* Outer pulsing ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping"
              style={{ animationDuration: "2s", animationDelay: "0.5s" }}
            />
            {/* Middle rotating ring */}
            <div
              className="absolute inset-2 rounded-full border-2 border-dashed border-violet-400/40"
              style={{
                animation: "spin 8s linear infinite reverse",
              }}
            />
            {/* Inner solid ring */}
            <div className="absolute inset-4 rounded-full border-2 border-violet-500 bg-violet-950/50 backdrop-blur-sm" />
            {/* Avatar circle */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading">
                {getInitial(brand2)}
              </span>
            </div>
            {/* Energy particles */}
            <div
              className={`absolute -left-2 top-1/2 w-2 h-2 rounded-full bg-violet-400 ${phase === 2 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
            <div
              className={`absolute -right-2 top-2/3 w-1.5 h-1.5 rounded-full bg-violet-300 ${phase === 3 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
          </div>

          {/* Name - Full display */}
          <div className="text-center max-w-[180px] sm:max-w-[220px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-heading leading-tight">{brand2}</h3>
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-violet-500 ${phase % 2 === 1 ? "animate-pulse" : ""}`} />
            <span className="text-violet-400 text-xs sm:text-sm font-medium tracking-wider uppercase">Analyse...</span>
          </div>
        </div>
      </div>

      {/* Bottom section - Progress */}
      <div className="relative mt-8 sm:mt-12 w-full max-w-md z-10">
        {/* Phase text */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm sm:text-base font-medium">{phaseTexts[phase]}</p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-center mt-2">
          <span className="text-violet-400 text-xs font-mono">{Math.round(Math.min(progress, 95))}%</span>
        </div>
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  )
}
