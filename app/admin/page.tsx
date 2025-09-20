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
import { AlertTriangle, Home, Moon, Sun, Activity, Globe, BarChart3, Database, Users, Zap } from "lucide-react"

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        searchesPerMinute: Math.floor(Math.random() * 20) + 5,
        avgResponseTime: Math.random() * 2 + 1,
        errorRate: Math.random() * 5,
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const authenticate = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      alert("Mot de passe incorrect")
    }
  }

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([fetch("/api/admin/logs"), fetch("/api/admin/stats")])

      if (logsRes.ok && statsRes.ok) {
        setLogs(await logsRes.json())
        setStats(await statsRes.json())
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.query.toLowerCase().includes(filter.toLowerCase()) ||
      log.type.includes(filter.toLowerCase()) ||
      log.language.includes(filter.toLowerCase()),
  )

  const mockChartData = {
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      searches: Math.floor(Math.random() * 50) + 10,
      errors: Math.floor(Math.random() * 5),
    })),
    dailyData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      searches: Math.floor(Math.random() * 200) + 50,
      avgScore: Math.random() * 3 + 7,
    })),
    typeDistribution: [
      { type: "Analyse", count: 450, percentage: 75 },
      { type: "Duel", count: 150, percentage: 25 },
    ],
    languageDistribution: [
      { language: "Français", count: 400 },
      { language: "English", count: 150 },
      { language: "Español", count: 50 },
    ],
    performanceData: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      avgTime: Math.random() * 2 + 1,
      successRate: Math.random() * 10 + 90,
    })),
  }

  const mockGeographicData = [
    {
      country: "France",
      countryCode: "FR",
      searches: 450,
      percentage: 45,
      avgScore: 8.2,
      topCities: [
        { city: "Paris", searches: 200, avgScore: 8.5 },
        { city: "Lyon", searches: 100, avgScore: 8.0 },
        { city: "Marseille", searches: 80, avgScore: 7.8 },
      ],
    },
    {
      country: "Canada",
      countryCode: "CA",
      searches: 200,
      percentage: 20,
      avgScore: 7.9,
      topCities: [
        { city: "Montréal", searches: 120, avgScore: 8.1 },
        { city: "Toronto", searches: 80, avgScore: 7.7 },
      ],
    },
    {
      country: "Belgique",
      countryCode: "BE",
      searches: 150,
      percentage: 15,
      avgScore: 8.0,
      topCities: [
        { city: "Bruxelles", searches: 90, avgScore: 8.2 },
        { city: "Anvers", searches: 60, avgScore: 7.8 },
      ],
    },
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès Admin</CardTitle>
            <CardDescription>Entrez le mot de passe pour accéder au dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
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
              <CardTitle className="text-sm font-medium">Taux d'erreur</CardTitle>
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
            <AnalyticsCharts data={mockChartData} />
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <GeographicAnalysis data={mockGeographicData} totalSearches={1000} />
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
                      <span>Aujourd'hui</span>
                      <span className="font-bold text-chart-1">{stats.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cette semaine</span>
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
                      <span className="font-bold text-green-600">
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
