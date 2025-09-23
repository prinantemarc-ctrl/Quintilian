"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  Search,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Shield,
  Bot,
  AlertTriangle,
  RefreshCw,
  Edit3,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea" // Added Textarea component

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

interface PressArticle {
  id: string
  title: string
  source: string
  url: string
  date: string
  country: string
  language: string
  sentiment: "positive" | "negative" | "neutral"
  credibility: number
}

// Added EntityOption interface
interface EntityOption {
  id: string
  name: string
  description: string
  type: "company" | "person" | "location" | "organization" | "entity" // Added 'entity' type
  context: string
}

interface PressData {
  articles: PressArticle[]
  results?: Array<{
    country: string
    countryCode: string
    flag: string
    articles: PressArticle[]
    kpis: {
      totalArticles: number
      uniqueOutlets: number
      pressScore: number
      tonalityScore: number
    }
    gptAnalysis: string
    isUncertain: boolean
  }>
  kpis: {
    totalArticles: number
    uniqueOutlets: number
    countries: number
    pressScore: number
    tonalityScore: number
  }
  timeline: Array<{ date: string; articles: number }>
  countryData: { [key: string]: number }
}

export default function PressePage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PressData | null>(null)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["FR"])
  const [comparisonQuery, setComparisonQuery] = useState("")
  const [showComparison, setShowComparison] = useState(false)
  const [showDisambiguation, setShowDisambiguation] = useState(false)
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([])
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null)
  const [disambiguationLoading, setDisambiguationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customEntity, setCustomEntity] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    if (data) {
      console.log("[v0] Press data received:", {
        globalKpis: data.kpis,
        pressScore: data.kpis?.pressScore,
        results: data.results?.map((r) => ({
          country: r.country,
          pressScore: r.kpis?.pressScore,
          isUncertain: r.isUncertain,
        })),
      })
    }
  }, [data])

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

  const mockData: PressData = {
    articles: [
      {
        id: "1",
        title: "Innovation technologique : une nouvelle approche révolutionnaire",
        source: "Le Monde",
        url: "https://lemonde.fr/article1",
        date: "2025-01-15",
        country: "FR",
        language: "fr",
        sentiment: "positive",
        credibility: 95,
      },
      {
        id: "2",
        title: "Market disruption in the tech sector",
        source: "Financial Times",
        url: "https://ft.com/article2",
        date: "2025-01-14",
        country: "GB",
        language: "en",
        sentiment: "neutral",
        credibility: 92,
      },
      {
        id: "3",
        title: "Controverse autour des nouvelles pratiques",
        source: "Les Échos",
        url: "https://lesechos.fr/article3",
        date: "2025-01-13",
        country: "FR",
        language: "fr",
        sentiment: "negative",
        credibility: 88,
      },
    ],
    kpis: {
      totalArticles: 47,
      uniqueOutlets: 23,
      countries: 8,
      pressScore: 73,
      tonalityScore: 12,
    },
    timeline: [
      { date: "2025-01-10", articles: 3 },
      { date: "2025-01-11", articles: 7 },
      { date: "2025-01-12", articles: 5 },
      { date: "2025-01-13", articles: 12 },
      { date: "2025-01-14", articles: 8 },
      { date: "2025-01-15", articles: 12 },
    ],
    countryData: {
      FR: 18,
      GB: 12,
      US: 8,
      DE: 5,
      ES: 4,
    },
  }

  const handleCustomEntitySubmit = () => {
    if (customEntity.trim()) {
      const customEntityOption: EntityOption = {
        id: "custom-entity",
        name: customEntity.trim(),
        description: customEntity.trim(),
        type: "entity" as const,
        context: "Entité personnalisée saisie manuellement",
      }
      handleEntitySelection(customEntityOption)
      setCustomEntity("")
      setShowCustomInput(false)
    }
  }

  // Added disambiguation handler
  const handleDisambiguation = async () => {
    // This function is now only called when disambiguation is already triggered
    // The entities are already set by handleSearch
  }

  // Added entity selection handler
  const handleEntitySelection = (entity: EntityOption) => {
    setSelectedEntity(entity)
    setShowDisambiguation(false)
    handleSearch(entity)
  }

  const handleSearch = async (searchEntity: any = null) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    console.log("[v0] Starting press analysis...")
    console.log("[v0] Search query:", query.trim())
    console.log("[v0] Selected countries:", selectedCountries)
    console.log("[v0] Search entity:", searchEntity)

    try {
      const response = await fetch("/api/presse-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          countries: selectedCountries,
          entityType: searchEntity?.type,
          entityContext: searchEntity?.context,
          userLanguage: "fr",
          selected_identity: searchEntity?.name || searchEntity?.description,
        }),
      })

      const result = await response.json()
      console.log("[v0] Press analysis completed:", result)

      if (result.requires_identity_selection && result.identified_entities) {
        // Convert identified_entities to EntityOption format
        const entityOptions = result.identified_entities.map((entity: string, index: number) => ({
          id: `entity-${index}`,
          name: entity,
          description: entity,
          type: "entity",
          context: `Entité détectée dans les résultats de recherche`,
        }))

        setEntityOptions(entityOptions)
        setShowDisambiguation(true)
        setError(result.message || "Plusieurs identités détectées. Veuillez choisir celle qui vous intéresse.")
      } else if (result.kpis && result.articles) {
        // Normal result with data
        setData(result)
      } else {
        // Unexpected result format
        setError("Format de réponse inattendu")
      }
    } catch (error) {
      console.error("[v0] Press analysis error:", error)
      setError("Erreur lors de l'analyse. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryCode) ? prev.filter((c) => c !== countryCode) : [...prev, countryCode],
    )
  }

  const handleAnalyze = async () => {
    if (!query.trim() || selectedCountries.length === 0) {
      return
    }

    setLoading(true)
    setData(null)
    setError(null)

    try {
      console.log("[v0] Starting press analysis...")
      console.log("[v0] Search query:", query)
      console.log("[v0] Selected countries:", selectedCountries)
      console.log("[v0] Search entity:", selectedEntity)

      const userLanguage = navigator.language.startsWith("fr")
        ? "fr"
        : navigator.language.startsWith("en")
          ? "en"
          : navigator.language.startsWith("es")
            ? "es"
            : "fr"

      const response = await fetch("/api/presse-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          countries: selectedCountries,
          entityType: selectedEntity?.type,
          entityContext: selectedEntity?.context,
          userLanguage, // Added userLanguage parameter
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Press analysis completed:", result)
      console.log("[v0] Press data received:", result)

      if (result.requires_identity_selection && result.identified_entities) {
        // Convert identified_entities to EntityOption format
        const entityOptions = result.identified_entities.map((entity: string, index: number) => ({
          id: `entity-${index}`,
          name: entity,
          description: entity,
          type: "entity",
          context: `Entité détectée dans les résultats de recherche`,
        }))

        setEntityOptions(entityOptions)
        setShowDisambiguation(true)
        setError(result.message || "Plusieurs identités détectées. Veuillez choisir celle qui vous intéresse.")
      } else if (result.kpis && result.articles) {
        // Normal result with data
        setData(result)
      } else {
        // Unexpected result format
        setError("Format de réponse inattendu")
      }
    } catch (error) {
      console.error("[v0] Press analysis error:", error)
      setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />
      case "negative":
        return <TrendingDown className="w-3 h-3" />
      default:
        return null
    }
  }

  const getSentimentAnalysis = () => {
    if (!data?.articles) return null

    const sentiments = data.articles.reduce(
      (acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const total = data.articles.length
    return {
      positive: Math.round(((sentiments.positive || 0) / total) * 100),
      negative: Math.round(((sentiments.negative || 0) / total) * 100),
      neutral: Math.round(((sentiments.neutral || 0) / total) * 100),
      total,
    }
  }

  const getMediaCredibilityAnalysis = () => {
    if (!data?.articles) return []

    const mediaStats = data.articles.reduce(
      (acc, article) => {
        if (!acc[article.source]) {
          acc[article.source] = {
            source: article.source,
            articles: 0,
            avgCredibility: 0,
            totalCredibility: 0,
          }
        }
        acc[article.source].articles += 1
        acc[article.source].totalCredibility += article.credibility
        acc[article.source].avgCredibility = Math.round(
          acc[article.source].totalCredibility / acc[article.source].articles,
        )
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(mediaStats).sort((a: any, b: any) => b.avgCredibility - a.avgCredibility)
  }

  const getMediaLogo = (source: string) => {
    const logos: Record<string, string> = {
      "lemonde.fr": "🌍",
      "lefigaro.fr": "📰",
      "liberation.fr": "🗞️",
      "lesechos.fr": "💼",
      "nytimes.com": "🗽",
      "washingtonpost.com": "🏛️",
      "reuters.com": "📡",
      "bloomberg.com": "📈",
      "bbc.com": "🇬🇧",
      "theguardian.com": "🛡️",
      "telegraph.co.uk": "📻",
      "Financial Times": "💰",
      "Le Monde": "🌍",
      "Les Échos": "💼",
    }
    return logos[source] || "📄"
  }

  const getPersonalizedScoreExplanation = () => {
    if (!data || !data.kpis) return null

    const { kpis, articles } = data
    const { pressScore, totalArticles, uniqueOutlets, tonalityScore } = kpis

    let explanation = `Votre Score Presse de ${pressScore}/100 est basé sur l'analyse de ${totalArticles} articles trouvés dans ${uniqueOutlets} médias différents. `

    if (pressScore >= 80) {
      explanation +=
        "Excellente performance ! Vous bénéficiez d'une très forte visibilité médiatique avec une couverture diversifiée. "
    } else if (pressScore >= 60) {
      explanation += "Bonne performance médiatique avec une présence notable dans la presse. "
    } else if (pressScore >= 40) {
      explanation += "Présence médiatique modérée, il y a des opportunités d'amélioration. "
    } else {
      explanation += "Visibilité médiatique limitée, votre stratégie de relations presse nécessite un renforcement. "
    }

    const sentimentAnalysis = getSentimentAnalysis()
    if (sentimentAnalysis) {
      if (tonalityScore > 10) {
        explanation += `La tonalité globale est très positive (+${tonalityScore}) avec ${sentimentAnalysis.positive}% d'articles favorables. `
      } else if (tonalityScore > 0) {
        explanation += `La tonalité est légèrement positive (+${tonalityScore}) avec un équilibre entre articles positifs (${sentimentAnalysis.positive}%) et neutres. `
      } else if (tonalityScore > -10) {
        explanation += `La tonalité est mitigée (${tonalityScore}) avec ${sentimentAnalysis.negative}% d'articles négatifs à surveiller. `
      } else {
        explanation += `Attention : la tonalité est majoritairement négative (${tonalityScore}) avec ${sentimentAnalysis.negative}% d'articles défavorables. `
      }
    }

    const avgCredibility = articles.reduce((sum, article) => sum + article.credibility, 0) / articles.length
    explanation += `La crédibilité moyenne de vos sources est de ${Math.round(avgCredibility)}%, ce qui ${avgCredibility >= 80 ? "renforce la fiabilité" : avgCredibility >= 60 ? "assure une fiabilité correcte" : "nécessite d'améliorer la qualité"} de votre couverture presse.`

    return explanation
  }

  const getCountrySentimentAnalysis = (articles: PressArticle[]) => {
    if (!articles || articles.length === 0) return null

    const sentiments = articles.reduce(
      (acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const total = articles.length
    return {
      positive: Math.round(((sentiments.positive || 0) / total) * 100),
      negative: Math.round(((sentiments.negative || 0) / total) * 100),
      neutral: Math.round(((sentiments.neutral || 0) / total) * 100),
      total,
    }
  }

  const sentimentAnalysis = getSentimentAnalysis()
  const mediaCredibility = getMediaCredibilityAnalysis()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Analyse de Couverture Presse</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Mesurez votre présence médiatique et analysez la tonalité de votre couverture presse
          </p>

          <div className="max-w-3xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0">ℹ️</div>
              <div className="text-left">
                <h3 className="font-medium text-amber-900 mb-1">À propos des résultats de recherche</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Les résultats présentés reflètent la <strong>couverture presse accessible sur internet</strong>{" "}
                  lorsqu'on effectue une recherche depuis un pays donné. Ils ne représentent pas nécessairement la
                  présence dans les médias locaux de ce pays, mais plutôt la visibilité numérique de l'entité recherchée
                  dans l'écosystème médiatique accessible depuis cette zone géographique.
                </p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Nom de marque ou entité à analyser..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg py-3"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || disambiguationLoading || !query.trim() || selectedCountries.length === 0}
                className="px-8 py-3"
              >
                {loading || disambiguationLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Analyser
              </Button>
            </div>

            {selectedEntity && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedEntity.type}</Badge>
                    <span className="font-medium">{selectedEntity.name}</span>
                    <span className="text-sm text-muted-foreground">- {selectedEntity.description}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEntity(null)
                      setShowDisambiguation(true)
                    }}
                  >
                    Changer
                  </Button>
                </div>
              </div>
            )}

            {/* Comparison Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={showComparison ? "default" : "outline"}
                onClick={() => setShowComparison(!showComparison)}
                size="sm"
              >
                Mode Comparaison
              </Button>
              {showComparison && (
                <Input
                  placeholder="Concurrent à comparer..."
                  value={comparisonQuery}
                  onChange={(e) => setComparisonQuery(e.target.value)}
                  className="max-w-xs"
                />
              )}
            </div>
          </div>
        </div>

        {showDisambiguation && entityOptions.length > 0 && (
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Précisez votre recherche
              </CardTitle>
              <CardDescription>
                Plusieurs entités correspondent à "{query}". Choisissez celle qui vous intéresse :
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {entityOptions.map((entity) => (
                  <Button
                    key={entity.id}
                    variant="outline"
                    className="justify-start h-auto p-4 text-left bg-transparent"
                    onClick={() => handleEntitySelection(entity)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Badge variant="secondary" className="mt-1">
                        {entity.type}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold">{entity.name}</div>
                        <div className="text-sm text-muted-foreground">{entity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{entity.context}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                {!showCustomInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Préciser manuellement ce que je cherche
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit3 className="w-4 h-4 text-primary" />
                      <p className="font-medium">Précisez ce que vous cherchez :</p>
                    </div>
                    <Textarea
                      placeholder="Ex: Aleria AI, entreprise d'intelligence artificielle, startup tech..."
                      value={customEntity}
                      onChange={(e) => setCustomEntity(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Soyez précis : nom de l'entreprise, secteur d'activité, localisation, etc.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleCustomEntitySubmit} disabled={!customEntity.trim()} size="sm">
                        Rechercher cette entité
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomInput(false)
                          setCustomEntity("")
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDisambiguation(false)
                    handleSearch()
                  }}
                  className="w-full"
                >
                  Continuer sans préciser (recherche générale)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Country Selection Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="w-5 h-5" />
              Sélection des pays ({selectedCountries.length}/5)
            </CardTitle>
            <CardDescription>
              Choisissez jusqu'à 5 pays pour analyser la couverture presse géographiquement
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <p className="text-sm text-muted-foreground mb-2">Pays sélectionnés :</p>
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

        {/* Results Section */}
        {data && data.kpis && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.totalArticles}</div>
                  <div className="text-sm text-muted-foreground">Articles (30j)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.uniqueOutlets}</div>
                  <div className="text-sm text-muted-foreground">Médias uniques</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.countries}</div>
                  <div className="text-sm text-muted-foreground">Pays</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.kpis.pressScore}/100</div>
                  <div className="text-sm font-medium text-blue-800">Score Présence</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {data.kpis.pressScore >= 80
                      ? "Excellent"
                      : data.kpis.pressScore >= 60
                        ? "Bon"
                        : data.kpis.pressScore >= 40
                          ? "Moyen"
                          : "Faible"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div
                    className={`text-2xl font-bold ${data.kpis.tonalityScore >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {data.kpis.tonalityScore > 0 ? "+" : ""}
                    {data.kpis.tonalityScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">📊 Analyse de votre Score Presse</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {getPersonalizedScoreExplanation() ||
                    "Lancez une analyse pour obtenir une explication détaillée de votre score presse personnalisé."}
                </p>
              </CardContent>
            </Card>

            {data.results && data.results.length > 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Comparaison par pays</h2>
                  <p className="text-muted-foreground">
                    Analyse de la couverture presse de "{selectedEntity?.name || query}" dans {data.results.length} pays
                  </p>
                </div>

                <div className="grid gap-6">
                  {data.results.map((countryResult) => {
                    const countrySentiment = getCountrySentimentAnalysis(countryResult.articles)

                    return (
                      <Card key={countryResult.countryCode} className="overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{countryResult.flag}</span>
                              <div>
                                <CardTitle className="text-lg">{countryResult.country}</CardTitle>
                                <CardDescription>
                                  {countryResult.isUncertain
                                    ? "Présence incertaine"
                                    : `${countryResult.articles.length} articles trouvés`}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          {countryResult.isUncertain ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-amber-900 mb-1">Présence incertaine</h4>
                                  <p className="text-sm text-amber-800 leading-relaxed">{countryResult.gptAnalysis}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-primary">{countryResult.articles.length}</div>
                                  <div className="text-xs text-muted-foreground">Articles</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-primary">
                                    {countryResult.kpis.uniqueOutlets}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Médias</div>
                                </div>
                                <div className="text-center border-2 border-blue-200 bg-blue-50 rounded-lg p-2">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {countryResult.kpis.pressScore}/100
                                  </div>
                                  <div className="text-xs font-medium text-blue-800">Présence</div>
                                </div>
                                <div className="text-center">
                                  <div
                                    className={`text-2xl font-bold ${
                                      countryResult.kpis.tonalityScore >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {countryResult.kpis.tonalityScore > 0 ? "+" : ""}
                                    {countryResult.kpis.tonalityScore}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Sentiment</div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Bot className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-1">🤖 Analyse IA</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">{countryResult.gptAnalysis}</p>
                                  </div>
                                </div>
                              </div>

                              {countryResult.articles.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">
                                    Articles récents – {countryResult.country}
                                  </h4>
                                  <div className="space-y-3">
                                    {countryResult.articles.slice(0, 5).map((article) => (
                                      <div
                                        key={article.id}
                                        className="flex items-start gap-3 p-3 bg-white rounded-lg border"
                                      >
                                        <div
                                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                            article.sentiment === "positive"
                                              ? "bg-green-500"
                                              : article.sentiment === "negative"
                                                ? "bg-red-500"
                                                : "bg-gray-400"
                                          }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                                            {article.title}
                                          </h5>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{article.source}</span>
                                            <span>•</span>
                                            <span>{article.date}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Shield className="w-3 h-3" />
                                              {article.credibility}%
                                            </span>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild className="p-1 h-auto">
                                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          </a>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {(!data.results || data.results.length <= 1) && (
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Analyse de Sentiment Détaillée
                    </CardTitle>
                    <CardDescription>Répartition de la tonalité des articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentimentAnalysis && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{sentimentAnalysis.positive}%</div>
                            <div className="text-sm text-green-700">Positif</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">{sentimentAnalysis.neutral}%</div>
                            <div className="text-sm text-gray-700">Neutre</div>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{sentimentAnalysis.negative}%</div>
                            <div className="text-sm text-red-700">Négatif</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sentiment global</span>
                            <span
                              className={`font-medium ${
                                sentimentAnalysis.positive > sentimentAnalysis.negative
                                  ? "text-green-600"
                                  : sentimentAnalysis.negative > sentimentAnalysis.positive
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {sentimentAnalysis.positive > sentimentAnalysis.negative
                                ? "Plutôt positif"
                                : sentimentAnalysis.negative > sentimentAnalysis.positive
                                  ? "Plutôt négatif"
                                  : "Équilibré"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-l-full"
                              style={{ width: `${sentimentAnalysis.positive}%` }}
                            ></div>
                            <div
                              className="bg-red-500 h-3 rounded-r-full"
                              style={{
                                width: `${sentimentAnalysis.negative}%`,
                                marginLeft: `${sentimentAnalysis.positive + sentimentAnalysis.neutral}%`,
                                marginTop: "-12px",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Crédibilité des Médias
                    </CardTitle>
                    <CardDescription>Analyse de la fiabilité des sources (1-10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mediaCredibility.slice(0, 8).map((media: any, index) => (
                        <div
                          key={media.source}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-lg">{getMediaLogo(media.source)}</span>
                            <div>
                              <div className="font-medium text-sm">{media.source}</div>
                              <div className="text-xs text-muted-foreground">
                                {media.articles} article{media.articles > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-bold">{Math.round(media.avgCredibility / 10)}/10</div>
                              <div className="text-xs text-muted-foreground">
                                {media.avgCredibility >= 90
                                  ? "Excellent"
                                  : media.avgCredibility >= 80
                                    ? "Très bon"
                                    : media.avgCredibility >= 70
                                      ? "Bon"
                                      : media.avgCredibility >= 60
                                        ? "Moyen"
                                        : "Faible"}
                              </div>
                            </div>
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full ${
                                  media.avgCredibility >= 90
                                    ? "bg-green-500"
                                    : media.avgCredibility >= 80
                                      ? "bg-blue-500"
                                      : media.avgCredibility >= 70
                                        ? "bg-yellow-500"
                                        : media.avgCredibility >= 60
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                }`}
                                style={{ width: `${media.avgCredibility}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(!data.results || data.results.length <= 1) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Articles récents
                    </div>
                    <Button variant="outline" size="sm">
                      <Minus className="w-4 h-4 mr-2" />
                      Filtrer
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.articles.map((article) => (
                      <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-medium">{article.source}</span>
                              <Badge variant="outline" className="text-xs">
                                {article.country}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {article.language.toUpperCase()}
                              </Badge>
                              <span className="text-xs">Crédibilité: {article.credibility}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getSentimentColor(article.sentiment)} flex items-center gap-1`}>
                              {getSentimentIcon(article.sentiment)}
                              {article.sentiment}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Section */}
            {showComparison && comparisonQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison concurrentielle</CardTitle>
                  <CardDescription>
                    Comparaison entre "{query}" et "{comparisonQuery}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      current: { label: query, color: "hsl(var(--chart-1))" },
                      competitor: { label: comparisonQuery, color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { metric: "Articles", current: 47, competitor: 32 },
                          { metric: "Médias", current: 23, competitor: 18 },
                          { metric: "Score Presse", current: 73, competitor: 65 },
                          { metric: "Tonalité", current: 12, competitor: -5 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="current" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="competitor" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analysez votre couverture presse</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Entrez le nom de votre marque ou entité et sélectionnez les pays pour découvrir votre présence médiatique,
              analyser la tonalité des articles et comparer avec vos concurrents.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-red-600">Erreur</h3>
            <p className="text-red-600 max-w-md mx-auto">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
