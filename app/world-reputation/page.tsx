"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Globe, Search, TrendingUp, MapPin, Users, AlertCircle } from "lucide-react"
import { WorldReputationModal } from "@/components/world-reputation-modal"
import { useLanguage } from "@/contexts/language-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const AVAILABLE_COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "AE", name: "Émirats Arabes Unis", flag: "🇦🇪" },
  { code: "SA", name: "Arabie Saoudite", flag: "🇸🇦" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AR", name: "Argentine", flag: "🇦🇷" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "CD", name: "Congo", flag: "🇨🇩" },
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
]

export default function WorldReputationPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isPressAnalyzing, setIsPressAnalyzing] = useState(false)
  const [pressResults, setPressResults] = useState<any>(null)
  const [showPressModal, setShowPressModal] = useState(false)
  const [pressError, setPressError] = useState<string | null>(null)

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(countryCode)) {
        return prev.filter((c) => c !== countryCode)
      } else if (prev.length < 5) {
        return [...prev, countryCode]
      }
      return prev
    })
  }

  const handleAnalyze = async () => {
    if (!query.trim() || selectedCountries.length === 0) return

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log("[v0] Starting world reputation analysis for:", query, "in countries:", selectedCountries)

      const response = await fetch("/api/world-reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          countries: selectedCountries,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }))
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Analysis results:", data)

      setResults(data)
      setShowModal(true)
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de l'analyse")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePressAnalysis = async () => {
    if (!query.trim()) {
      setPressError("Veuillez saisir un terme de recherche")
      return
    }

    if (selectedCountries.length === 0) {
      setPressError("Veuillez sélectionner au moins un pays")
      return
    }

    setIsPressAnalyzing(true)
    setPressError(null)
    setPressResults(null)

    console.log("[v0] Starting press analysis for:", query, "in countries:", selectedCountries)

    try {
      const response = await fetch("/api/press-reputation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          countries: selectedCountries,
        }),
      })

      console.log("[v0] Press API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Press analysis completed:", data)

      setPressResults(data)
      setShowPressModal(true)
    } catch (err) {
      console.error("[v0] Press analysis error:", err)
      setPressError(err instanceof Error ? err.message : "Erreur lors de l'analyse")
    } finally {
      setIsPressAnalyzing(false)
    }
  }

  const getSelectedCountryNames = () => {
    return selectedCountries
      .map((code) => {
        const country = AVAILABLE_COUNTRIES.find((c) => c.code === code)
        return country ? country.name : null
      })
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            {t("gmi.title")}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("gmi.subtitle")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("gmi.subtitle") === "Découvrez votre réputation"
                ? "dans le monde"
                : t("gmi.subtitle") === "Discover your reputation"
                  ? "in the world"
                  : "en el mundo"}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("gmi.description")}</p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t("gmi.search_title")}
            </CardTitle>
            <CardDescription>{t("gmi.search_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="query">{t("gmi.search_label")}</Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("gmi.search_placeholder")}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Country Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("gmi.country_selection")} ({selectedCountries.length}/5)
            </CardTitle>
            <CardDescription>{t("gmi.country_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Country Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {AVAILABLE_COUNTRIES.map((country) => {
                const isSelected = selectedCountries.includes(country.code)
                const canSelect = selectedCountries.length < 5 || isSelected

                return (
                  <Button
                    key={country.code}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCountryToggle(country.code)}
                    disabled={!canSelect}
                    className={`justify-start gap-2 ${
                      isSelected ? "bg-primary text-primary-foreground" : ""
                    } ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </Button>
                )
              })}
            </div>

            {selectedCountries.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{t("gmi.selected_countries")}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCountries.map((code) => {
                    const country = AVAILABLE_COUNTRIES.find((c) => c.code === code)
                    return (
                      <Badge key={code} variant="secondary" className="gap-1">
                        <span>{country?.flag}</span>
                        {country && country.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={!query.trim() || selectedCountries.length === 0 || isAnalyzing}
              size="lg"
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("gmi.analyzing")}
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyse Mondiale
                </>
              )}
            </Button>

            <Button
              onClick={handlePressAnalysis}
              disabled={!query.trim() || selectedCountries.length === 0 || isPressAnalyzing}
              size="lg"
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isPressAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>📰 Analyser la Presse</>
              )}
            </Button>
          </div>

          {pressError && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{pressError}</AlertDescription>
            </Alert>
          )}

          {selectedCountries.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("gmi.estimated_cost").replace("{count}", (selectedCountries.length * 3).toString())}
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-primary" />
                {t("gmi.geo_analysis_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("gmi.geo_analysis_desc")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                {t("gmi.targeted_analysis_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("gmi.targeted_analysis_desc")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t("gmi.detailed_comparison_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("gmi.detailed_comparison_desc")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Modals */}
      {results && (
        <WorldReputationModal isOpen={showModal} onClose={() => setShowModal(false)} results={results} query={query} />
      )}

      <Dialog open={showPressModal} onOpenChange={setShowPressModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📰 Couverture Presse - {pressResults?.query}</DialogTitle>
            <DialogDescription>
              Analyse de la couverture par les médias reconnus dans {pressResults?.totalCountries} pays
            </DialogDescription>
          </DialogHeader>

          {pressResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse Globale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{pressResults.averageScore}/100</div>
                  <p className="text-gray-700">{pressResults.globalAnalysis}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Meilleure couverture:</span> {pressResults.bestCountry?.country} (
                      {pressResults.bestCountry?.score}/100)
                    </div>
                    <div>
                      <span className="font-medium">Articles trouvés:</span> {pressResults.totalArticles}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Résultats par Pays</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pressResults.results?.map((result: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{result.flag}</span>
                            <span className="font-medium">{result.country}</span>
                          </div>
                          <div className="text-xl font-bold text-blue-600">{result.score}/100</div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.summary}</p>

                        {/* Articles for this country */}
                        {result.articles && result.articles.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Articles ({result.articles.length})</h5>
                            {result.articles.slice(0, 3).map((article: any, articleIndex: number) => (
                              <div key={articleIndex} className="border-l-2 border-blue-200 pl-3">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm font-medium"
                                >
                                  {article.title}
                                </a>
                                <p className="text-xs text-gray-500 mt-1">{article.snippet}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {article.source}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
