"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Download, RefreshCw } from "lucide-react"
import type { DateRange } from "react-day-picker"

interface FilterState {
  dateRange?: DateRange
  searchType: string[]
  language: string[]
  scoreRange: [number, number]
  processingTimeRange: [number, number]
  hasErrors: boolean | null
  ipAddress: string
  userAgent: string
  minResults: number
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  onExport: (format: "csv" | "json") => void
  onRefresh: () => void
  totalResults: number
  filteredResults: number
}

export function AdvancedFilters({
  onFiltersChange,
  onExport,
  onRefresh,
  totalResults,
  filteredResults,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchType: [],
    language: [],
    scoreRange: [0, 10],
    processingTimeRange: [0, 30],
    hasErrors: null,
    ipAddress: "",
    userAgent: "",
    minResults: 0,
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared: FilterState = {
      searchType: [],
      language: [],
      scoreRange: [0, 10],
      processingTimeRange: [0, 30],
      hasErrors: null,
      ipAddress: "",
      userAgent: "",
      minResults: 0,
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const activeFiltersCount = [
    filters.dateRange,
    filters.searchType.length > 0,
    filters.language.length > 0,
    filters.scoreRange[0] > 0 || filters.scoreRange[1] < 10,
    filters.processingTimeRange[0] > 0 || filters.processingTimeRange[1] < 30,
    filters.hasErrors !== null,
    filters.ipAddress,
    filters.userAgent,
    filters.minResults > 0,
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres avancés
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("json")}>
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Réduire" : "Développer"}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredResults} résultat{filteredResults > 1 ? "s" : ""} sur {totalResults}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtres de base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Période</Label>
            <DatePickerWithRange date={filters.dateRange} onDateChange={(dateRange) => updateFilters({ dateRange })} />
          </div>

          <div className="space-y-2">
            <Label>Type de recherche</Label>
            <div className="flex gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analyze"
                  checked={filters.searchType.includes("analyze")}
                  onCheckedChange={(checked) => {
                    const types = checked
                      ? [...filters.searchType, "analyze"]
                      : filters.searchType.filter((t) => t !== "analyze")
                    updateFilters({ searchType: types })
                  }}
                />
                <Label htmlFor="analyze">Analyse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="duel"
                  checked={filters.searchType.includes("duel")}
                  onCheckedChange={(checked) => {
                    const types = checked
                      ? [...filters.searchType, "duel"]
                      : filters.searchType.filter((t) => t !== "duel")
                    updateFilters({ searchType: types })
                  }}
                />
                <Label htmlFor="duel">Duel</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Langue</Label>
            <Select
              value={filters.language[0] || "all"}
              onValueChange={(value) => updateFilters({ language: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les langues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les langues</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres avancés */}
        {isExpanded && (
          <div className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Plage de scores ({filters.scoreRange[0]} - {filters.scoreRange[1]})
                  </Label>
                  <Slider
                    value={filters.scoreRange}
                    onValueChange={(value) => updateFilters({ scoreRange: value as [number, number] })}
                    max={10}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Temps de traitement ({filters.processingTimeRange[0]}s - {filters.processingTimeRange[1]}s)
                  </Label>
                  <Slider
                    value={filters.processingTimeRange}
                    onValueChange={(value) => updateFilters({ processingTimeRange: value as [number, number] })}
                    max={30}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Résultats minimum</Label>
                  <Input
                    type="number"
                    value={filters.minResults}
                    onChange={(e) => updateFilters({ minResults: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={filters.hasErrors === null ? "all" : filters.hasErrors.toString()}
                    onValueChange={(value) =>
                      updateFilters({
                        hasErrors: value === "all" ? null : value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="false">Succès uniquement</SelectItem>
                      <SelectItem value="true">Erreurs uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Adresse IP</Label>
                  <Input
                    value={filters.ipAddress}
                    onChange={(e) => updateFilters({ ipAddress: e.target.value })}
                    placeholder="192.168.1.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>User Agent (contient)</Label>
                  <Input
                    value={filters.userAgent}
                    onChange={(e) => updateFilters({ userAgent: e.target.value })}
                    placeholder="Chrome, Firefox, Safari..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
