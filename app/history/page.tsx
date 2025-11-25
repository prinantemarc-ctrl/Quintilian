"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  History,
  Search,
  Trash2,
  Download,
  Eye,
  Heart,
  Target,
  Calendar,
  Filter,
  BarChart3,
  Swords,
  Globe,
  Clock,
} from "lucide-react"
import { useAnalysisHistory, type AnalysisHistoryItem } from "@/lib/history"
import { AnalysisModal } from "@/components/analysis-modal"

export default function HistoryPage() {
  const { history, isLoading, deleteAnalysis, clearHistory, stats } = useAnalysisHistory()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || item.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewAnalysis = (item: AnalysisHistoryItem) => {
    setSelectedAnalysis(item)
    setShowAnalysisModal(true)
  }

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mak-ia-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "simple":
        return <Search className="w-4 h-4" />
      case "duel":
        return <Swords className="w-4 h-4" />
      case "world":
        return <Globe className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "simple":
        return "Analyse Simple"
      case "duel":
        return "Comparaison"
      case "world":
        return "Géographique"
      default:
        return type
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Chargement de l'historique...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
              <History className="w-4 h-4" />
              Historique des analyses
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Vos analyses précédentes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Retrouvez et consultez toutes vos analyses de réputation. Vos données sont stockées localement sur votre
              appareil.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total analyses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.last24h}</div>
                    <div className="text-sm text-muted-foreground">Dernières 24h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.last7days}</div>
                    <div className="text-sm text-muted-foreground">7 derniers jours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.byType.simple || 0}</div>
                    <div className="text-sm text-muted-foreground">Analyses simples</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {history.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune analyse dans l'historique</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par faire une analyse pour voir vos résultats ici.
                </p>
                <Button asChild>
                  <a href="/analyze">Faire une analyse</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters and Actions */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Rechercher par nom ou message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Type d'analyse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="simple">Analyse Simple</SelectItem>
                    <SelectItem value="duel">Comparaison</SelectItem>
                    <SelectItem value="world">Géographique</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportHistory} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer tout l'historique ?")) {
                        clearHistory()
                      }
                    }}
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getTypeIcon(item.type)}
                              {getTypeLabel(item.type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</span>
                          </div>

                          <h3 className="text-lg font-semibold mb-1 truncate">{item.brand}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.message}</p>

                          {/* Scores */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Eye className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium">Présence</span>
                              </div>
                              <div className={`text-xl font-bold ${getScoreColor(item.results.presence_score)}`}>
                                {item.results.presence_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Heart className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium">Sentiment</span>
                              </div>
                              <div className={`text-xl font-bold ${getScoreColor(item.results.tone_score)}`}>
                                {item.results.tone_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium">Cohérence</span>
                              </div>
                              <div className={`text-xl font-bold ${getScoreColor(item.results.coherence_score)}`}>
                                {item.results.coherence_score}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleViewAnalysis(item)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Supprimer cette analyse ?")) {
                                deleteAnalysis(item.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredHistory.length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
                    <p className="text-muted-foreground">Aucune analyse ne correspond à vos critères de recherche.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false)
            setSelectedAnalysis(null)
          }}
          formData={{
            brand: selectedAnalysis.brand,
            message: selectedAnalysis.message,
            language: selectedAnalysis.language,
          }}
        />
      )}
    </div>
  )
}
