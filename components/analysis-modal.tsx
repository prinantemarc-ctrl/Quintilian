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
  const [isDisambiguating, setIsDisambiguating] = useState(false)
  const [progressBeforeDisambiguation, setProgressBeforeDisambiguation] = useState(0)

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
      setIsDisambiguating(false)
      setProgressBeforeDisambiguation(0)
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

    if (selectedIdentity && progressBeforeDisambiguation > 0) {
      // Resume from where we left off (75%) instead of restarting
      setAnalysisProgress(progressBeforeDisambiguation)
      setIsDisambiguating(false)
    } else {
      setAnalysisProgress(10)
    }

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev < 40) return Math.min(prev + 8, 95) // Fast start: 0-40% in ~2.5s
        if (prev < 70) return Math.min(prev + 5, 95) // Medium: 40-70% in ~3s
        if (prev < 85) return Math.min(prev + 3, 95) // Slower: 70-85% in ~2.5s
        if (prev < 95) return Math.min(prev + 2, 95) // Smooth: 85-95% in ~2.5s
        return prev // Stay at 95% until complete
      })
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
          setProgressBeforeDisambiguation(75)
          setAnalysisProgress(75)
          setIsDisambiguating(true)
          setIdentifiedEntities(resultData.identified_entities)
          setSearchResults(resultData.search_results || [])
          setIsAnalyzing(false)
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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1400px] w-full max-h-[92vh] flex flex-col bg-black border border-red-900/30 p-0">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-red-900/20 flex-shrink-0">
          <DialogTitle className="font-heading text-lg sm:text-xl lg:text-2xl font-bold uppercase text-white flex items-center gap-2 sm:gap-3">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-500" />
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

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {(isAnalyzing || isDisambiguating) && identifiedEntities.length === 0 && !error && (
            <InteractiveLoadingAnimation isLoading={isAnalyzing || isDisambiguating} progress={analysisProgress} />
          )}

          {identifiedEntities.length > 0 && !error && (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto py-4 sm:py-8">
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 font-mono mb-2">
                  <span>PHASE 3 - DÉSAMBIGUÏSATION</span>
                  <span>{progressBeforeDisambiguation}%</span>
                </div>
                <div className="h-2 bg-zinc-900 border border-red-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                    style={{ width: `${progressBeforeDisambiguation}%` }}
                  />
                </div>
              </div>

              <Alert className="bg-red-950/20 border-red-900/50">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <AlertDescription>
                  Plusieurs cibles potentielles détectées. Veuillez sélectionner la bonne identité pour affiner
                  l'analyse.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-heading text-xs sm:text-sm text-gray-500 uppercase">Identités Identifiées</h3>
                <div className="grid gap-3 sm:gap-4">
                  {identifiedEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className="border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-500/50 transition-all p-3 sm:p-4 cursor-pointer rounded-lg"
                      onClick={() => handleIdentitySelection(entity.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-base sm:text-lg mb-1">{entity.name}</p>
                            <p className="text-xs sm:text-sm text-gray-400">{entity.description}</p>
                            {entity.context && (
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{entity.context}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-0 sm:ml-4 shrink-0 bg-transparent text-xs sm:text-sm w-full sm:w-auto"
                          >
                            CIBLER
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
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

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500" />
                  <p className="font-heading text-xs sm:text-sm text-gray-500 uppercase">Préciser la Cible</p>
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
