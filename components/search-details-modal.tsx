"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Copy, Download, Eye, Calendar, Globe, Zap } from "lucide-react"
import { toast } from "sonner"

interface SearchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  searchId: string
  query: string
  competitorQuery?: string
  analysisType: string
  createdAt: string
  scores?: {
    presence_score?: number
    sentiment_score?: number
    coherence_score?: number
  }
}

export function SearchDetailsModal({
  isOpen,
  onClose,
  searchId,
  query,
  competitorQuery,
  analysisType,
  createdAt,
  scores,
}: SearchDetailsModalProps) {
  const [fullText, setFullText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadFullText = async () => {
    if (hasLoaded) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/${searchId}/full-text`)
      if (response.ok) {
        const data = await response.json()
        setFullText(data.full_response_text)
        setHasLoaded(true)
      } else {
        toast.error("Impossible de charger le texte complet")
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (fullText) {
      navigator.clipboard.writeText(fullText)
      toast.success("Texte copié dans le presse-papiers")
    }
  }

  const downloadAsText = () => {
    if (fullText) {
      const blob = new Blob([fullText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analyse-${query.replace(/\s+/g, "-")}-${new Date(createdAt).toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Fichier téléchargé")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "analyze":
        return "Analyse simple"
      case "duel":
        return "Duel comparatif"
      default:
        return type
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Détails de l'analyse
          </DialogTitle>
          <DialogDescription>Consultation complète de votre analyse</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{query}</span>
              </div>
              {competitorQuery && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="ml-6">vs {competitorQuery}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getAnalysisTypeLabel(analysisType)}</Badge>
                <span className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formatDate(createdAt)}
                </span>
              </div>
            </div>

            {scores && (
              <div className="grid grid-cols-3 gap-2">
                {scores.presence_score !== undefined && (
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(scores.presence_score)}`}>
                      {scores.presence_score}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Présence</div>
                  </div>
                )}
                {scores.sentiment_score !== undefined && (
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(scores.sentiment_score)}`}>
                      {scores.sentiment_score}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Sentiment</div>
                  </div>
                )}
                {scores.coherence_score !== undefined && (
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(scores.coherence_score)}`}>
                      {scores.coherence_score}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Cohérence</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Texte complet de l'analyse</h3>
            <div className="flex gap-2">
              {!hasLoaded && (
                <Button onClick={loadFullText} disabled={isLoading} size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? "Chargement..." : "Charger le texte"}
                </Button>
              )}
              {fullText && (
                <>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                  <Button onClick={downloadAsText} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Contenu */}
          <ScrollArea className="flex-1 max-h-[60vh] border rounded-lg p-4 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {fullText ? (
              <div className="space-y-2">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono break-words">{fullText}</pre>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cliquez sur "Charger le texte" pour voir l'analyse complète</p>
                </div>
              )
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
