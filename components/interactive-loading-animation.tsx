"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Search, Brain, BarChart3, Zap, Globe, CheckCircle2 } from "lucide-react"
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
      label: "Recherche Google",
      description: "Analyse de votre présence digitale",
      icon: <Search className="w-5 h-5" />,
      color: "bg-blue-500",
      duration: 30,
      completed: false,
      active: true,
    },
    {
      id: "crawl",
      label: "Extraction de données",
      description: "Collecte des informations pertinentes",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-green-500",
      duration: 25,
      completed: false,
      active: false,
    },
    {
      id: "analysis",
      label: "Analyse GPT",
      description: "Traitement intelligent des données",
      icon: <Brain className="w-5 h-5" />,
      color: "bg-purple-500",
      duration: 35,
      completed: false,
      active: false,
    },
    {
      id: "scoring",
      label: "Calcul des scores",
      description: "Génération des métriques finales",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-orange-500",
      duration: 10,
      completed: false,
      active: false,
    },
  ])

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isLoading) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)
    }
  }, [isLoading])

  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        const stepProgress = ((progress - index * 25) / 25) * 100
        return {
          ...step,
          completed: stepProgress >= 100,
          active: stepProgress > 0 && stepProgress < 100,
        }
      }),
    )

    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500)
    }
  }, [progress, onComplete])

  if (!isLoading) return null

  return (
    <div className="relative py-12 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animation: `float 4s ease-in-out infinite ${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-ping" />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">Analyse en cours...</h3>
            <p className="text-muted-foreground">Notre IA analyse votre présence digitale en temps réel</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-4 bg-muted/50" />
              <div
                className="absolute top-0 left-0 h-4 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={cn(
                "transition-all duration-500 transform",
                step.active && "scale-105 shadow-lg border-primary/50",
                step.completed && "bg-green-50 border-green-200",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-500",
                        step.completed ? "bg-green-500" : step.active ? step.color : "bg-muted",
                      )}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : step.active ? (
                        <div className="animate-spin">{step.icon}</div>
                      ) : (
                        step.icon
                      )}
                    </div>

                    {step.active && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4
                        className={cn(
                          "font-semibold transition-colors duration-300",
                          step.completed ? "text-green-700" : step.active ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </h4>

                      <Badge
                        variant={step.completed ? "default" : step.active ? "secondary" : "outline"}
                        className={cn(
                          "text-xs",
                          step.completed && "bg-green-100 text-green-800 border-green-200",
                          step.active && "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {step.completed ? "Terminé" : step.active ? "En cours" : "En attente"}
                      </Badge>
                    </div>

                    <p
                      className={cn(
                        "text-sm transition-colors duration-300",
                        step.completed ? "text-green-600" : step.active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.description}
                    </p>

                    {step.active && (
                      <div className="mt-3">
                        <Progress value={((progress % 25) / 25) * 100} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                      step.completed
                        ? "bg-green-100 text-green-700"
                        : step.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
