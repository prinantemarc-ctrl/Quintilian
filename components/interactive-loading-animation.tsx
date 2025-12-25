"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Brain, BarChart3, Globe, CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  duration: number
  completed: boolean
  active: boolean
}

interface InteractiveLoadingAnimationProps {
  isLoading: boolean
  progress: number
  currentStep?: string
  onComplete?: () => void
}

export function InteractiveLoadingAnimation({
  isLoading,
  progress,
  currentStep,
  onComplete,
}: InteractiveLoadingAnimationProps) {
  const [steps, setSteps] = useState<LoadingStep[]>([
    {
      id: "search",
      label: "Web Reconnaissance",
      description: "Scanning the entire web for relevant data",
      icon: <Search className="w-5 h-5" />,
      color: "bg-violet-500",
      duration: 15,
      completed: false,
      active: true,
    },
    {
      id: "crawl",
      label: "Deep Source Analysis",
      description: "Extracting intelligence from premium sources",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-violet-400",
      duration: 25,
      completed: false,
      active: false,
    },
    {
      id: "analysis",
      label: "AI Processing",
      description: "Running advanced neural network analysis",
      icon: <Brain className="w-5 h-5" />,
      color: "bg-violet-600",
      duration: 35,
      completed: false,
      active: false,
    },
    {
      id: "scoring",
      label: "Intelligence Report",
      description: "Generating comprehensive reputation insights",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-violet-700",
      duration: 25,
      completed: false,
      active: false,
    },
  ])

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [dataCounter, setDataCounter] = useState(0)

  const funFacts = [
    "Analyzing over 1,000 data points...",
    "Cross-referencing global databases...",
    "Evaluating sentiment across 50+ sources...",
    "Processing reputation signals...",
    "Computing influence metrics...",
    "Scanning social media presence...",
    "Mapping digital footprint...",
    "Calculating trust indicators...",
  ]

  useEffect(() => {
    if (isLoading) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
      }))
      setParticles(newParticles)

      const factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)
      }, 2500)

      let currentValue = 0
      const counterInterval = setInterval(() => {
        // Linear increment: add 5-8 per interval (150ms = ~0.3-0.48% per update)
        currentValue = Math.min(currentValue + Math.floor(Math.random() * 3) + 5, 9999)
        setDataCounter(currentValue)
      }, 150)

      return () => {
        clearInterval(factInterval)
        clearInterval(counterInterval)
      }
    }
  }, [isLoading])

  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        const baseProgress = [0, 15, 40, 75][index]
        const stepRange = [15, 25, 35, 25][index]
        const stepProgress = ((progress - baseProgress) / stepRange) * 100

        return {
          ...step,
          completed: progress > baseProgress + stepRange,
          active: progress >= baseProgress && progress <= baseProgress + stepRange,
        }
      }),
    )

    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500)
    }
  }, [progress, onComplete])

  if (!isLoading) return null

  return (
    <div className="relative py-8 sm:py-12 px-3 sm:px-6 min-h-[500px] sm:min-h-[650px]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-violet-500/30 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float 4s ease-in-out infinite ${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-violet-600 to-violet-900 rounded-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 sm:-inset-3 bg-violet-500/20 rounded-full animate-pulse" />
            <div
              className="absolute -inset-4 sm:-inset-5 bg-violet-500/10 rounded-full animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold mb-2 text-white uppercase tracking-wider">
              Intelligence Analysis
            </h3>
            <p className="text-sm sm:text-base text-violet-300 px-2 font-medium animate-pulse">
              {funFacts[currentFactIndex]}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-violet-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-mono">{dataCounter.toLocaleString()} data points processed</span>
            <Sparkles className="w-4 h-4 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500 font-mono">
              <span>Analysis Progress</span>
              <span className="text-violet-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-3 bg-zinc-900 border border-violet-900/50 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 transition-all duration-700 ease-out"
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
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {steps.map((step, index) => {
            const baseProgress = [0, 15, 40, 75][index]
            const stepRange = [15, 25, 35, 25][index]
            const stepProgress = Math.min(100, Math.max(0, ((progress - baseProgress) / stepRange) * 100))

            return (
              <div
                key={step.id}
                className={cn(
                  "border rounded-lg transition-all duration-500 p-4 sm:p-6",
                  step.active && "border-violet-500/70 bg-violet-950/20 shadow-lg shadow-violet-500/10 scale-[1.02]",
                  step.completed && "border-green-500/50 bg-green-950/20",
                  !step.active && !step.completed && "border-white/10 bg-zinc-900/50",
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all duration-500",
                        step.completed ? "bg-green-600" : step.active ? step.color : "bg-zinc-800",
                      )}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 animate-in zoom-in duration-300" />
                      ) : step.active ? (
                        <div className="animate-pulse">{step.icon}</div>
                      ) : (
                        step.icon
                      )}
                    </div>

                    {step.active && (
                      <>
                        <div className="absolute -inset-1 bg-violet-500/30 rounded-full animate-pulse" />
                        <div className="absolute -inset-2 bg-violet-500/20 rounded-full animate-ping" />
                      </>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                      <h4
                        className={cn(
                          "font-heading font-bold text-base sm:text-lg transition-colors duration-300",
                          step.completed ? "text-green-400" : step.active ? "text-violet-400" : "text-gray-600",
                        )}
                      >
                        {step.label}
                      </h4>

                      <span
                        className={cn(
                          "text-[10px] sm:text-xs uppercase font-mono px-2 py-0.5 rounded border self-start sm:self-auto",
                          step.completed && "bg-green-950/50 text-green-400 border-green-500/50",
                          step.active && "bg-violet-950/50 text-violet-400 border-violet-500/50 animate-pulse",
                          !step.active && !step.completed && "bg-zinc-900 text-gray-600 border-white/10",
                        )}
                      >
                        {step.completed ? "✓ Complete" : step.active ? "● Processing" : "Pending"}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "text-xs sm:text-sm transition-colors duration-300",
                        step.completed ? "text-green-300/70" : step.active ? "text-gray-300" : "text-gray-600",
                      )}
                    >
                      {step.description}
                    </p>

                    {step.active && (
                      <div className="mt-3 h-1.5 bg-zinc-900 border border-violet-900/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 ease-out"
                          style={{ width: `${stepProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all duration-300 flex-shrink-0",
                      step.completed
                        ? "bg-green-950/50 text-green-400 border border-green-500/50"
                        : step.active
                          ? "bg-violet-950/50 text-violet-400 border border-violet-500/50"
                          : "bg-zinc-900 text-gray-600 border border-white/10",
                    )}
                  >
                    {index + 1}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400 animate-pulse" />
            <div className="inline-flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.8;
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
