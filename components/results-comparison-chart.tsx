"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
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
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react"

interface ComparisonData {
  current: {
    presence_score: number
    tone_score: number
    coherence_score: number
    brand: string
    date: string
  }
  industry_average?: {
    presence_score: number
    tone_score: number
    coherence_score: number
  }
  previous?: {
    presence_score: number
    tone_score: number
    coherence_score: number
    date: string
  }
  competitors?: Array<{
    name: string
    presence_score: number
    tone_score: number
    coherence_score: number
  }>
}

interface ResultsComparisonChartProps {
  data: ComparisonData
  showIndustryBenchmark?: boolean
  showCompetitors?: boolean
  showTrends?: boolean
}

export function ResultsComparisonChart({
  data,
  showIndustryBenchmark = true,
  showCompetitors = false,
  showTrends = true,
}: ResultsComparisonChartProps) {
  const radarData = [
    {
      metric: "Présence",
      current: data.current.presence_score,
      industry: data.industry_average?.presence_score || 65,
      previous: data.previous?.presence_score || 0,
    },
    {
      metric: "Sentiment",
      current: data.current.tone_score,
      industry: data.industry_average?.tone_score || 70,
      previous: data.previous?.tone_score || 0,
    },
    {
      metric: "Cohérence",
      current: data.current.coherence_score,
      industry: data.industry_average?.coherence_score || 68,
      previous: data.previous?.coherence_score || 0,
    },
  ]

  const comparisonData = [
    {
      name: data.current.brand,
      presence: data.current.presence_score,
      sentiment: data.current.tone_score,
      coherence: data.current.coherence_score,
      type: "current",
    },
    ...(data.competitors?.slice(0, 3).map((comp) => ({
      name: comp.name,
      presence: comp.presence_score,
      sentiment: comp.tone_score,
      coherence: comp.coherence_score,
      type: "competitor",
    })) || []),
  ]

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous
    if (Math.abs(diff) < 2) return null
    return diff > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = (current: number, previous: number) => {
    const diff = current - previous
    if (Math.abs(diff) < 2) return "text-gray-500"
    return diff > 0 ? "text-green-600" : "text-red-600"
  }

  const globalScore = Math.round(
    (data.current.presence_score + data.current.tone_score + data.current.coherence_score) / 3,
  )
  const industryGlobal = data.industry_average
    ? Math.round(
        (data.industry_average.presence_score +
          data.industry_average.tone_score +
          data.industry_average.coherence_score) /
          3,
      )
    : 67

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Votre Score</p>
                <p className="text-2xl font-bold text-blue-900">{globalScore}/100</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Moyenne Secteur</p>
                <p className="text-2xl font-bold text-gray-900">{industryGlobal}/100</p>
              </div>
              <Award className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${globalScore > industryGlobal ? "from-green-50 to-green-100 border-green-200" : "from-orange-50 to-orange-100 border-orange-200"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Performance</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-2xl font-bold ${globalScore > industryGlobal ? "text-green-900" : "text-orange-900"}`}
                  >
                    {globalScore > industryGlobal ? "+" : ""}
                    {globalScore - industryGlobal}
                  </p>
                  <Badge variant={globalScore > industryGlobal ? "default" : "secondary"} className="text-xs">
                    {globalScore > industryGlobal ? "Au-dessus" : "En-dessous"}
                  </Badge>
                </div>
              </div>
              {globalScore > industryGlobal ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-orange-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Analyse Comparative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                current: { label: "Votre score", color: "hsl(var(--chart-1))" },
                industry: { label: "Moyenne secteur", color: "hsl(var(--chart-2))" },
                previous: { label: "Score précédent", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Votre score"
                    dataKey="current"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  {showIndustryBenchmark && (
                    <Radar
                      name="Moyenne secteur"
                      dataKey="industry"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
                  {showTrends && data.previous && (
                    <Radar
                      name="Score précédent"
                      dataKey="previous"
                      stroke="hsl(var(--chart-3))"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {showCompetitors && data.competitors && (
          <Card>
            <CardHeader>
              <CardTitle>Comparaison Concurrentielle</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  presence: { label: "Présence", color: "hsl(var(--chart-1))" },
                  sentiment: { label: "Sentiment", color: "hsl(var(--chart-2))" },
                  coherence: { label: "Cohérence", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="presence" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="sentiment" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="coherence" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {showTrends && data.previous && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {radarData.map((item) => {
                  const TrendIcon = getTrendIcon(item.current, item.previous)
                  const trendColor = getTrendColor(item.current, item.previous)
                  const diff = item.current - item.previous

                  return (
                    <div key={item.metric} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.metric}</span>
                        {TrendIcon && (
                          <div className={`flex items-center gap-1 ${trendColor}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.current}</div>
                        <div className="text-sm text-muted-foreground">vs {item.previous}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
