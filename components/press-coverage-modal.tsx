"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Activity, BarChart2, Globe, Clock, ExternalLink, FileText } from "lucide-react"

interface PressSource {
  title: string
  snippet: string
  url: string
  source: string
  date: string
  relevanceScore: number
  mediaType: string
}

interface PressCoverageResult {
  query: string
  globalScore: number
  coverageScore: number
  qualityScore: number
  reachScore: number
  totalArticles: number
  recognizedMediaCount: number
  analysis: string
  topSources: PressSource[]
  recommendations: string[]
  processingTime: number
}

interface PressCoverageModalProps {
  query: string
}

export function PressCoverageModal({ query }: PressCoverageModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PressCoverageResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzePressCoverage = async () => {
    if (!query.trim()) {
      setError("Veuillez saisir un terme de recherche")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    console.log("[v0] Press Coverage Modal: Starting analysis for:", query)

    try {
      const response = await fetch("/api/press-coverage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      console.log("[v0] Press Coverage Modal: API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Press Coverage Modal: Analysis completed:", data)

      setResult(data)
      setIsOpen(true)
    } catch (err) {
      console.error("[v0] Press Coverage Modal: Error:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellente"
    if (score >= 60) return "Bonne"
    if (score >= 40) return "Moyenne"
    return "Faible"
  }

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case "international":
        return "bg-blue-100 text-blue-800"
      case "national":
        return "bg-green-100 text-green-800"
      case "specialized":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Button
        onClick={analyzePressCoverage}
        disabled={isLoading || !query.trim()}
        className="w-full bg-red-900/80 hover:bg-red-800 text-white font-mono uppercase tracking-widest border border-red-500/30"
      >
        {isLoading ? "INTERCEPTION..." : "LANCER L'INVESTIGATION PRESSE"}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[1400px] w-[96vw] max-h-[92vh] overflow-hidden flex flex-col bg-black border border-red-900/30 shadow-[0_0_80px_rgba(153,27,27,0.15)] p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-red-900/20 bg-gradient-to-r from-red-950/5 via-transparent to-red-950/5">
            <div>
              <DialogTitle className="flex items-center gap-3 text-white font-heading uppercase tracking-tight text-2xl font-bold mb-1">
                <Newspaper className="w-7 h-7 text-red-500" strokeWidth={2.5} />
                {isLoading ? "INTERCEPTION MÉDIA" : "Rapport Média"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-sans text-sm">
                Cible : <span className="text-red-500">{query}</span>
              </DialogDescription>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 space-y-12">
              {/* Media Intelligence Gathering Screen */}
              <div className="relative bg-black border-2 border-red-900/50 rounded-lg p-16 overflow-hidden shadow-2xl shadow-red-500/20">
                {/* Animated grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

                {/* Scanning beam effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>

                {/* Satellite signal rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
                  <div className="absolute inset-0 border border-red-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-8 border border-red-500/30 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>
                  <div className="absolute inset-16 border border-red-500/40 rounded-full animate-[ping_2s_ease-in-out_infinite_1s]"></div>
                </div>

                <div className="flex flex-col items-center gap-12 relative z-10">
                  {/* Central Hub with Newspaper icon */}
                  <div className="relative w-48 h-48 animate-[zoomIn_0.3s_ease-out]">
                    {/* Pulsing outer rings */}
                    <div className="absolute inset-0 border-2 border-red-500/60 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-3 border border-red-500/40 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>

                    {/* Rotating signal sweep */}
                    <div className="absolute inset-6 border border-red-500/30 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-red-600 via-red-500 to-transparent animate-[spin_2s_linear_infinite]"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-transparent animate-[spin_3s_linear_infinite_reverse]"></div>
                    </div>

                    {/* Center icon */}
                    <div className="absolute inset-10 rounded-full bg-gradient-to-br from-red-950 to-black border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/40">
                      <Newspaper className="w-16 h-16 text-red-500 animate-[pulse_2s_ease-in-out_infinite]" />
                    </div>

                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>
                  </div>

                  {/* Status Display */}
                  <div className="text-center space-y-4 w-full max-w-md">
                    <div className="font-heading text-2xl font-bold text-white uppercase tracking-widest">
                      INTERCEPTION EN COURS
                    </div>
                    <div className="text-sm text-red-400 uppercase tracking-widest animate-pulse">
                      Balayage des sources médiatiques...
                    </div>

                    {/* Animated progress bar */}
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-red-900/30">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-[shimmer_2s_ease-in-out_infinite]"
                        style={{ width: "100%" }}
                      />
                    </div>

                    {/* Activity indicators */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-500/30 rounded-full">
                        <Globe className="w-3 h-3 text-red-400 animate-spin" />
                        <span className="text-xs text-red-400">Sources</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-500/30 rounded-full">
                        <Activity className="w-3 h-3 text-red-400 animate-pulse" />
                        <span className="text-xs text-red-400">Analyse</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-500/30 rounded-full">
                        <BarChart2 className="w-3 h-3 text-red-400 animate-bounce" />
                        <span className="text-xs text-red-400">Scoring</span>
                      </div>
                    </div>
                  </div>

                  {/* Target info */}
                  <div className="text-center space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Requête active</div>
                    <div className="font-heading text-xl font-bold text-white uppercase px-6 py-2 border border-red-900/30 bg-red-950/20 rounded">
                      {query}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[url('/grid-pattern.svg')]">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Impact Global", value: result.globalScore, icon: Activity },
                  {
                    label: "Volume",
                    value: result.coverageScore,
                    sub: `${result.totalArticles} Articles`,
                    icon: BarChart2,
                  },
                  { label: "Qualité", value: result.qualityScore, sub: "Sentiment", icon: Newspaper },
                  {
                    label: "Portée",
                    value: result.reachScore,
                    sub: `${result.recognizedMediaCount} Sources`,
                    icon: Globe,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/50 border border-white/10 p-4 relative overflow-hidden group hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500 font-mono uppercase">{stat.label}</span>
                      <stat.icon className="w-4 h-4 text-red-900 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    {stat.sub && <div className="text-xs text-gray-600 font-mono">{stat.sub}</div>}
                    <div className="absolute bottom-0 left-0 h-1 bg-red-900 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </div>
                ))}
              </div>

              {/* Analysis Text - Better formatting */}
              <div className="bg-black/40 border border-red-900/20 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-red-500" />
                  <h3 className="text-white font-heading uppercase text-lg font-bold tracking-wide">
                    Synthèse Tactique
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-base">{result.analysis}</p>
              </div>

              {/* Articles List */}
              {result.topSources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-mono uppercase text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    Interceptions Confirmées
                  </h3>
                  <div className="grid gap-3">
                    {result.topSources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-zinc-900/30 border border-white/5 hover:border-red-500/30 hover:bg-zinc-900/80 transition-all group"
                      >
                        <div className="text-2xl font-bold text-gray-700 font-mono w-12 text-center group-hover:text-red-500">
                          {source.relevanceScore}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="text-xs font-mono border-white/10 text-gray-500">
                              {source.mediaType}
                            </Badge>
                            <span className="text-xs text-red-400 uppercase">{source.source}</span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {source.date}
                            </span>
                          </div>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-white font-medium hover:text-red-500 transition-colors line-clamp-1 flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                          >
                            {source.title}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          </a>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-mono">{source.snippet}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
