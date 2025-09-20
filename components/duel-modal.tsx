"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Swords, Trophy, Target, Crown, Zap, Shield, Flame, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DuelModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    brand1: string
    brand2: string
    message: string
    language: string
  }
}

interface DuelResult {
  brand1_analysis: {
    presence_score: number
    tone_score: number
    coherence_score: number
    global_score: number
    tone_label: string
    rationale: string
    google_summary: string
    gpt_summary: string
    structured_conclusion: string
    presence_details: string
    tone_details: string
    coherence_details: string
  }
  brand2_analysis: {
    presence_score: number
    tone_score: number
    coherence_score: number
    global_score: number
    tone_label: string
    rationale: string
    google_summary: string
    gpt_summary: string
    structured_conclusion: string
    presence_details: string
    tone_details: string
    coherence_details: string
  }
  winner: string
  detailed_comparison: string
  summary: string
  score_difference: number
}

export function DuelModal({ isOpen, onClose, formData }: DuelModalProps) {
  const [result, setResult] = useState<DuelResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  useEffect(() => {
    if (isOpen && formData) {
      setIsAnalyzing(true)
      setResult(null)
      setProgress(0)
      analyzeDuel()
    }
  }, [isOpen, formData])

  useEffect(() => {
    if (isAnalyzing) {
      const steps = [
        "Analyse de " + formData.brand1,
        "Analyse de " + formData.brand2,
        "Comparaison des résultats",
        "Détermination du vainqueur",
      ]

      let stepIndex = 0
      const interval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 60 ? Math.random() * 12 : prev < 85 ? Math.random() * 6 : Math.random() * 3
          const newProgress = Math.min(prev + increment, 92)

          if (newProgress > 25 && stepIndex === 0) {
            setCurrentStep(steps[1])
            stepIndex = 1
          } else if (newProgress > 50 && stepIndex === 1) {
            setCurrentStep(steps[2])
            stepIndex = 2
          } else if (newProgress > 75 && stepIndex === 2) {
            setCurrentStep(steps[3])
            stepIndex = 3
          }

          return newProgress
        })
      }, 1500)

      setCurrentStep(steps[0])
      return () => clearInterval(interval)
    }
  }, [isAnalyzing, formData])

  const analyzeDuel = async () => {
    try {
      console.log("[v0] Starting duel analysis with data:", formData)

      const response = await fetch("/api/duel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("[v0] Duel API response status:", response.status)
      console.log("[v0] Duel API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Duel API error response:", errorText)
        throw new Error(`Erreur lors du duel: ${response.status} - ${errorText}`)
      }

      const apiResponse = await response.json()
      console.log("[v0] Duel result received:", apiResponse)

      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        console.log("[v0] Invalid API response structure:", apiResponse)
        throw new Error("Structure de réponse API invalide")
      }

      const duelResult = apiResponse.data

      if (!duelResult || !duelResult.brand1_analysis || !duelResult.brand2_analysis) {
        console.log("[v0] Invalid duel result structure:", duelResult)
        throw new Error("Structure de données de duel invalide")
      }

      setProgress(100)
      setTimeout(() => {
        setResult(duelResult)
        setIsAnalyzing(false)
      }, 1000)
    } catch (error) {
      console.error("[v0] Duel error details:", error)
      console.log("[v0] Error message:", error.message)
      console.log("[v0] Error stack:", error.stack)
      setIsAnalyzing(false)
      alert(`Erreur lors du duel: ${error.message}`)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getWinnerBadge = (brand: string, winner: string) => {
    if (brand === winner) {
      return (
        <Badge className="bg-yellow-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Vainqueur
        </Badge>
      )
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Custom header with close button */}
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            {isAnalyzing ? "Duel en cours..." : "Résultats du Duel"}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {isAnalyzing ? (
            <div className="py-8 space-y-6 max-w-4xl mx-auto">
              {/* Combat Arena */}
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-8 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>

                {/* Fighters */}
                <div className="relative flex items-center justify-between mb-8">
                  {/* Fighter 1 */}
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
                        {formData.brand1.charAt(0).toUpperCase()}
                      </div>
                      {progress > 25 && (
                        <div className="absolute -top-2 -right-2 animate-bounce">
                          <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-white font-bold">{formData.brand1}</div>
                    <div className="flex justify-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            progress > 25 + i * 15 ? "bg-red-500" : "bg-gray-600"
                          } transition-colors duration-500`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* VS Animation */}
                  <div className="text-center">
                    <div className="relative">
                      <Swords className="w-12 h-12 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white animate-ping" />
                      </div>
                    </div>
                    <div className="text-yellow-400 font-bold text-xl mt-2">VS</div>
                    {progress > 50 && <div className="text-xs text-yellow-300 animate-pulse mt-1">⚡ COMBAT ⚡</div>}
                  </div>

                  {/* Fighter 2 */}
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
                        {formData.brand2.charAt(0).toUpperCase()}
                      </div>
                      {progress > 50 && (
                        <div className="absolute -top-2 -left-2 animate-bounce">
                          <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-white font-bold">{formData.brand2}</div>
                    <div className="flex justify-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            progress > 50 + i * 15 ? "bg-blue-500" : "bg-gray-600"
                          } transition-colors duration-500`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Battle Status */}
                <div className="text-center space-y-3">
                  <div className="text-yellow-300 font-medium text-lg">{currentStep}</div>
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Progression du Combat</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={progress} className="h-4 bg-gray-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Combat Effects */}
                {progress > 75 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                    <div
                      className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Battle Commentary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-primary">
                <div className="text-sm text-gray-600 italic">
                  {progress < 25 && "🔍 Analyse des forces de " + formData.brand1 + "..."}
                  {progress >= 25 && progress < 50 && "⚔️ " + formData.brand2 + " entre dans l'arène..."}
                  {progress >= 50 && progress < 75 && "💥 Les deux combattants s'affrontent !"}
                  {progress >= 75 && progress < 95 && "🏆 Détermination du vainqueur..."}
                  {progress >= 95 && "✨ Le verdict tombe !"}
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Winner Announcement */}
              <div className="text-center py-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                {result.winner === "Match nul" ? (
                  <>
                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">🤝 Match nul !</h3>
                    <div className="text-lg text-yellow-700">
                      Les deux entités sont à égalité avec un score de {result.brand1_analysis.global_score}/100
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">🏆 {result.winner} remporte le duel !</h3>
                    <div className="text-lg text-yellow-700">
                      Score global :{" "}
                      {result.winner === formData.brand1
                        ? result.brand1_analysis.global_score
                        : result.brand2_analysis.global_score}
                      /100
                      {result.score_difference > 0 && (
                        <span className="ml-3">(Écart de {result.score_difference} points)</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Score Comparison */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-center text-purple-800">
                    <div className="flex items-center justify-center gap-2">
                      <Swords className="w-5 h-5" />
                      Comparaison des Scores
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-center mb-6">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Présence Digitale</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-xl font-bold ${getScoreColor(result.brand1_analysis.presence_score)}`}>
                          {result.brand1_analysis.presence_score}
                        </span>
                        <span className="text-gray-400 text-sm">vs</span>
                        <span className={`text-xl font-bold ${getScoreColor(result.brand2_analysis.presence_score)}`}>
                          {result.brand2_analysis.presence_score}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Sentiment</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-xl font-bold ${getScoreColor(result.brand1_analysis.tone_score)}`}>
                          {result.brand1_analysis.tone_score}
                        </span>
                        <span className="text-gray-400 text-sm">vs</span>
                        <span className={`text-xl font-bold ${getScoreColor(result.brand2_analysis.tone_score)}`}>
                          {result.brand2_analysis.tone_score}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Cohérence</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-xl font-bold ${getScoreColor(result.brand1_analysis.coherence_score)}`}>
                          {result.brand1_analysis.coherence_score}
                        </span>
                        <span className="text-gray-400 text-sm">vs</span>
                        <span className={`text-xl font-bold ${getScoreColor(result.brand2_analysis.coherence_score)}`}>
                          {result.brand2_analysis.coherence_score}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Global Scores */}
                  <div className="flex justify-center items-center gap-8 p-6 bg-white rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700 mb-1">{formData.brand1}</div>
                      <div className={`text-3xl font-bold ${getScoreColor(result.brand1_analysis.global_score)}`}>
                        {result.brand1_analysis.global_score}
                      </div>
                      {getWinnerBadge(formData.brand1, result.winner)}
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700 mb-1">{formData.brand2}</div>
                      <div className={`text-3xl font-bold ${getScoreColor(result.brand2_analysis.global_score)}`}>
                        {result.brand2_analysis.global_score}
                      </div>
                      {getWinnerBadge(formData.brand2, result.winner)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand 1 Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analyse de {formData.brand1}</span>
                    {getWinnerBadge(formData.brand1, result.winner)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {result.brand1_analysis.rationale}
                  </div>
                  {result.brand1_analysis.google_summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Résumé de l'analyse SEO</h4>
                      <div className="text-sm text-muted-foreground leading-relaxed p-3 bg-gray-50 rounded-lg">
                        {result.brand1_analysis.google_summary}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Brand 2 Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analyse de {formData.brand2}</span>
                    {getWinnerBadge(formData.brand2, result.winner)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {result.brand2_analysis.rationale}
                  </div>
                  {result.brand2_analysis.google_summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Résumé de l'analyse SEO</h4>
                      <div className="text-sm text-muted-foreground leading-relaxed p-3 bg-gray-50 rounded-lg">
                        {result.brand2_analysis.google_summary}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Comparison */}
              {result.detailed_comparison && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-center text-blue-800">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-5 h-5" />
                        Analyse Comparative Détaillée
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-blue-700 leading-relaxed">
                      {result.detailed_comparison ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: String(result.detailed_comparison || "")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/### (.*?)$/gm, '<h4 class="font-semibold text-blue-800 mt-4 mb-2">$1</h4>')
                              .replace(/## (.*?)$/gm, '<h3 class="font-bold text-blue-900 mt-5 mb-3">$1</h3>')
                              .replace(/# (.*?)$/gm, '<h2 class="font-bold text-blue-900 text-lg mt-6 mb-3">$1</h2>')
                              .replace(/\n/g, "<br>"),
                          }}
                        />
                      ) : (
                        result.summary || "Analyse comparative non disponible"
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Promotional Section */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-center">
                  <h4 className="font-bold text-green-900 text-lg mb-2">🚀 Vous voulez améliorer votre score ?</h4>
                  <p className="text-green-800 mb-3">
                    Nous avons tous les outils pour optimiser votre présence digitale et votre cohérence de message.
                  </p>
                  <p className="text-green-900 font-semibold">📞 Contactez-nous dès maintenant !</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
