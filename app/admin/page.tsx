"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { GeographicAnalysis } from "@/components/admin/geographic-analysis"
import { AlertTriangle, Home, Moon, Sun, Activity, Globe, BarChart3, Database, Users, Zap, Eye } from "lucide-react"
import { SearchDetailsModal } from "@/components/admin/search-details-modal"

interface SearchLog {
  id: string
  timestamp: Date
  type: "analyze" | "duel"
  query: string
  identity?: string
  brand1?: string
  brand2?: string
  language: string
  results: {
    presence_score?: number
    sentiment_score?: number
    coherence_score?: number
    processing_time: number
    google_results_count: number
    openai_tokens_used?: number
  }
  user_agent: string
  ip_address?: string
  error?: string
}

interface Stats {
  total: number
  today: number
  week: number
  month: number
  byType: { analyze: number; duel: number }
  byLanguage: Record<string, number>
  avgProcessingTime: number
  errors: number
}

export default function AdminPage() {
  const [logs, setLogs] = useState<SearchLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    searchesPerMinute: 0,
    avgResponseTime: 0,
    errorRate: 0,
  })
  const [chartData, setChartData] = useState<any>(null)
  const [geographicData, setGeographicData] = useState<any[]>([])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const authenticate = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      alert("Incorrect password")
    }
  }

  const fetchData = async () => {
    try {
      console.log("[v0] Fetching admin data...")
      const [logsRes, statsRes] = await Promise.all([fetch("/api/admin/logs"), fetch("/api/admin/stats")])

      console.log("[v0] API responses:", { logsOk: logsRes.ok, statsOk: statsRes.ok })

      if (logsRes.ok && statsRes.ok) {
        const logsData = await logsRes.json()
        const statsData = await statsRes.json()

        console.log("[v0] Received data:", { logsCount: logsData.length, statsData })

        setLogs(logsData)
        setStats(statsData)

        const now = new Date()
        const oneMinuteAgo = new Date(now.getTime() - 60000)
        const recentLogs = logsData.filter((log: SearchLog) => new Date(log.timestamp) > oneMinuteAgo)

        const newRealTimeData = {
          activeUsers: Math.max(1, Math.floor(statsData.today / 10)),
          searchesPerMinute: recentLogs.length,
          avgResponseTime: statsData.avgProcessingTime,
          errorRate: statsData.total > 0 ? (statsData.errors / statsData.total) * 100 : 0,
        }

        console.log("[v0] Real-time data:", newRealTimeData)
        setRealTimeData(newRealTimeData)

        generateChartData(logsData)
        generateGeographicData(logsData)
      } else {
        console.error("[v0] API request failed:", { logsStatus: logsRes.status, statsStatus: statsRes.status })
      }
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
    }
  }

  const generateChartData = (logs: SearchLog[]) => {
    const now = new Date()

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      const hourLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate.getHours() === hour.getHours() && logDate.toDateString() === hour.toDateString()
      })

      return {
        hour: `${hour.getHours()}h`,
        searches: hourLogs.length,
        errors: hourLogs.filter((log) => log.error).length,
      }
    })

    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      })

      const avgScore =
        dayLogs.length > 0
          ? dayLogs.reduce((sum, log) => {
              const scores = [log.results.presence_score, log.results.sentiment_score, log.results.coherence_score]
              const validScores = scores.filter((s) => s !== undefined) as number[]
              return sum + (validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0)
            }, 0) / dayLogs.length
          : 0

      return {
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        searches: dayLogs.length,
        avgScore: avgScore,
      }
    })

    const analyzeCount = logs.filter((log) => log.type === "analyze").length
    const duelCount = logs.filter((log) => log.type === "duel").length
    const total = analyzeCount + duelCount

    const typeDistribution = [
      { type: "Analyse", count: analyzeCount, percentage: total > 0 ? Math.round((analyzeCount / total) * 100) : 0 },
      { type: "Duel", count: duelCount, percentage: total > 0 ? Math.round((duelCount / total) * 100) : 0 },
    ]

    const languageCounts: Record<string, number> = {}
    logs.forEach((log) => {
      languageCounts[log.language] = (languageCounts[log.language] || 0) + 1
    })

    const languageDistribution = Object.entries(languageCounts).map(([language, count]) => ({
      language: language === "fr" ? "Français" : language === "en" ? "English" : "Español",
      count,
    }))

    const performanceData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      })

      const avgTime =
        dayLogs.length > 0 ? dayLogs.reduce((sum, log) => sum + log.results.processing_time, 0) / dayLogs.length : 0

      const successRate =
        dayLogs.length > 0 ? ((dayLogs.length - dayLogs.filter((log) => log.error).length) / dayLogs.length) * 100 : 100

      return {
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        avgTime,
        successRate,
      }
    })

    setChartData({
      hourlyData,
      dailyData,
      typeDistribution,
      languageDistribution,
      performanceData,
    })
  }

  const generateGeographicData = (logs: SearchLog[]) => {
    const countries: Record<string, { searches: number; scores: number[] }> = {}

    logs.forEach((log) => {
      let country = "France"
      if (log.language === "en") country = "Canada"
      if (log.language === "es") country = "Espagne"

      if (!countries[country]) {
        countries[country] = { searches: 0, scores: [] }
      }

      countries[country].searches++

      const scores = [log.results.presence_score, log.results.sentiment_score, log.results.coherence_score]
      const validScores = scores.filter((s) => s !== undefined) as number[]
      if (validScores.length > 0) {
        countries[country].scores.push(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      }
    })

    const totalSearches = logs.length
    const geoData = Object.entries(countries).map(([country, data]) => ({
      country,
      countryCode: country === "France" ? "FR" : country === "Canada" ? "CA" : "ES",
      searches: data.searches,
      percentage: totalSearches > 0 ? Math.round((data.searches / totalSearches) * 100) : 0,
      avgScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      topCities: [],
    }))

    setGeographicData(geoData)
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const filteredLogs = logs.filter(
    (log) =>
      log.query.toLowerCase().includes(filter.toLowerCase()) ||
      log.type.includes(filter.toLowerCase()) ||
      log.language.includes(filter.toLowerCase()),
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès Admin</CardTitle>
            <CardDescription>Enter password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && authenticate()}
            />
            <Button onClick={authenticate} className="w-full">
              Se connecter
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
              <p className="text-muted-foreground">Analyse avancée des performances SEO</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Accueil
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-chart-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">{realTimeData.activeUsers}</div>
              <p className="text-xs text-muted-foreground">En temps réel</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recherches/min</CardTitle>
              <Activity className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{realTimeData.searchesPerMinute}</div>
              <p className="text-xs text-muted-foreground">Dernière minute</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
              <Zap className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">{realTimeData.avgResponseTime.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">Moyenne actuelle</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{realTimeData.errorRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Dernière heure</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="geographic" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Géographie
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Logs détaillés
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {chartData && <AnalyticsCharts data={chartData} />}
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <GeographicAnalysis data={geographicData} totalSearches={stats?.total || 0} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdvancedFilters
              onFiltersChange={(filters) => console.log("Filters:", filters)}
              onExport={(format) => console.log("Export:", format)}
              onRefresh={() => fetchData()}
              totalResults={stats?.total || 0}
              filteredResults={filteredLogs.length}
            />

            <div className="space-y-4">
              {filteredLogs.slice(0, 20).map((log) => (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.type === "analyze" ? "default" : "secondary"}>{log.type}</Badge>
                          <Badge variant="outline">{log.language}</Badge>
                          {log.error && <Badge variant="destructive">Erreur</Badge>}
                          {log.ip_address && <Badge variant="secondary">{log.ip_address}</Badge>}
                        </div>
                        <p className="font-medium text-balance">{log.query}</p>
                        {log.identity && <p className="text-sm text-muted-foreground">Identité: {log.identity}</p>}
                        {log.brand1 && log.brand2 && (
                          <p className="text-sm text-muted-foreground">
                            Duel: {log.brand1} vs {log.brand2}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date(log.timestamp).toLocaleString("fr-FR")}</p>
                        <p className="font-medium">{log.results.processing_time.toFixed(1)}s</p>
                        <SearchDetailsModal
                          searchId={log.id}
                          query={log.query}
                          type={log.type}
                          timestamp={log.timestamp}
                        >
                          <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        </SearchDetailsModal>
                      </div>
                    </div>

                    {!log.error && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        {log.results.presence_score && (
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="text-xs text-muted-foreground">Présence</div>
                            <div className="font-bold text-lg">{log.results.presence_score}/10</div>
                          </div>
                        )}
                        {log.results.sentiment_score && (
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="text-xs text-muted-foreground">Sentiment</div>
                            <div className="font-bold text-lg">{log.results.sentiment_score}/10</div>
                          </div>
                        )}
                        {log.results.coherence_score && (
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="text-xs text-muted-foreground">Cohérence</div>
                            <div className="font-bold text-lg">{log.results.coherence_score}/10</div>
                          </div>
                        )}
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-xs text-muted-foreground">Résultats</div>
                          <div className="font-bold text-lg">{log.results.google_results_count}</div>
                        </div>
                        {log.results.openai_tokens_used && (
                          <div className="text-center p-2 bg-muted rounded">
                            <div className="text-xs text-muted-foreground">Tokens</div>
                            <div className="font-bold text-lg">{log.results.openai_tokens_used}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {log.error && (
                      <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                        {log.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques globales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total recherches</span>
                      <span className="font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today</span>
                      <span className="font-bold text-chart-1">{stats.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="font-bold text-chart-2">{stats.week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ce mois</span>
                      <span className="font-bold text-chart-3">{stats.month}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Temps moyen</span>
                      <span className="font-bold">{stats.avgProcessingTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de succès</span>
                      <span className="font-bold text-primary">
                        {(((stats.total - stats.errors) / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Erreurs</span>
                      <span className="font-bold text-destructive">{stats.errors}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Analyses</span>
                      <span className="font-bold">{stats.byType.analyze}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duels</span>
                      <span className="font-bold">{stats.byType.duel}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Par langue:</span>
                      {Object.entries(stats.byLanguage).map(([lang, count]) => (
                        <div key={lang} className="flex justify-between text-sm">
                          <span>{lang === "fr" ? "Français" : lang === "en" ? "English" : "Español"}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
