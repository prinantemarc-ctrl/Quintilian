"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Globe, MapPin, Users, TrendingUp } from "lucide-react"

interface GeographicData {
  country: string
  countryCode: string
  searches: number
  percentage: number
  avgScore: number
  topCities: Array<{
    city: string
    searches: number
    avgScore: number
  }>
}

interface GeographicAnalysisProps {
  data: GeographicData[]
  totalSearches: number
}

export function GeographicAnalysis({ data, totalSearches }: GeographicAnalysisProps) {
  const topCountries = data.slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Carte mondiale simulée */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Répartition géographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted rounded-lg p-8 h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Carte interactive</h3>
                <p className="text-sm text-muted-foreground">Visualisation des {totalSearches} recherches par pays</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {topCountries.slice(0, 4).map((country) => (
                  <div key={country.countryCode} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(var(--chart-${(topCountries.indexOf(country) % 5) + 1}))`,
                      }}
                    />
                    <span>
                      {country.country}: {country.searches}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top pays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top pays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCountries.map((country, index) => (
            <div key={country.countryCode} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{country.country}</span>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{country.searches}</div>
                  <div className="text-muted-foreground">{country.percentage.toFixed(1)}%</div>
                </div>
              </div>
              <Progress value={country.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Score moyen: {country.avgScore.toFixed(1)}/10</span>
                <span>
                  {country.topCities.length} ville{country.topCities.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Détails par ville */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Analyse par ville
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topCountries.slice(0, 6).map((country) => (
              <div key={country.countryCode} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{country.country}</h4>
                  <Badge variant="secondary">{country.searches} recherches</Badge>
                </div>
                <div className="space-y-2">
                  {country.topCities.slice(0, 3).map((city) => (
                    <div key={city.city} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {city.city}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">{city.searches}</div>
                        <div className="text-muted-foreground text-xs">{city.avgScore.toFixed(1)}/10</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
