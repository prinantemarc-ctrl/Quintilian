"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScoreTooltip } from "@/components/score-tooltip"
import { Eye, Heart, Target, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreDisplayProps {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
  previousScores?: {
    presence_score?: number
    tone_score?: number
    coherence_score?: number
  }
  showTrends?: boolean
  animated?: boolean
}

export function EnhancedScoreDisplay({
  presence_score,
  tone_score,
  coherence_score,
  tone_label,
  previousScores,
  showTrends = false,
  animated = true,
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-600"
    if (score >= 60) return "from-amber-500 to-amber-600"
    return "from-red-500 to-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200"
    if (score >= 60) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return null
    const diff = current - previous
    if (Math.abs(diff) < 2) return { icon: Minus, value: 0, color: "text-gray-500" }
    if (diff > 0) return { icon: TrendingUp, value: diff, color: "text-green-600" }
    return { icon: TrendingDown, value: Math.abs(diff), color: "text-red-600" }
  }

  const globalScore = Math.round((presence_score + tone_score + coherence_score) / 3)

  const scores = [
    {
      icon: Eye,
      label: "Présence Digitale",
      score: presence_score,
      type: "presence" as const,
      description: "Visibilité sur Google et ChatGPT",
      trend: showTrends ? getTrend(presence_score, previousScores?.presence_score) : null,
    },
    {
      icon: Heart,
      label: "Sentiment Global",
      score: tone_score,
      type: "sentiment" as const,
      description: `Tonalité: ${tone_label}`,
      trend: showTrends ? getTrend(tone_score, previousScores?.tone_score) : null,
    },
    {
      icon: Target,
      label: "Cohérence Message",
      score: coherence_score,
      type: "coherence" as const,
      description: "Alignement message vs réalité",
      trend: showTrends ? getTrend(coherence_score, previousScores?.coherence_score) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="relative">
        <Card className={cn("overflow-hidden", getScoreBg(globalScore))}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Score Global</h3>
                <p className="text-muted-foreground">Moyenne pondérée des 3 dimensions</p>
              </div>
              <div className="relative">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className={cn("transition-all duration-1000 ease-out", getScoreColor(globalScore))}
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={animated ? `${2 * Math.PI * 40 * (1 - globalScore / 100)}` : 0}
                      style={{
                        animation: animated ? "drawCircle 2s ease-out" : undefined,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={cn("text-3xl font-bold", getScoreColor(globalScore))}>{globalScore}</div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {scores.map((item, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-1000",
                getScoreGradient(item.score),
              )}
              style={{
                width: animated ? `${item.score}%` : "100%",
                animation: animated ? `slideIn 1.5s ease-out ${index * 0.2}s both` : undefined,
              }}
            />

            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div
                  className={cn(
                    "p-2 rounded-lg bg-gradient-to-br transition-all duration-300 group-hover:scale-110",
                    getScoreGradient(item.score),
                  )}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.label}
                    <ScoreTooltip type={item.type} score={item.score} />
                  </div>
                  {item.trend && (
                    <div className={cn("flex items-center gap-1 text-sm", item.trend.color)}>
                      <item.trend.icon className="w-3 h-3" />
                      {item.trend.value > 0 && `+${item.trend.value}`}
                      {item.trend.value === 0 && "Stable"}
                      {item.trend.value < 0 && item.trend.value}
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <span
                  className={cn("text-4xl font-bold transition-all duration-1000", getScoreColor(item.score))}
                  style={{
                    animation: animated ? `countUp 2s ease-out ${index * 0.3}s both` : undefined,
                  }}
                >
                  {item.score}
                </span>
                <span className="text-lg text-muted-foreground mb-1">/100</span>
              </div>

              <div className="space-y-2">
                <Progress
                  value={animated ? 0 : item.score}
                  className="h-3 bg-muted/50"
                  style={{
                    animation: animated ? `fillProgress 1.5s ease-out ${index * 0.2 + 0.5}s both` : undefined,
                  }}
                />
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>

              <div className="pt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    item.score >= 80 && "border-emerald-200 text-emerald-700 bg-emerald-50",
                    item.score >= 60 && item.score < 80 && "border-amber-200 text-amber-700 bg-amber-50",
                    item.score < 60 && "border-red-200 text-red-700 bg-red-50",
                  )}
                >
                  {item.score >= 80 && "Excellent"}
                  {item.score >= 60 && item.score < 80 && "Bon"}
                  {item.score < 60 && "À améliorer"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <style jsx>{`
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${2 * Math.PI * 40};
          }
          to {
            stroke-dashoffset: ${2 * Math.PI * 40 * (1 - globalScore / 100)};
          }
        }
        
        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: ${globalScore}%;
          }
        }
        
        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fillProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}
