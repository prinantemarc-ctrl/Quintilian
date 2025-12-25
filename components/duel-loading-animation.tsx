"use client"

import { useEffect, useState } from "react"
import { Zap, Swords, Flame, Target, Shield, Sparkles } from "lucide-react"

interface DuelLoadingAnimationProps {
  brand1: string
  brand2: string
}

export function DuelLoadingAnimation({ brand1, brand2 }: DuelLoadingAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [battleStats, setBattleStats] = useState({ dataPoints: 0, sources: 0 })

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4)
    }, 800)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98 // Never reach 100% until actual completion
        const increment = prev < 50 ? 2.5 : prev < 75 ? 1.5 : 0.8 // Slower as it progresses
        return prev + increment
      })
    }, 250)

    let currentDataPoints = 1000
    let currentSources = 30
    const statsInterval = setInterval(() => {
      currentDataPoints = Math.min(currentDataPoints + Math.floor(Math.random() * 3) + 5, 2000)
      currentSources = Math.min(currentSources + Math.floor(Math.random() * 1) + 1, 50)
      setBattleStats({
        dataPoints: currentDataPoints,
        sources: currentSources,
      })
    }, 400)

    return () => {
      clearInterval(phaseInterval)
      clearInterval(progressInterval)
      clearInterval(statsInterval)
    }
  }, [])

  const getInitial = (name: string) => {
    const parts = name.trim().split(/\s+/)
    return parts.length > 0 ? parts[0].charAt(0).toUpperCase() : "?"
  }

  const phaseTexts = [
    "Gathering competitive intelligence...",
    "Cross-analyzing reputation metrics...",
    "Computing comparative advantage...",
    "Finalizing confrontation report...",
  ]

  const phaseIcons = [
    <Target className="w-4 h-4" key="target" />,
    <Shield className="w-4 h-4" key="shield" />,
    <Sparkles className="w-4 h-4" key="sparkles" />,
    <Zap className="w-4 h-4" key="zap" />,
  ]

  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-black via-violet-950/20 to-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
        {/* Radial glow from center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 -translate-y-1/2">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 animate-pulse" />
        </div>
      </div>

      {/* Main battle area */}
      <div className="relative flex items-center justify-center w-full max-w-4xl gap-4 sm:gap-8 md:gap-16">
        {/* Brand 1 - Left Fighter */}
        <div className="flex flex-col items-center flex-1 z-10">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4">
            {/* Outer pulsing rings - multiple layers */}
            <div
              className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            <div
              className="absolute -inset-2 rounded-full border border-violet-400/30 animate-ping"
              style={{ animationDuration: "3s", animationDelay: "0.5s" }}
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
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading animate-pulse">
                {getInitial(brand1)}
              </span>
            </div>
            <div
              className={`absolute -right-2 top-1/2 w-2 h-2 rounded-full bg-violet-400 ${phase === 0 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300 shadow-lg shadow-violet-400/50`}
            />
            <div
              className={`absolute -left-2 top-1/3 w-1.5 h-1.5 rounded-full bg-violet-300 ${phase === 1 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
            <div
              className={`absolute -top-2 left-1/3 w-1.5 h-1.5 rounded-full bg-violet-200 ${phase === 2 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
          </div>

          {/* Name - Full display */}
          <div className="text-center max-w-[180px] sm:max-w-[220px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-heading leading-tight mb-2">
              {brand1}
            </h3>
            <div className="flex items-center justify-center gap-1 text-violet-400/70 text-xs">
              <Shield className="w-3 h-3 animate-pulse" />
              <span className="font-mono">Analyzing...</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/30 border border-violet-500/30">
            <div className={`w-2 h-2 rounded-full bg-violet-500 ${phase % 2 === 0 ? "animate-pulse" : ""}`} />
            <span className="text-violet-400 text-xs sm:text-sm font-medium tracking-wider uppercase">Active</span>
          </div>
        </div>

        <div className="flex flex-col items-center z-20 flex-shrink-0">
          {/* Battle icon with effects */}
          <div className="relative mb-2">
            {/* Multiple glow layers */}
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-violet-500/30 rounded-full blur-xl animate-pulse" />
            <div
              className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-violet-400/20 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />

            {/* Main icon container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 border-2 border-violet-400 flex items-center justify-center shadow-2xl shadow-violet-500/50">
              <Swords
                className={`w-8 h-8 sm:w-10 sm:h-10 text-white transition-transform duration-500 ${phase === 2 ? "scale-125 rotate-12" : "scale-100 rotate-0"}`}
                strokeWidth={2.5}
              />
            </div>

            <Flame
              className={`absolute -top-2 -right-2 w-5 h-5 text-orange-400 ${phase === 3 ? "opacity-100 scale-125" : "opacity-0 scale-75"} transition-all duration-300`}
            />
            <Zap
              className={`absolute -bottom-1 -left-2 w-5 h-5 text-yellow-400 ${phase === 1 ? "opacity-100 scale-125" : "opacity-0 scale-75"} transition-all duration-300`}
            />
            <Sparkles
              className={`absolute -top-1 -left-1 w-4 h-4 text-violet-300 ${phase === 0 ? "opacity-100 scale-125" : "opacity-0 scale-75"} transition-all duration-300`}
            />
          </div>

          {/* VS Text with animation */}
          <div className="relative">
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-violet-400 font-heading tracking-widest animate-pulse">
              VS
            </span>
          </div>
        </div>

        {/* Brand 2 - Right Fighter */}
        <div className="flex flex-col items-center flex-1 z-10">
          {/* Avatar with animated rings */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4">
            {/* Outer pulsing rings - multiple layers */}
            <div
              className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping"
              style={{ animationDuration: "2s", animationDelay: "0.5s" }}
            />
            <div
              className="absolute -inset-2 rounded-full border border-violet-400/30 animate-ping"
              style={{ animationDuration: "3s", animationDelay: "1s" }}
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
              <span
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading animate-pulse"
                style={{ animationDelay: "0.3s" }}
              >
                {getInitial(brand2)}
              </span>
            </div>
            {/* Energy particles */}
            <div
              className={`absolute -left-2 top-1/2 w-2 h-2 rounded-full bg-violet-400 ${phase === 2 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300 shadow-lg shadow-violet-400/50`}
            />
            <div
              className={`absolute -right-2 top-2/3 w-1.5 h-1.5 rounded-full bg-violet-300 ${phase === 3 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
            <div
              className={`absolute -top-2 right-1/3 w-1.5 h-1.5 rounded-full bg-violet-200 ${phase === 0 ? "opacity-100 scale-150" : "opacity-50 scale-100"} transition-all duration-300`}
            />
          </div>

          {/* Name - Full display */}
          <div className="text-center max-w-[180px] sm:max-w-[220px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-heading leading-tight mb-2">
              {brand2}
            </h3>
            <div className="flex items-center justify-center gap-1 text-violet-400/70 text-xs">
              <Shield className="w-3 h-3 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <span className="font-mono">Analyzing...</span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/30 border border-violet-500/30">
            <div className={`w-2 h-2 rounded-full bg-violet-500 ${phase % 2 === 1 ? "animate-pulse" : ""}`} />
            <span className="text-violet-400 text-xs sm:text-sm font-medium tracking-wider uppercase">Active</span>
          </div>
        </div>
      </div>

      <div className="relative mt-8 w-full max-w-md z-10">
        <div className="flex justify-around items-center mb-4 px-4 py-3 bg-violet-950/20 border border-violet-500/20 rounded-lg">
          <div className="text-center">
            <div className="text-violet-400 text-xs uppercase font-medium mb-1">Data Points</div>
            <div className="text-white font-mono font-bold text-lg">{battleStats.dataPoints.toLocaleString()}</div>
          </div>
          <div className="h-10 w-px bg-violet-500/30" />
          <div className="text-center">
            <div className="text-violet-400 text-xs uppercase font-medium mb-1">Sources</div>
            <div className="text-white font-mono font-bold text-lg">{battleStats.sources}+</div>
          </div>
        </div>
      </div>

      {/* Bottom section - Progress */}
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm sm:text-base font-medium">
            <span className="text-violet-400">{phaseIcons[phase]}</span>
            <span>{phaseTexts[phase]}</span>
          </div>
        </div>

        <div className="relative h-2.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-center mt-3 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
          <span className="text-violet-400 text-sm font-mono font-bold">{Math.round(progress)}%</span>
          <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
      `}</style>
    </div>
  )
}
