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
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Award, BarChart3, Eye } from "lucide-react"

interface AnalysisResult {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
}

interface HistoricalData {
  date: string
  presence_score: number
  tone_score: number
  coherence_score: number
  global_score: number
}

interface AnalysisChartsProps {
  current: AnalysisResult
  brand: string
  historical?: HistoricalData[]
  industryBenchmark?: {
    presence_score: number
    tone_score: number
    coherence_score: number
  }
  showTrends?: boolean
  showBenchmark?: boolean
  animated?: boolean
}

const CHART_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  accent: "hsl(var(--chart-3))",
  muted: "hsl(var(--chart-4))",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 84%, 60%)",
}

export function AnalysisCharts({
  current,
  brand,
  historical = [],
  industryBenchmark,
  showTrends = true,
  showBenchmark = true,
  animated = true,
}: AnalysisChartsProps) {
  const globalScore = Math.round((current.presence_score + current.tone_score + current.coherence_score) / 3)
  const industryGlobal = industryBenchmark
    ? Math.round(
        (industryBenchmark.presence_score + industryBenchmark.tone_score + industryBenchmark.coherence_score) / 3,
      )
    : 67

  // Données pour le graphique radar
  const radarData = [
    {
      metric: "Présence",
      current: current.presence_score,
      industry: industryBenchmark?.presence_score || 65,
      fullName: "Présence Digitale",
      icon: "👁️",
    },
    {
      metric: "Sentiment",
      current: current.tone_score,
      industry: industryBenchmark?.tone_score || 70,
      fullName: "Sentiment & Ton",
      icon: "❤️",
    },
    {
      metric: "Cohérence",
      current: current.coherence_score,
      industry: industryBenchmark?.coherence_score || 68,
      fullName: "Cohérence Message",
      icon: "🎯",
    },
  ]

  // Données pour le graphique de tendance
  const trendData = historical.length > 0 ? historical.slice(-7) : []

  // Données pour la répartition des scores
  const scoreDistribution = [
    { name: "Présence", value: current.presence_score, color: CHART_COLORS.primary },
    { name: "Sentiment", value: current.tone_score, color: CHART_COLORS.secondary },
    { name: "Cohérence", value: current.coherence_score, color: CHART_COLORS.accent },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return CHART_COLORS.success
    if (score >= 60) return CHART_COLORS.warning
    return CHART_COLORS.danger
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Bon"
    if (score >= 40) return "Moyen"
    return "Faible"
  }

  return (
    <div className="space-y-6">
      {/* Scores Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Score Global</p>
                <p className="text-2xl font-bold text-blue-900">{globalScore}/100</p>
                <p className="text-xs text-blue-600">{getScoreLabel(globalScore)}</p>
              </div>
              <div className="text-3xl">{globalScore >= 80 ? "🏆" : globalScore >= 60 ? "⭐" : "📈"}</div>
            </div>
          </CardContent>
        </Card>

        {showBenchmark && (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Moyenne Secteur</p>
                  <p className="text-2xl font-bold text-gray-900">{industryGlobal}/100</p>
                  <p className="text-xs text-gray-600">Référence industrie</p>
                </div>
                <Award className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card
          className={`bg-gradient-to-br ${
            globalScore > industryGlobal
              ? "from-green-50 to-green-100 border-green-200"
              : "from-orange-50 to-orange-100 border-orange-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Performance</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      globalScore > industryGlobal ? "text-green-900" : "text-orange-900"
                    }`}
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
        {/* Radar Chart - Analyse Comparative */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Analyse Multi-Dimensionnelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                current: { label: brand, color: CHART_COLORS.primary },
                industry: { label: "Moyenne secteur", color: CHART_COLORS.secondary },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name={brand}
                    dataKey="current"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.3}
                    strokeWidth={3}
                    animationDuration={animated ? 1000 : 0}
                  />
                  {showBenchmark && (
                    <Radar
                      name="Moyenne secteur"
                      dataKey="industry"
                      stroke={CHART_COLORS.secondary}
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      animationDuration={animated ? 1200 : 0}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Score Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Répartition des Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                presence: { label: "Présence", color: CHART_COLORS.primary },
                sentiment: { label: "Sentiment", color: CHART_COLORS.secondary },
                coherence: { label: "Cohérence", color: CHART_COLORS.accent },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={animated ? 800 : 0}
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tendance Historique */}
        {showTrends && trendData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution Temporelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  global_score: { label: "Score Global", color: CHART_COLORS.primary },
                  presence_score: { label: "Présence", color: CHART_COLORS.secondary },
                  tone_score: { label: "Sentiment", color: CHART_COLORS.accent },
                  coherence_score: { label: "Cohérence", color: CHART_COLORS.muted },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="global_score"
                      stackId="1"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.6}
                      animationDuration={animated ? 1000 : 0}
                    />
                    <Line
                      type="monotone"
                      dataKey="presence_score"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="tone_score"
                      stroke={CHART_COLORS.accent}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="coherence_score"
                      stroke={CHART_COLORS.muted}
                      strokeWidth={2}
                      strokeDasharray="2 2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Détail des Scores avec Barres */}
        <Card className={trendData.length > 0 ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Analyse Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {radarData.map((item, index) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: getScoreColor(item.current) }}>
                        {item.current}
                      </span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item.current}%`,
                        backgroundColor: getScoreColor(item.current),
                      }}
                    />
                  </div>
                  {showBenchmark && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Votre score: {item.current}</span>
                      <span>Moyenne secteur: {item.industry}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights et Recommandations */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Insights Automatiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Points Forts</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {current.presence_score >= 70 && <li>• Excellente présence digitale</li>}
                {current.tone_score >= 70 && <li>• Sentiment très positif</li>}
                {current.coherence_score >= 70 && <li>• Message parfaitement aligné</li>}
                {globalScore > industryGlobal && <li>• Performance supérieure au secteur</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Axes d'Amélioration</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {current.presence_score < 70 && <li>• Renforcer la présence digitale</li>}
                {current.tone_score < 70 && <li>• Améliorer le sentiment associé</li>}
                {current.coherence_score < 70 && <li>• Aligner le message</li>}
                {globalScore <= industryGlobal && <li>• Rattraper la moyenne du secteur</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
