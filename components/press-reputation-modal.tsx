"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/language-context"

interface PressReputationModalProps {
  isOpen: boolean
  onClose: () => void
  results: any
  query: string
}

export function PressReputationModal({ isOpen, onClose, results, query }: PressReputationModalProps) {
  const { t } = useLanguage()

  if (!results) return null

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600"
    if (score >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getSentimentBadge = (sentiment: string) => {
    const variants = {
      positive: "default",
      negative: "destructive",
      neutral: "secondary",
      mixed: "outline",
    } as const

    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || "secondary"}>
        {sentiment === "positive"
          ? "Positif"
          : sentiment === "negative"
            ? "Négatif"
            : sentiment === "neutral"
              ? "Neutre"
              : "Mitigé"}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">📰 Analyse de Presse : "{query}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{results.results?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Pays analysés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{results.totalArticles || 0}</div>
                <p className="text-xs text-muted-foreground">Articles trouvés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {results.results
                    ? (
                        results.results.reduce((sum: number, r: any) => sum + r.score, 0) / results.results.length
                      ).toFixed(1)
                    : "0.0"}
                </div>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </CardContent>
            </Card>
          </div>

          {/* Country Results */}
          <div className="space-y-4">
            {results.results?.map((result: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {result.country === "FR"
                          ? "🇫🇷"
                          : result.country === "DE"
                            ? "🇩🇪"
                            : result.country === "ES"
                              ? "🇪🇸"
                              : result.country === "IT"
                                ? "🇮🇹"
                                : result.country === "GB"
                                  ? "🇬🇧"
                                  : result.country === "US"
                                    ? "🇺🇸"
                                    : result.country === "CA"
                                      ? "🇨🇦"
                                      : result.country === "JP"
                                        ? "🇯🇵"
                                        : result.country === "CN"
                                          ? "🇨🇳"
                                          : result.country === "AE"
                                            ? "🇦🇪"
                                            : result.country === "SA"
                                              ? "🇸🇦"
                                              : result.country === "AR"
                                                ? "🇦🇷"
                                                : result.country === "BR"
                                                  ? "🇧🇷"
                                                  : result.country === "ZA"
                                                    ? "🇿🇦"
                                                    : result.country === "CD"
                                                      ? "🇨🇩"
                                                      : result.country === "IN"
                                                        ? "🇮🇳"
                                                        : result.country === "AU"
                                                          ? "🇦🇺"
                                                          : "🌍"}
                      </span>
                      <span>{result.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSentimentBadge(result.sentiment)}
                      <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>{result.score}/10</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Score de réputation presse</span>
                      <span>{result.score}/10</span>
                    </div>
                    <Progress value={result.score * 10} className="h-2" />
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Résumé</h4>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  {/* Key Topics */}
                  {result.keyTopics && result.keyTopics.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Sujets clés</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keyTopics.map((topic: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {result.riskFactors && result.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">⚠️ Facteurs de risque</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.riskFactors.map((risk: string, i: number) => (
                          <Badge key={i} variant="destructive">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  {result.articles && result.articles.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Articles de presse</h4>
                      <div className="space-y-2">
                        {result.articles.slice(0, 3).map((article: any, i: number) => (
                          <div key={i} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{article.title}</h5>
                                <p className="text-xs text-muted-foreground mt-1">{article.snippet}</p>
                                <p className="text-xs text-primary mt-1">{article.source}</p>
                              </div>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                🔗
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
