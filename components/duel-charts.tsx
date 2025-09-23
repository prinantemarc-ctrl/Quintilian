"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Swords, Trophy, Crown, Target, Zap } from "lucide-react"

interface DuelResult {
  brand1_analysis: {
    presence_score: number
    tone_score: number
    coherence_score: number
    global_score: number
    tone_label: string
  }
  brand2_analysis: {
    presence_score: number
    tone_score: number
    coherence_score: number
    global_score: number
    tone_label: string
  }
  winner: string
  score_difference: number
}

interface DuelChartsProps {
  result: DuelResult
  brand1: string
  brand2: string
  animated?: boolean
}

const CHART_COLORS = {
  brand1: "hsl(0, 84%, 60%)", // Rouge pour brand1
  brand2: "hsl(217, 91%, 60%)", // Bleu pour brand2
  winner: "hsl(142, 76%, 36%)", // Vert pour le gagnant
  neutral: "hsl(210, 40%, 70%)", // Gris neutre
}

export function DuelCharts({ result, brand1, brand2, animated = true }: DuelChartsProps) {
  // Données pour le graphique radar comparatif
  const radarData = [
    {
      metric: "Présence",
      [brand1]: result.brand1_analysis.presence_score,
      [brand2]: result.brand2_analysis.presence_score,
      fullName: "Présence Digitale",
    },
    {
      metric: "Sentiment",
      [brand1]: result.brand1_analysis.tone_score,
      [brand2]: result.brand2_analysis.tone_score,
      fullName: "Sentiment & Ton",
    },
    {
      metric: "Cohérence",
      [brand1]: result.brand1_analysis.coherence_score,
      [brand2]: result.brand2_analysis.coherence_score,
      fullName: "Cohérence Message",
    },
  ]

  // Données pour le graphique en barres
  const barData = [
    {
      name: "Présence",
      [brand1]: result.brand1_analysis.presence_score,
      [brand2]: result.brand2_analysis.presence_score,
    },
    {
      name: "Sentiment",
      [brand1]: result.brand1_analysis.tone_score,
      [brand2]: result.brand2_analysis.tone_score,
    },
    {
      name: "Cohérence",
      [brand1]: result.brand1_analysis.coherence_score,
      [brand2]: result.brand2_analysis.coherence_score,
    },
    {
      name: "Global",
      [brand1]: result.brand1_analysis.global_score,
      [brand2]: result.brand2_analysis.global_score,
    },
  ]

  const getWinnerColor = (brand: string) => {
    if (result.winner === "Match nul") return CHART_COLORS.neutral
    return result.winner === brand ? CHART_COLORS.winner : CHART_COLORS.neutral
  }

  const getScoreAdvantage = (score1: number, score2: number) => {
    const diff = Math.abs(score1 - score2)
    if (diff < 5) return "Égalité"
    if (diff < 15) return "Léger avantage"
    if (diff < 30) return "Net avantage"
    return "Domination"
  }

  return (
    <div className="space-y-6">
      {/* Combat Arena Header */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                {brand1.charAt(0).toUpperCase()}
              </div>
              <div className="font-bold">{brand1}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: getWinnerColor(brand1) }}>
                {result.brand1_analysis.global_score}
              </div>
            </div>

            <div className="text-center">
              <Swords className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <div className="text-yellow-400 font-bold text-xl">VS</div>
              {result.winner !== "Match nul" && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300">{result.winner === brand1 ? brand1 : brand2} gagne !</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                {brand2.charAt(0).toUpperCase()}
              </div>
              <div className="font-bold">{brand2}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: getWinnerColor(brand2) }}>
                {result.brand2_analysis.global_score}
              </div>
            </div>
          </div>

          {result.score_difference > 0 && (
            <div className="text-center mt-4 p-3 bg-slate-800 rounded-lg">
              <div className="text-yellow-300 text-sm">
                Écart de score: <span className="font-bold">{result.score_difference} points</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {getScoreAdvantage(result.brand1_analysis.global_score, result.brand2_analysis.global_score)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart - Combat Arena */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Arène de Combat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                [brand1]: { label: brand1, color: CHART_COLORS.brand1 },
                [brand2]: { label: brand2, color: CHART_COLORS.brand2 },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name={brand1}
                    dataKey={brand1}
                    stroke={CHART_COLORS.brand1}
                    fill={CHART_COLORS.brand1}
                    fillOpacity={0.3}
                    strokeWidth={3}
                    animationDuration={animated ? 1000 : 0}
                  />
                  <Radar
                    name={brand2}
                    dataKey={brand2}
                    stroke={CHART_COLORS.brand2}
                    fill={CHART_COLORS.brand2}
                    fillOpacity={0.3}
                    strokeWidth={3}
                    animationDuration={animated ? 1200 : 0}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Comparaison Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                [brand1]: { label: brand1, color: CHART_COLORS.brand1 },
                [brand2]: { label: brand2, color: CHART_COLORS.brand2 },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey={brand1}
                    fill={CHART_COLORS.brand1}
                    animationDuration={animated ? 800 : 0}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={brand2}
                    fill={CHART_COLORS.brand2}
                    animationDuration={animated ? 1000 : 0}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Score Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Analyse Score par Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Brand 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CHART_COLORS.brand1 }} />
                <h3 className="font-bold text-lg">{brand1}</h3>
                {result.winner === brand1 && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>

              {radarData.map((item) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.fullName}</span>
                    <span className="text-xl font-bold">{item[brand1]}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item[brand1]}%`,
                        backgroundColor: CHART_COLORS.brand1,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Score Global</span>
                  <span className="text-2xl font-bold" style={{ color: getWinnerColor(brand1) }}>
                    {result.brand1_analysis.global_score}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Brand 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CHART_COLORS.brand2 }} />
                <h3 className="font-bold text-lg">{brand2}</h3>
                {result.winner === brand2 && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>

              {radarData.map((item) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.fullName}</span>
                    <span className="text-xl font-bold">{item[brand2]}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item[brand2]}%`,
                        backgroundColor: CHART_COLORS.brand2,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Score Global</span>
                  <span className="text-2xl font-bold" style={{ color: getWinnerColor(brand2) }}>
                    {result.brand2_analysis.global_score}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">⚔️ Insights du Combat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Domaines de Force</h4>
              <div className="space-y-1 text-sm text-purple-700">
                {radarData.map((item) => {
                  const winner = item[brand1] > item[brand2] ? brand1 : item[brand2] > item[brand1] ? brand2 : null
                  return winner ? (
                    <div key={item.metric}>
                      • {winner} domine en {item.fullName}
                    </div>
                  ) : (
                    <div key={item.metric}>• Égalité en {item.fullName}</div>
                  )
                })}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Écarts Significatifs</h4>
              <div className="space-y-1 text-sm text-purple-700">
                {radarData.map((item) => {
                  const diff = Math.abs(item[brand1] - item[brand2])
                  if (diff >= 10) {
                    return (
                      <div key={item.metric}>
                        • {item.fullName}: {diff} points d'écart
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Verdict Final</h4>
              <div className="space-y-1 text-sm text-purple-700">
                {result.winner === "Match nul" ? (
                  <div>• Combat équilibré</div>
                ) : (
                  <>
                    <div>• {result.winner} remporte le duel</div>
                    <div>• Écart de {result.score_difference} points</div>
                    <div>
                      • {getScoreAdvantage(result.brand1_analysis.global_score, result.brand2_analysis.global_score)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
