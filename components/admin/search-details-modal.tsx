"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Eye, FileText, BarChart3, Clock, User } from "lucide-react"
import { toast } from "sonner"

interface SearchDetailsModalProps {
  searchId: string
  query: string
  type: string
  timestamp: Date
  children: React.ReactNode
}

interface SearchDetails {
  id: string
  query: string
  analysis_type: string
  language: string
  created_at: string
  processing_time_ms: number
  user_id?: string
  user_ip?: string
  user_agent?: string
  scores?: {
    presence_score?: number
    sentiment_score?: number
    coherence_score?: number
    overall_score?: number
  }
  results?: any
  full_response_text?: string
  error_message?: string
}

export function SearchDetailsModal({ searchId, query, type, timestamp, children }: SearchDetailsModalProps) {
  const [details, setDetails] = useState<SearchDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchDetails = async () => {
    if (details) return // Already loaded

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/search/${searchId}`)
      if (response.ok) {
        const data = await response.json()
        setDetails(data)
      } else {
        toast.error("Erreur lors du chargement des détails")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copié dans le presse-papiers")
  }

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Téléchargement démarré")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={fetchDetails}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails de l'analyse
          </DialogTitle>
          <DialogDescription>
            {query} • {type} • {timestamp.toLocaleString("fr-FR")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : details ? (
          <Tabs defaultValue="response" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="response" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Réponse
              </TabsTrigger>
              <TabsTrigger value="scores" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Scores
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Technique
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Utilisateur
              </TabsTrigger>
            </TabsList>

            <TabsContent value="response" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Réponse complète</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => details.full_response_text && copyToClipboard(details.full_response_text)}
                    disabled={!details.full_response_text}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      details.full_response_text &&
                      downloadText(
                        details.full_response_text,
                        `analyse-${details.query}-${new Date(details.created_at).toISOString().split("T")[0]}.txt`,
                      )
                    }
                    disabled={!details.full_response_text}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96 w-full border rounded-md p-4">
                {details.full_response_text ? (
                  <pre className="whitespace-pre-wrap text-sm">{details.full_response_text}</pre>
                ) : (
                  <p className="text-muted-foreground italic">Aucune réponse complète enregistrée</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <h3 className="text-lg font-semibold">Scores détaillés</h3>
              {details.scores ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {details.scores.presence_score && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-chart-1">
                        {Number(details.scores.presence_score).toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Présence</div>
                    </div>
                  )}
                  {details.scores.sentiment_score && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-chart-2">
                        {Number(details.scores.sentiment_score).toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Sentiment</div>
                    </div>
                  )}
                  {details.scores.coherence_score && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-chart-3">
                        {Number(details.scores.coherence_score).toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Cohérence</div>
                    </div>
                  )}
                  {details.scores.overall_score && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-chart-4">
                        {Number(details.scores.overall_score).toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Score global</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Aucun score disponible</p>
              )}

              {details.results && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Données brutes</h4>
                  <ScrollArea className="h-48 w-full border rounded-md p-4">
                    <pre className="text-xs">{JSON.stringify(details.results, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <h3 className="text-lg font-semibold">Informations techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-sm">{details.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{details.analysis_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Langue:</span>
                    <Badge variant="outline">{details.language}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temps de traitement:</span>
                    <span>{(details.processing_time_ms / 1000).toFixed(2)}s</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(details.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  {details.error_message && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <div className="text-sm font-semibold text-destructive">Erreur:</div>
                      <div className="text-sm text-destructive">{details.error_message}</div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <h3 className="text-lg font-semibold">Informations utilisateur</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-sm">{details.user_id || "Anonyme"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse IP:</span>
                  <span className="font-mono text-sm">{details.user_ip || "Non disponible"}</span>
                </div>
                {details.user_agent && (
                  <div>
                    <div className="text-muted-foreground mb-1">User Agent:</div>
                    <div className="text-sm bg-muted p-2 rounded font-mono break-all">{details.user_agent}</div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Erreur lors du chargement des détails</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
