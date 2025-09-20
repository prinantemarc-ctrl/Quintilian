"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoModal } from "@/components/info-modal"
import { Eye, Heart, Target, ExternalLink, AlertCircle, User, Edit3, BarChart3, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analysisHistory } from "@/lib/history"
import { EnhancedScoreDisplay } from "@/components/enhanced-score-display"
import { InteractiveLoadingAnimation } from "@/components/interactive-loading-animation"
import { ShareButtons } from "@/components/share-buttons"

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
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
  detailed_analysis?: string // Adding detailed analysis field
}

interface IdentitySelectionResponse {
  requires_identity_selection: boolean
  identified_entities: string[]
  search_results: Array<{
    title?: string
    link?: string
    snippet?: string
  }>
  message: string
  presence_score?: number
  tone_score?: number
  coherence_score?: number
  tone_label?: string
  rationale?: string
  google_summary?: string
  gpt_summary?: string
  structured_conclusion?: string
  detailed_analysis?: string // Adding detailed analysis field
}

interface LoadingStep {
  id: string
  label: string
  icon: React.ReactNode
  completed: boolean
  active: boolean
}

export function AnalysisModal({ isOpen, onClose, formData }: AnalysisModalProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [identitySelection, setIdentitySelection] = useState<IdentitySelectionResponse | null>(null)
  const [selectedIdentity, setSelectedIdentity] = useState<string>("")
  const [showCustomIdentity, setShowCustomIdentity] = useState(false)
  const [customIdentity, setCustomIdentity] = useState("")

  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    {
      id: "search",
      label: "Recherche Google en cours...",
      icon: (
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">G</span>
        </div>
      ),
      completed: false,
      active: true,
    },
    {
      id: "analysis",
      label: "Analyse GPT en cours...",
      icon: (
        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
      ),
      completed: false,
      active: false,
    },
    {
      id: "scoring",
      label: "Calcul des scores...",
      icon: <BarChart3 className="w-5 h-5 text-accent" />,
      completed: false,
      active: false,
    },
  ])

  useEffect(() => {
    if (isOpen && formData) {
      setIsAnalyzing(true)
      setResult(null)
      setError(null)
      setIdentitySelection(null)
      setSelectedIdentity("")
      setShowCustomIdentity(false)
      setCustomIdentity("")
      setLoadingProgress(0)
      setLoadingSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          completed: false,
          active: index === 0,
        })),
      )

      analyzeContent()
    }
  }, [isOpen, formData])

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const increment = prev < 60 ? Math.random() * 8 : prev < 85 ? Math.random() * 4 : Math.random() * 2
          const newProgress = Math.min(prev + increment, 92)

          // Update steps based on progress
          setLoadingSteps((prevSteps) =>
            prevSteps.map((step, index) => {
              if (newProgress > 25 && step.id === "search" && !step.completed) {
                return { ...step, completed: true, active: false }
              }
              if (newProgress > 25 && newProgress <= 65 && step.id === "analysis") {
                return { ...step, active: true }
              }
              if (newProgress > 65 && step.id === "analysis" && !step.completed) {
                return { ...step, completed: true, active: false }
              }
              if (newProgress > 65 && step.id === "scoring") {
                return { ...step, active: true }
              }
              return step
            }),
          )

          return newProgress
        })
      }, 1200) // Augmenter l'intervalle de 800ms à 1200ms pour ralentir

      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  const analyzeContent = async (identity?: string) => {
    if (!formData) {
      setError("Données de formulaire manquantes")
      setIsAnalyzing(false)
      return
    }

    try {
      const requestBody = identity
        ? {
            brand: formData.brand,
            message: formData.message,
            language: formData.language,
            selected_identity: identity,
            search_results: identitySelection?.search_results || [],
          }
        : {
            brand: formData.brand,
            message: formData.message,
            language: formData.language,
          }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'analyse"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage

          if (response.status === 429 || errorData.error === "RATE_LIMIT_EXCEEDED") {
            errorMessage =
              errorData.message ||
              "L'API Google a atteint sa limite de requêtes. Veuillez réessayer dans quelques minutes."
          }
        } catch (jsonError) {
          // If response is not JSON (like "Internal Server Error"), use status text
          errorMessage = response.statusText || `Erreur ${response.status}`
        }
        throw new Error(errorMessage)
      }

      let analysisResult
      try {
        analysisResult = await response.json()
      } catch (jsonError) {
        console.error("[v0] Failed to parse JSON response:", jsonError)
        throw new Error("Réponse invalide du serveur. Veuillez réessayer.")
      }

      console.log("[v0] Analysis result received:", analysisResult)
      const resultData = analysisResult.data || analysisResult
      console.log("[v0] Presence score:", resultData.presence_score)
      console.log("[v0] Tone score:", resultData.tone_score)
      console.log("[v0] Coherence score:", resultData.coherence_score)

      if (resultData.requires_identity_selection) {
        setIdentitySelection(resultData)
        setIsAnalyzing(false)
        return
      }

      setLoadingProgress(100)
      setLoadingSteps((prev) => prev.map((step) => ({ ...step, completed: true, active: false })))

      // Small delay to show completion
      setTimeout(() => {
        setResult(resultData)

        if (resultData && formData) {
          analysisHistory.addAnalysis({
            brand: formData.brand,
            message: formData.message,
            language: formData.language,
            type: "simple",
            results: {
              presence_score: resultData.presence_score,
              tone_score: resultData.tone_score,
              coherence_score: resultData.coherence_score,
              tone_label: resultData.tone_label,
              rationale: resultData.rationale,
              google_summary: resultData.google_summary,
              gpt_summary: resultData.gpt_summary,
              structured_conclusion: resultData.structured_conclusion,
              detailed_analysis: resultData.detailed_analysis,
              sources: resultData.sources,
            },
            metadata: {
              fromCache: resultData._cache_stats ? true : false,
            },
          })
        }
      }, 500)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 500)
    }
  }

  const handleIdentitySelection = (identity: string) => {
    setSelectedIdentity(identity)
    setIsAnalyzing(true)
    setIdentitySelection(null)
    analyzeContent(identity)
  }

  const handleCustomIdentitySubmit = () => {
    if (customIdentity.trim()) {
      const customDescription = `${formData.brand} - ${customIdentity.trim()}`
      handleIdentitySelection(customDescription)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent"
    if (score >= 60) return "text-yellow-600"
    return "text-destructive"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-accent"
    if (score >= 60) return "bg-yellow-500"
    return "bg-destructive"
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      fr: "Français",
      en: "Anglais",
      es: "Español",
      de: "Allemand",
      it: "Italien",
    }
    return labels[lang] || lang
  }

  if (!formData) {
    return null
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-center">
              {isAnalyzing
                ? "Analyse en cours..."
                : identitySelection
                  ? "Sélection d'identité"
                  : error
                    ? "Erreur d'analyse"
                    : "Vos résultats"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {isAnalyzing ? (
              <InteractiveLoadingAnimation
                isLoading={isAnalyzing}
                progress={loadingProgress}
                currentStep={loadingSteps.find((s) => s.active)?.id}
                onComplete={() => setIsAnalyzing(false)}
              />
            ) : identitySelection ? (
              <div className="space-y-6">
                {/* Show scores if available */}

                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>{identitySelection.message}</AlertDescription>
                </Alert>

                {/* Show detailed scores if available */}

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Identités trouvées :</h3>
                  {identitySelection.identified_entities.map((identity, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{identity}</p>
                          </div>
                          <Button onClick={() => handleIdentitySelection(identity)} size="sm">
                            Sélectionner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="w-4 h-4 text-primary" />
                    <p className="font-medium">Précisez l'identité recherchée :</p>
                  </div>
                  <Textarea
                    placeholder="Ex: Directeur Marketing chez Apple, basé à Paris, 35 ans..."
                    value={customIdentity}
                    onChange={(e) => setCustomIdentity(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajoutez toute information utile : fonction, entreprise, localité, âge, domaine d'expertise...
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleCustomIdentitySubmit} disabled={!customIdentity.trim()} size="sm">
                      Analyser cette identité
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCustomIdentity(false)
                        setCustomIdentity("")
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="outline" onClick={onClose}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => analyzeContent()} className="mt-4">
                  Réessayer l'analyse
                </Button>
              </div>
            ) : result ? (
              <>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-primary">{formData.brand}</h3>
                      <p className="text-muted-foreground">{formData.message}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Langue: {getLanguageLabel(formData.language)}</span>
                        <span>•</span>
                        <span>Analysé le {new Date().toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round((result.presence_score + result.tone_score + result.coherence_score) / 3)}
                      </div>
                      <div className="text-xs text-muted-foreground">Score global</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Scores détaillés</h3>
                  <EnhancedScoreDisplay
                    presence_score={result.presence_score}
                    tone_score={result.tone_score}
                    coherence_score={result.coherence_score}
                    tone_label={result.tone_label}
                    animated={true}
                    showTrends={false}
                  />
                </div>

                {(result.google_summary ||
                  result.gpt_summary ||
                  result.structured_conclusion ||
                  result.detailed_analysis ||
                  result.rationale) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analyse Complète</h3>

                    <Tabs defaultValue="summaries" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 h-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-1">
                        <TabsTrigger
                          value="summaries"
                          className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
                        >
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">G</span>
                          </div>
                          Résumés
                        </TabsTrigger>
                        <TabsTrigger
                          value="detailed"
                          className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
                        >
                          <FileText className="w-5 h-5" />
                          Analyse Détaillée
                        </TabsTrigger>
                        <TabsTrigger
                          value="conclusion"
                          className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
                        >
                          <BarChart3 className="w-5 h-5" />
                          Conclusion
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="summaries" className="space-y-4">
                        {/* Search Summaries */}
                        {(result.google_summary || result.gpt_summary) && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {result.google_summary && (
                              <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader className="pb-3">
                                  <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">G</span>
                                    </div>
                                    Résumé Google
                                  </CardTitle>
                                  <p className="text-xs text-blue-600">Basé sur les résultats de recherche Google</p>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {result.google_summary}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {result.gpt_summary && (
                              <Card className="border-primary/20 bg-primary/5">
                                <CardHeader className="pb-3">
                                  <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">AI</span>
                                    </div>
                                    Résumé GPT
                                  </CardTitle>
                                  <p className="text-xs text-primary/70">Analyse IA avancée et contextuelle</p>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {result.gpt_summary}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}

                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <h4 className="font-bold text-blue-900 mb-2">Votre score ne vous satisfait pas ?</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.
                            </p>
                            <p className="text-sm font-semibold text-blue-900">📞 Contactez-nous dès maintenant !</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="detailed" className="space-y-4">
                        {result.detailed_analysis ? (
                          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-accent">
                                <FileText className="w-5 h-5" />
                                Analyse Détaillée des Données
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                                <div
                                  className="markdown-content leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: (typeof result.detailed_analysis === "string"
                                      ? result.detailed_analysis
                                      : String(result.detailed_analysis || "")
                                    )
                                      .replace(
                                        /\*\*(.*?)\*\*/g,
                                        "<strong class='text-foreground font-semibold'>$1</strong>",
                                      )
                                      .replace(
                                        /^# (.*$)/gm,
                                        '<h1 class="text-xl font-bold text-primary mb-4 mt-6">$1</h1>',
                                      )
                                      .replace(
                                        /^## (.*$)/gm,
                                        '<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h2>',
                                      )
                                      .replace(
                                        /^### (.*$)/gm,
                                        '<h3 class="text-base font-medium text-foreground mt-4 mb-2">$1</h3>',
                                      )
                                      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
                                      .replace(/^---$/gm, '<hr class="my-6 border-border">')
                                      .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
                                      .replace(
                                        /^(?!<[h|l|p])(.*$)/gm,
                                        '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>',
                                      )
                                      .replace(/<p class="mb-4 text-muted-foreground leading-relaxed"><\/p>/g, ""),
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ) : result.rationale ? (
                          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-accent">
                                <FileText className="w-5 h-5" />
                                Analyse Détaillée
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {result.rationale}
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="border-dashed">
                            <CardContent className="p-6 text-center">
                              <div className="text-muted-foreground">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Analyse détaillée en cours de traitement</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <h4 className="font-bold text-blue-900 mb-2">Votre score ne vous satisfait pas ?</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.
                            </p>
                            <p className="text-sm font-semibold text-blue-900">📞 Contactez-nous dès maintenant !</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="conclusion" className="space-y-4">
                        {/* Structured Conclusion */}
                        {result.structured_conclusion && (
                          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                            <CardHeader>
                              <CardTitle className="text-primary">📊 Conclusion Détaillée</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                                <div
                                  className="markdown-content leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: (typeof result.structured_conclusion === "string"
                                      ? result.structured_conclusion
                                      : String(result.structured_conclusion || "")
                                    )
                                      .replace(
                                        /\*\*(.*?)\*\*/g,
                                        "<strong class='text-foreground font-semibold'>$1</strong>",
                                      )
                                      .replace(
                                        /^# (.*$)/gm,
                                        '<h1 class="text-xl font-bold text-primary mb-4 mt-6">$1</h1>',
                                      )
                                      .replace(
                                        /^## (.*$)/gm,
                                        '<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h2>',
                                      )
                                      .replace(
                                        /^### (.*$)/gm,
                                        '<h3 class="text-base font-medium text-foreground mt-4 mb-2">$1</h3>',
                                      )
                                      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
                                      .replace(/^---$/gm, '<hr class="my-6 border-border">')
                                      .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
                                      .replace(
                                        /^(?!<[h|l|p])(.*$)/gm,
                                        '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>',
                                      )
                                      .replace(/<p class="mb-4 text-muted-foreground leading-relaxed"><\/p>/g, ""),
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <h4 className="font-bold text-blue-900 mb-2">Votre score ne vous satisfait pas ?</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.
                            </p>
                            <p className="text-sm font-semibold text-blue-900">📞 Contactez-nous dès maintenant !</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Sources Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Sources analysées</h3>
                    <span className="text-sm text-muted-foreground">Échantillon des sources analysées</span>
                  </div>
                  {result.sources && result.sources.length > 0 ? (
                    <div className="grid gap-3">
                      {result.sources.map((source, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <a
                                  href={source.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium line-clamp-2 block"
                                >
                                  {source.title}
                                </a>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="truncate">{new URL(source.link).hostname}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <div className="text-muted-foreground">
                          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Sources analysées en arrière-plan</p>
                          <p className="text-xs mt-1">Les données sont traitées via nos algorithmes propriétaires</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recommandations</h3>
                  <div className="grid gap-3">
                    {result.presence_score < 70 && (
                      <Alert>
                        <Eye className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Améliorer la présence :</strong> Créez plus de contenu de qualité et optimisez votre
                          référencement pour augmenter votre visibilité.
                        </AlertDescription>
                      </Alert>
                    )}
                    {result.tone_score < 70 && (
                      <Alert>
                        <Heart className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Travailler l'image :</strong> Le sentiment associé à votre marque pourrait être
                          amélioré par une communication plus positive.
                        </AlertDescription>
                      </Alert>
                    )}
                    {result.coherence_score < 70 && (
                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Aligner le message :</strong> Votre message ne correspond pas entièrement à votre
                          présence digitale actuelle.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-4 pt-4 border-t">
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowInfo(true)}
                      className="text-primary border-primary hover:bg-primary/10"
                    >
                      Méthodologie de calcul
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/methodology" target="_blank" rel="noopener noreferrer">
                        Guide complet
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/history">Voir l'historique</a>
                    </Button>
                    {result && formData && (
                      <ShareButtons
                        analysis={{
                          id: `temp_${Date.now()}`,
                          brand: formData.brand,
                          message: formData.message,
                          language: formData.language,
                          type: "simple",
                          timestamp: Date.now(),
                          results: {
                            presence_score: result.presence_score,
                            tone_score: result.tone_score,
                            coherence_score: result.coherence_score,
                            tone_label: result.tone_label,
                            rationale: result.rationale,
                            google_summary: result.google_summary,
                            gpt_summary: result.gpt_summary,
                            structured_conclusion: result.structured_conclusion,
                            detailed_analysis: result.detailed_analysis,
                            sources: result.sources,
                          },
                        }}
                      />
                    )}
                    <Button onClick={onClose}>Nouvelle analyse</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Analyse complète • Powered by GPT-4 & Google Search</p>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
