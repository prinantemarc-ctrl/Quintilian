"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PremiumGuard } from "@/components/paywall/premium-guard"
import { CreditGuard } from "@/components/credits/credit-guard"
import { Search, Sparkles, Zap, TrendingUp, Globe, Brain, Loader2 } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la recherche")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Erreur de recherche:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recherche IA</h1>
        <p className="text-muted-foreground">Effectuez des recherches intelligentes avec l'IA</p>
      </div>

      <CreditGuard requiredCredits={1}>
        <div className="grid gap-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Nouvelle recherche
              </CardTitle>
              <CardDescription>Entrez votre requête pour obtenir des résultats analysés par l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="query">Votre recherche</Label>
                  <Input
                    id="query"
                    placeholder="Ex: Analyse de sentiment sur Tesla..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isSearching}
                  />
                </div>
                <Button type="submit" disabled={isSearching || !query.trim()} className="w-full">
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Lancer la recherche (1 crédit)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <span className="font-medium">Erreur:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  Résultats de la recherche
                </CardTitle>
                <CardDescription>Analyse générée par l'intelligence artificielle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.scores?.relevance || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Pertinence</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.scores?.confidence || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Confiance</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.processing_time || "N/A"}ms</div>
                    <div className="text-sm text-muted-foreground">Temps</div>
                  </div>
                </div>

                {results.analysis && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Analyse IA
                    </h4>
                    <p className="text-sm leading-relaxed">{results.analysis}</p>
                  </div>
                )}

                {results.sources && results.sources.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Sources ({results.sources.length})
                    </h4>
                    <div className="space-y-2">
                      {results.sources.slice(0, 5).map((source: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{source.title}</div>
                            <div className="text-xs text-muted-foreground">{source.url}</div>
                          </div>
                          <Badge variant="outline">{source.type || "Web"}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Premium Features */}
          <div className="grid gap-6 md:grid-cols-2">
            <PremiumGuard feature="Recherche avancée" requiredCredits={2} showUpgrade={false}>
              <Card className="border-dashed border-yellow-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Recherche avancée
                    <Badge variant="secondary">Premium</Badge>
                  </CardTitle>
                  <CardDescription>Recherches plus précises avec filtres avancés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Filtres par date et source
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Analyse de sentiment approfondie
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Export des résultats
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Débloquer (2 crédits)
                  </Button>
                </CardContent>
              </Card>
            </PremiumGuard>

            <PremiumGuard feature="Analyse comparative" requiredCredits={3} showUpgrade={false}>
              <Card className="border-dashed border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Analyse comparative
                    <Badge variant="secondary">Premium</Badge>
                  </CardTitle>
                  <CardDescription>Comparez plusieurs sujets simultanément</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Comparaison côte à côte
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Graphiques de performance
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Recommandations IA
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Débloquer (3 crédits)
                  </Button>
                </CardContent>
              </Card>
            </PremiumGuard>
          </div>
        </div>
      </CreditGuard>
    </div>
  )
}
