"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WorldReputationModal } from "@/components/world-reputation-modal"
import { Globe, MapPin, TrendingUp, Loader2 } from "lucide-react"

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

export function WorldAnalysisForm() {
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

  const isFormValid = query.trim() && selectedCountries.length > 0

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Search Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Recherche à analyser
            </CardTitle>
            <CardDescription>
              Entrez le nom, la marque ou le sujet que vous souhaitez analyser dans différents pays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="query">Terme de recherche</Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Apple, Tesla, Jean Dupont..."
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Country Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Sélection des pays ({selectedCountries.length}/5)
            </CardTitle>
            <CardDescription>Choisissez jusqu'à 5 pays pour comparer la réputation géographiquement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        {country?.name}
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
            disabled={!isFormValid || isAnalyzing}
            className="w-full h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Analyser dans {selectedCountries.length} pays
              </>
            )}
          </Button>

          {selectedCountries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Coût estimé : {selectedCountries.length * 3} recherches Google
            </p>
          )}
        </div>
      </div>

      {results && (
        <WorldReputationModal isOpen={showModal} onClose={() => setShowModal(false)} results={results} query={query} />
      )}
    </>
  )
}
