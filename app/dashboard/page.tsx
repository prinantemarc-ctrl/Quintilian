"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditDisplay } from "@/components/credits/credit-display"
import { UsageTracker } from "@/components/paywall/usage-tracker"
import { SearchDetailsModal } from "@/components/search-details-modal"
import { BarChart3, TrendingUp, Users, Zap, ArrowRight, Calendar, Globe, Eye, Search, CreditCard } from "lucide-react"
import Link from "next/link"

interface UserStats {
  totalAnalyses: number
  thisMonth: number
  avgScore: number
  lastAnalysis: string | null
}

interface SearchResult {
  id: string
  query: string
  competitor_query?: string
  type: string
  analysis_type: string
  scores: {
    presence_score?: number
    sentiment_score?: number
    coherence_score?: number
  }
  results: any
  gpt_analysis: any
  created_at: string
  processing_time_ms: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [searches, setSearches] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedSearches, setExpandedSearches] = useState<Set<string>>(new Set())
  const [selectedSearch, setSelectedSearch] = useState<SearchResult | null>(null)
  const supabase = createClient()

  const loadUserData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setIsRefreshing(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      try {
        const response = await fetch("/api/user/searches", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setSearches(data.searches)
        } else {
          setStats({
            totalAnalyses: 0,
            thisMonth: 0,
            avgScore: 0,
            lastAnalysis: null,
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setStats({
          totalAnalyses: 0,
          thisMonth: 0,
          avgScore: 0,
          lastAnalysis: null,
        })
      }
    }

    setIsLoading(false)
    if (showRefreshLoader) setIsRefreshing(false)
  }

  const refreshData = () => {
    loadUserData(true)
  }

  useEffect(() => {
    loadUserData()
  }, [supabase.auth])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "single":
        return "Simple Analysis"
      case "duel":
        return "Duel"
      default:
        return type
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const toggleSearchDetails = (searchId: string) => {
    const newExpanded = new Set(expandedSearches)
    if (newExpanded.has(searchId)) {
      newExpanded.delete(searchId)
    } else {
      newExpanded.add(searchId)
    }
    setExpandedSearches(newExpanded)
  }

  const openSearchDetails = (search: SearchResult) => {
    setSelectedSearch(search)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Restricted Access</CardTitle>
            <CardDescription>You must be logged in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <Search className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background space-y-6">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isRefreshing}>
            <TrendingUp className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnalyses || 0}</div>
              <p className="text-xs text-muted-foreground">Since registration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">Analyses completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgScore || 0}/10</div>
              <p className="text-xs text-muted-foreground">All analyses combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="secondary">Freemium</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Current plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Credits and Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreditDisplay />
          <UsageTracker />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New Analysis</CardTitle>
              <CardDescription>Analyze the brand image of a company</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/analyze">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Credits</CardTitle>
              <CardDescription>Purchase credits to unlock more features</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/credits">
                  <CreditCard className="w-4 h-4 mr-2" />
                  View Credits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Search History</CardTitle>
            <CardDescription>Your recent analyses with full details</CardDescription>
          </CardHeader>
          <CardContent>
            {searches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent analyses</p>
                <p className="text-sm">Start your first analysis to see history here</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/search">
                    <Search className="w-4 h-4 mr-2" />
                    Start Now
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {searches.slice(0, 3).map((search) => {
                  const isExpanded = expandedSearches.has(search.id)
                  return (
                    <Card key={search.id} className="border-l-4 border-l-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getAnalysisTypeLabel(search.type || search.analysis_type)}</Badge>
                            <span className="text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {formatDate(search.created_at)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">{search.processing_time_ms}ms</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{search.query}</span>
                          </div>
                          {search.competitor_query && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="ml-6">vs {search.competitor_query}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {search.scores && (
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {search.scores.presence_score !== undefined && (
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${getScoreColor(search.scores.presence_score)}`}>
                                  {search.scores.presence_score}/10
                                </div>
                                <div className="text-xs text-muted-foreground">Presence</div>
                              </div>
                            )}
                            {search.scores.sentiment_score !== undefined && (
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${getScoreColor(search.scores.sentiment_score)}`}>
                                  {search.scores.sentiment_score}/10
                                </div>
                                <div className="text-xs text-muted-foreground">Sentiment</div>
                              </div>
                            )}
                            {search.scores.coherence_score !== undefined && (
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${getScoreColor(search.scores.coherence_score)}`}>
                                  {search.scores.coherence_score}/10
                                </div>
                                <div className="text-xs text-muted-foreground">Coherence</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span>Results available</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openSearchDetails(search)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Analysis
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/dashboard/history">View All History</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SearchDetailsModal */}
      {selectedSearch && (
        <SearchDetailsModal
          isOpen={!!selectedSearch}
          onClose={() => setSelectedSearch(null)}
          searchId={selectedSearch.id}
          query={selectedSearch.query}
          competitorQuery={selectedSearch.competitor_query}
          analysisType={selectedSearch.analysis_type || selectedSearch.type}
          createdAt={selectedSearch.created_at}
          scores={selectedSearch.scores}
        />
      )}
    </div>
  )
}
