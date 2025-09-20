"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface CountryResult {
  country: string
  countryCode: string
  flag: string
  presence: number
  sentiment: number
  coherence: number
  globalScore: number
  analysis: string
  presenceRationale: string
  sentimentRationale: string
  coherenceRationale: string
}

interface WorldReputationModalProps {
  isOpen: boolean
  onClose: () => void
  results: {
    query: string
    totalCountries: number
    results: CountryResult[]
    bestCountry: CountryResult
    worstCountry: CountryResult
    globalAnalysis: string
    averageScore: number
  }
  query: string
}

export function WorldReputationModal({ isOpen, onClose, results }: WorldReputationModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Bon"
    if (score >= 40) return "Moyen"
    return "Faible"
  }

  const hasResults = results.results && results.results.length > 0
  const bestCountry = results.bestCountry
  const worstCountry = results.worstCountry

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-2xl max-h-screen overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-background via-muted/20 to-background min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Réputation Mondiale de "{results.query}"</h1>
                <p className="text-primary-foreground/80">Analyse comparative dans {results.totalCountries} pays</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{results.averageScore}/100</div>
                <div className="text-sm text-primary-foreground/80">Score Moyen Global</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!hasResults ? (
              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 mb-8">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-600">
                    <h2 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h2>
                    <p>Aucune donnée disponible pour "{results.query}" dans les pays analysés.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Winner Section */}
                {bestCountry && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mb-8">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-600" />
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-yellow-800">
                            {bestCountry.flag} {bestCountry.country} remporte !
                          </h2>
                          <p className="text-yellow-700">Score global : {bestCountry.globalScore}/100</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Global Analysis */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analyse Comparative Globale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{results.globalAnalysis}</p>
                  </CardContent>
                </Card>

                {/* Countries Grid */}
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.results
                    .sort((a, b) => b.globalScore - a.globalScore)
                    .map((country, index) => (
                      <Card key={country.countryCode} className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <span className="text-2xl">{country.flag}</span>
                              {country.country}
                              {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                            </CardTitle>
                            <Badge variant={country.globalScore >= 70 ? "default" : "secondary"}>#{index + 1}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Global Score */}
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <div className={`text-3xl font-bold ${getScoreColor(country.globalScore)}`}>
                              {country.globalScore}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Score Global - {getScoreLabel(country.globalScore)}
                            </div>
                          </div>

                          {/* Detailed Scores */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Présence Digitale</span>
                                <span className={`text-sm font-bold ${getScoreColor(country.presence)}`}>
                                  {country.presence}
                                </span>
                              </div>
                              <Progress value={country.presence} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{country.presenceRationale}</p>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Sentiment</span>
                                <span className={`text-sm font-bold ${getScoreColor(country.sentiment)}`}>
                                  {country.sentiment}
                                </span>
                              </div>
                              <Progress value={country.sentiment} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{country.sentimentRationale}</p>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Cohérence</span>
                                <span className={`text-sm font-bold ${getScoreColor(country.coherence)}`}>
                                  {country.coherence}
                                </span>
                              </div>
                              <Progress value={country.coherence} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{country.coherenceRationale}</p>
                            </div>
                          </div>

                          {/* Analysis */}
                          <div className="pt-3 border-t">
                            <h4 className="font-medium mb-2">Analyse Détaillée</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{country.analysis}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {bestCountry && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-5 h-5" />
                          Meilleur Marché
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{bestCountry.flag}</span>
                          <div>
                            <div className="font-semibold">{bestCountry.country}</div>
                            <div className="text-2xl font-bold text-green-600">{bestCountry.globalScore}/100</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {worstCountry && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <TrendingDown className="w-5 h-5" />
                          Marché à Améliorer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{worstCountry.flag}</span>
                          <div>
                            <div className="font-semibold">{worstCountry.country}</div>
                            <div className="text-2xl font-bold text-red-600">{worstCountry.globalScore}/100</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
