"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Globe, Search, TrendingUp, MapPin, Users } from "lucide-react"
import { WorldReputationModal } from "@/components/world-reputation-modal"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"

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
    try {
      const response = await fetch("/api/world-reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          countries: selectedCountries,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'analyse")

      const data = await response.json()
      setResults(data)
      setShowModal(true)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsAnalyzing(false)
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
      <Header />

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
              {t("gmi.subtitle").includes("monde")
                ? "dans le monde"
                : t("gmi.subtitle").includes("worldwide")
                  ? "worldwide"
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

        {/* Analysis Button */}
        <div className="text-center">
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
                {t("gmi.analyze_button")}
              </>
            )}
          </Button>

          {selectedCountries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
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

      {/* Results Modal */}
      {results && (
        <WorldReputationModal isOpen={showModal} onClose={() => setShowModal(false)} results={results} query={query} />
      )}
    </div>
  )
}
