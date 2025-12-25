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
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "CD", name: "Congo", flag: "🇨🇩" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
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
              Search to analyze
            </CardTitle>
            <CardDescription>
              Enter the name, brand, or subject you want to analyze across different countries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="query">Search term</Label>
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
              Country Selection ({selectedCountries.length}/5)
            </CardTitle>
            <CardDescription>Choose up to 5 countries to compare reputation geographically</CardDescription>
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
                <p className="text-sm text-muted-foreground mb-2">Selected countries:</p>
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
                Analysis in progress...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Analyze in {selectedCountries.length} countries
              </>
            )}
          </Button>

          {selectedCountries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Estimated cost: {selectedCountries.length * 3} Google searches
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
