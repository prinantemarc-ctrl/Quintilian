"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Calendar, Filter, Download, Eye, ChevronDown, ChevronUp, Globe, Star } from "lucide-react"

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

export default function HistoryPage() {
  const [searches, setSearches] = useState<SearchResult[]>([])
  const [filteredSearches, setFilteredSearches] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [expandedSearches, setExpandedSearches] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/user/searches")
        if (response.ok) {
          const data = await response.json()
          setSearches(data.searches || [])
          setFilteredSearches(data.searches || [])
        }
      } catch (error) {
        console.error("Error loading history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  useEffect(() => {
    let filtered = searches

    if (searchFilter) {
      filtered = filtered.filter(
        (search) =>
          search.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
          (search.competitor_query && search.competitor_query.toLowerCase().includes(searchFilter.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((search) => search.type === typeFilter || search.analysis_type === typeFilter)
    }

    setFilteredSearches(filtered)
  }, [searches, searchFilter, typeFilter])

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

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredSearches, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `search-history-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">View all your searches and analyses</p>
        </div>
        <Button onClick={exportHistory} variant="outline" disabled={filteredSearches.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by query...</label>
              <Input
                placeholder="Filter by query..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="single">Simple Analysis</SelectItem>
                  <SelectItem value="duel">Duel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredSearches.length}</div>
            <p className="text-xs text-muted-foreground">Searches found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredSearches.filter((s) => s.type === "single" || s.analysis_type === "single").length}
            </div>
            <p className="text-xs text-muted-foreground">Simple analyses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredSearches.filter((s) => s.type === "duel" || s.analysis_type === "duel").length}
            </div>
            <p className="text-xs text-muted-foreground">Duels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredSearches.reduce((avg, search) => {
                const scores = Object.values(search.scores || {}).filter((s) => typeof s === "number") as number[]
                const searchAvg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
                return avg + searchAvg
              }, 0) / (filteredSearches.length || 1)}
            </div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Search History
          </CardTitle>
          <CardDescription>
            {filteredSearches.length} result{filteredSearches.length > 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSearches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No searches found</p>
              <p className="text-sm">Try modifying your filters or perform a new search</p>
              <Button asChild className="mt-4">
                <a href="/dashboard/search">
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSearches.map((search) => {
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

                      {search.gpt_analysis && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 w-4 text-primary" />
                            <span className="font-medium">AI Analysis</span>
                          </div>
                          <p className={`text-muted-foreground ${!isExpanded ? "line-clamp-3" : ""}`}>
                            {typeof search.gpt_analysis === "string"
                              ? search.gpt_analysis
                              : search.gpt_analysis.summary || "Analysis available"}
                          </p>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-4 border-t pt-4">
                          {search.results && typeof search.results === "object" && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Detailed Results
                              </h4>
                              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                                <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                                  {JSON.stringify(search.results, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {search.gpt_analysis && typeof search.gpt_analysis === "object" && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Full AI Analysis
                              </h4>
                              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                                <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                                  {JSON.stringify(search.gpt_analysis, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>
                            {search.results && typeof search.results === "object"
                              ? `${Object.keys(search.results).length} results`
                              : "Results available"}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toggleSearchDetails(search.id)}>
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              View Details
                            </>
                          )}
                        </Button>
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
  )
}
