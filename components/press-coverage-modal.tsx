"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? "Analyse en cours..." : "📰 Analyser la Couverture Presse"}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">📰 Couverture Presse - {result?.query}</DialogTitle>
            <DialogDescription>Analyse de la couverture par les médias reconnus</DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-6">
              {/* Scores principaux */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Score Global</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(result.globalScore)}`}>
                      {result.globalScore}/100
                    </div>
                    <p className="text-xs text-gray-600">{getScoreLabel(result.globalScore)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Couverture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(result.coverageScore)}`}>
                      {result.coverageScore}/100
                    </div>
                    <p className="text-xs text-gray-600">{result.totalArticles} articles</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Qualité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(result.qualityScore)}`}>
                      {result.qualityScore}/100
                    </div>
                    <p className="text-xs text-gray-600">Analyse contenu</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Portée</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(result.reachScore)}`}>
                      {result.reachScore}/100
                    </div>
                    <p className="text-xs text-gray-600">{result.recognizedMediaCount} médias</p>
                  </CardContent>
                </Card>
              </div>

              {/* Barres de progression */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Couverture</span>
                    <span>{result.coverageScore}%</span>
                  </div>
                  <Progress value={result.coverageScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Qualité</span>
                    <span>{result.qualityScore}%</span>
                  </div>
                  <Progress value={result.qualityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Portée</span>
                    <span>{result.reachScore}%</span>
                  </div>
                  <Progress value={result.reachScore} className="h-2" />
                </div>
              </div>

              {/* Analyse */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
                </CardContent>
              </Card>

              {/* Sources principales */}
              {result.topSources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Articles Trouvés</CardTitle>
                    <CardDescription>{result.topSources.length} articles dans les médias reconnus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.topSources.map((source, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm leading-tight mb-1">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {source.title}
                                </a>
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{source.snippet}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className={getMediaTypeColor(source.mediaType)}>
                                  {source.mediaType}
                                </Badge>
                                <span className="text-gray-500">{source.source}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">{source.date}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">{source.relevanceScore}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommandations */}
              {result.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommandations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Métadonnées */}
              <div className="text-xs text-gray-500 text-center">Analyse effectuée en {result.processingTime}ms</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
