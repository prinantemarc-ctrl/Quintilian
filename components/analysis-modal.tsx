"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Edit3, Brain, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { AnalysisResultsFullscreen } from "./analysis-results-fullscreen"
import { InteractiveLoadingAnimation } from "./interactive-loading-animation"

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: {
    brand: string
    message: string
    language: string
  }
}

interface AnalysisResult {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
  rationale: string
  sources: Array<{
    title: string
    link: string
  }>
  google_summary?: string
  gpt_summary?: string
  structured_conclusion?: string
  detailed_analysis?: string
  search_volume?: number
  competition_level?: string
  trending_topics?: string[]
  geographic_presence?: string[]
  content_quality_score?: number
  social_signals?: number
  technical_seo_score?: number
  processing_time?: number
  sources_analyzed?: number
  cache_hit?: boolean
  global_score?: number
}

interface IdentifiedEntity {
  id: string
  name: string
  description: string
  type: string
  context?: string
  confidence: number
}

export function AnalysisModal({ isOpen, onClose, initialData }: AnalysisModalProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [identifiedEntities, setIdentifiedEntities] = useState<IdentifiedEntity[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [customIdentity, setCustomIdentity] = useState("")
  const [showFullscreenView, setShowFullscreenView] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setResult(null)
      setIsAnalyzing(false)
      setError(null)
      setIdentifiedEntities([])
      setSearchResults([])
      setCustomIdentity("")
      setShowFullscreenView(false)
      setAnalysisProgress(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && initialData?.brand?.trim() && !isAnalyzing && !result && identifiedEntities.length === 0) {
      console.log("[v0] Starting analysis for:", initialData.brand)
      launchAnalysis()
    }
  }, [isOpen, initialData?.brand])

  const launchAnalysis = async (selectedIdentity?: string) => {
    setIsAnalyzing(true)
    setError(null)
    setIdentifiedEntities([])
    setAnalysisProgress(10)

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => Math.min(prev + 5, 90))
    }, 500)

    try {
      console.log("[v0] Sending request to /api/analyze")
      const requestBody: any = {
        brand: initialData.brand,
        message: initialData.message || "",
        language: initialData.language || "fr",
      }

      if (selectedIdentity) {
        requestBody.selected_identity = selectedIdentity
        requestBody.search_results = searchResults
        console.log("[v0] Re-running analysis with selected identity:", selectedIdentity)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Analysis response:", data)

      if (data.success && data.data) {
        const resultData = data.data

        if (resultData.requires_identity_selection && resultData.identified_entities) {
          console.log("[v0] Disambiguation required, showing entities")
          setIdentifiedEntities(resultData.identified_entities)
          setSearchResults(resultData.search_results || [])
          setIsAnalyzing(false)
          setAnalysisProgress(100)
          return
        }

        if (resultData.presence_score !== undefined) {
          console.log("[v0] Got scores, showing results")
          setAnalysisProgress(100)
          setResult(resultData)
          setIsAnalyzing(false)

          setTimeout(() => {
            setShowFullscreenView(true)
          }, 500)
        }
      } else {
        throw new Error(data.error?.message || "Analyse échouée")
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      console.error("[v0] Analysis error:", err)
      setError(err.message || "Une erreur est survenue")
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handleIdentitySelection = async (identityId: string) => {
    const selectedEntity = identifiedEntities.find((e) => e.id === identityId)
    const selectedIdentityName = selectedEntity?.name || identityId

    console.log("[v0] User selected identity:", selectedIdentityName)
    await launchAnalysis(selectedIdentityName)
  }

  const handleClose = () => {
    setShowFullscreenView(false)
    onClose()
  }

  if (showFullscreenView && result) {
    return (
      <AnalysisResultsFullscreen
        isOpen={true}
        onClose={handleClose}
        result={result}
        brand={initialData.brand}
        analysisType="gmi"
      />
    )
  }

  return (
    <Dialog open={isOpen && !showFullscreenView} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1400px] w-[96vw] max-h-[92vh] flex flex-col bg-black border border-red-900/30 p-0">
        <div className="flex items-center justify-between px-8 py-5 border-b border-red-900/20 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold uppercase text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-red-500" />
            {identifiedEntities.length > 0 ? "CIBLES DÉTECTÉES" : error ? "ÉCHEC MISSION" : "ANALYSE EN COURS"}
          </DialogTitle>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={handleClose}>
            <span className="sr-only">Fermer</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAnalyzing && identifiedEntities.length === 0 && !error && (
            <InteractiveLoadingAnimation isLoading={isAnalyzing} progress={analysisProgress} />
          )}

          {identifiedEntities.length > 0 && !error && (
            <div className="space-y-6 max-w-4xl mx-auto py-8">
              <Alert className="bg-red-950/20 border-red-900/50">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <AlertDescription>
                  Plusieurs cibles potentielles détectées. Veuillez sélectionner la bonne identité pour affiner
                  l'analyse.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-sm text-gray-500 uppercase">Identités Identifiées</h3>
                <div className="grid gap-4">
                  {identifiedEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className="border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-500/50 transition-all p-4 cursor-pointer rounded-lg"
                      onClick={() => handleIdentitySelection(entity.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-lg mb-1">{entity.name}</p>
                            <p className="text-sm text-gray-400">{entity.description}</p>
                            {entity.context && <p className="text-xs text-gray-500 mt-1">{entity.context}</p>}
                          </div>
                          <Button size="sm" variant="outline" className="ml-4 shrink-0 bg-transparent">
                            CIBLER
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded ${entity.type === "person" ? "bg-blue-950/50 text-blue-400" : "bg-gray-800 text-gray-400"}`}
                          >
                            {entity.type === "person" ? "Personne" : entity.type}
                          </span>
                          <span className="text-gray-600">Confiance: {Math.round(entity.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-gray-500 uppercase">Préciser la Cible</p>
                </div>
                <Textarea
                  placeholder="Ex: Directeur Marketing, Spécialiste UX, entreprise d'IA à Abu Dhabi..."
                  value={customIdentity}
                  onChange={(e) => setCustomIdentity(e.target.value)}
                  className="min-h-[80px] bg-zinc-900/50 border-white/10"
                />
                <Button
                  onClick={() => handleIdentitySelection(`${initialData.brand}, ${customIdentity}`)}
                  disabled={!customIdentity.trim()}
                  size="sm"
                >
                  Analyser cette Identité
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Alert className="mb-4 bg-red-950/20 border-red-900/50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => launchAnalysis()}>Réitérer l'Analyse</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
