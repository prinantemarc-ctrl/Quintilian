"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Target, X, Crosshair, Activity, ChevronUp, ChevronDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"
import { useLanguage } from "@/contexts/language-context"
import { AnalysisResultsFullscreen } from "./analysis-results-fullscreen"

interface DuelModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    brand1: string
    brand2: string
    message?: string // Keep as string but make it optional in validation
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

function formatComparisonText(text: string) {
  const elements: JSX.Element[] = []
  let key = 0

  // Split by double line breaks to get sections
  const sections = text.split("\n\n").filter((s) => s.trim())

  sections.forEach((section) => {
    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l)

    if (lines.length === 0) return

    const firstLine = lines[0]

    // Check if it's a section header [TITLE]
    if (firstLine.match(/^\[([A-Z\sÀ-Ÿ]+)\]$/)) {
      const title = firstLine.replace(/\[|\]/g, "")
      elements.push(
        <h3
          key={key++}
          className="text-lg font-bold text-red-500 font-mono uppercase mt-8 mb-4 first:mt-0 tracking-wider"
        >
          {title}
        </h3>,
      )

      // Render content after the header
      if (lines.length > 1) {
        const content = lines.slice(1)
        content.forEach((line) => {
          if (line.startsWith("-")) {
            // Bullet point
            elements.push(
              <div key={key++} className="flex items-start gap-3 mb-2 ml-4">
                <span className="text-red-500 mt-1.5">•</span>
                <p className="text-gray-300 leading-relaxed flex-1">{line.substring(1).trim()}</p>
              </div>,
            )
          } else {
            // Regular paragraph
            elements.push(
              <p key={key++} className="text-gray-300 leading-relaxed mb-3">
                {line}
              </p>,
            )
          }
        })
      }
    } else {
      // No header, just content
      lines.forEach((line) => {
        if (line.startsWith("-")) {
          // Bullet point
          elements.push(
            <div key={key++} className="flex items-start gap-3 mb-2 ml-4">
              <span className="text-red-500 mt-1.5">•</span>
              <p className="text-gray-300 leading-relaxed flex-1">{line.substring(1).trim()}</p>
            </div>,
          )
        } else if (line.includes(":") && line.split(":")[0].length < 40) {
          // Label: value format
          const [label, ...rest] = line.split(":")
          const content = rest.join(":").trim()
          elements.push(
            <p key={key++} className="mb-3 leading-relaxed">
              <span className="font-bold text-white font-mono">{label}:</span>
              {content && <span className="text-gray-300"> {content}</span>}
            </p>,
          )
        } else {
          // Regular paragraph
          elements.push(
            <p key={key++} className="text-gray-300 leading-relaxed mb-3">
              {line}
            </p>,
          )
        }
      })
    }
  })

  return <div className="space-y-1">{elements}</div>
}

export function DuelModal({ isOpen, onClose, formData }: DuelModalProps) {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<DuelResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFullscreenView, setShowFullscreenView] = useState(false)
  const [expandedComparison, setExpandedComparison] = useState(false)

  const { brand1, brand2, message, language } = formData

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true)
      setResult(null)
      setCurrentStep(0)
      setShowFullscreenView(false)
      setExpandedComparison(false)
      analyzeDuel()
    }
  }, [isOpen])

  const analyzeDuel = async () => {
    try {
      console.log("[v0] Starting duel analysis with data:", { brand1, brand2, message, language })

      const response = await fetch("/api/duel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand1, brand2, message, language }),
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

      setResult(duelResult)
      setIsAnalyzing(false)
      setCurrentStep(0)
      setShowFullscreenView(true)
    } catch (error) {
      console.error("[v0] Duel error details:", error)
      console.log("[v0] Error message:", error.message)
      console.log("[v0] Error stack:", error.stack)
      setIsAnalyzing(false)
      setError(error.message)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    if (score >= 60) return "text-gray-300"
    return "text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
  }

  const getWinnerBadge = (brand: string, winner: string) => {
    if (brand === winner) {
      return (
        <Badge className="bg-red-900/50 text-red-200 border border-red-500/50 font-mono tracking-wider">
          <Crosshair className="w-3 h-3 mr-1" />
          CIBLE DOMINANTE
        </Badge>
      )
    }
    return null
  }

  return (
    <>
      <Dialog open={isOpen && !showFullscreenView} onOpenChange={onClose}>
        <DialogContent className="max-w-[1400px] w-[96vw] max-h-[90vh] p-0 gap-0 flex flex-col bg-black border border-red-900/30 shadow-[0_0_80px_rgba(153,27,27,0.15)]">
          {/* Header - Single close button integrated */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-red-900/20 bg-gradient-to-r from-red-950/5 via-transparent to-red-950/5 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 font-['Space_Grotesk'] tracking-tight text-white">
              <Activity className="w-7 h-7 text-red-500" strokeWidth={2.5} />
              {isAnalyzing ? t("decrypting") : t("confrontation_report")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-950/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-[url('/grid-pattern.svg')] bg-fixed">
            {isAnalyzing ? (
              <div className="py-4 space-y-4">
                {/* Animated Combat Arena */}
                <div className="relative bg-black border-2 border-red-900/50 rounded-lg p-4 overflow-hidden shadow-2xl shadow-red-500/20">
                  {/* Animated grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

                  {/* Scanning beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>

                  {/* Radar pulse rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px]">
                    <div className="absolute inset-0 border border-red-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-8 border border-red-500/30 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>
                    <div className="absolute inset-16 border border-red-500/40 rounded-full animate-[ping_2s_ease-in-out_infinite_1s]"></div>
                  </div>

                  <div className="flex items-center justify-between gap-8 relative z-10">
                    {/* Target 1 - Left */}
                    <div className="flex-1 text-center space-y-4 animate-[slideInLeft_0.5s_ease-out]">
                      <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        {/* Rotating border rings */}
                        <div className="absolute inset-0 border-2 border-red-500/40 rounded-full animate-[spin_8s_linear_infinite]">
                          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="absolute inset-2 border-2 border-red-400/30 rounded-full animate-[spin_6s_linear_infinite_reverse]">
                          <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 translate-y-1/2 bg-red-400 rounded-full"></div>
                        </div>
                        <div className="absolute inset-4 border border-red-300/20 rounded-full animate-[spin_4s_linear_infinite]"></div>

                        {/* Center initial */}
                        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-red-950 to-black border border-red-500/50 flex items-center justify-center shadow-lg shadow-red-500/20">
                          <div className="text-4xl font-bold text-red-400 font-mono animate-pulse">
                            {brand1 ? brand1.charAt(0).toUpperCase() : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-widest uppercase">
                          {brand1 || "Target 1"}
                        </div>
                        <div className="font-['JetBrains_Mono'] text-xs text-red-400 uppercase tracking-widest animate-pulse">
                          Scanning...
                        </div>
                      </div>
                    </div>

                    {/* Central Combat Hub */}
                    <div className="w-48 text-center space-y-4 animate-[zoomIn_0.3s_ease-out]">
                      <div className="relative w-24 h-24 mx-auto">
                        {/* Pulsing outer ring */}
                        <div className="absolute inset-0 border-2 border-red-500/60 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
                        <div className="absolute inset-8 border border-red-500/40 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>

                        {/* Inner rotating radar */}
                        <div className="absolute inset-4 border border-red-500/30 rounded-full">
                          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-transparent animate-[spin_2s_linear_infinite]"></div>
                        </div>

                        {/* Center icon */}
                        <div className="absolute inset-8 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                          <Zap className="w-8 h-8 text-red-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-['Space_Grotesk'] text-lg font-bold text-red-500 uppercase tracking-widest animate-pulse">
                          Confrontation
                        </div>
                        <div className="font-['JetBrains_Mono'] text-sm text-gray-400">Analyse en cours...</div>

                        {/* Progress indicator */}
                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-[shimmer_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>

                    {/* Target 2 - Right */}
                    <div className="flex-1 text-center space-y-4 animate-[slideInRight_0.5s_ease-out]">
                      <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        {/* Rotating border rings */}
                        <div className="absolute inset-0 border-2 border-red-500/40 rounded-full animate-[spin_8s_linear_infinite_reverse]">
                          <div className="absolute top-0 right-1/2 w-2 h-2 translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="absolute inset-2 border-2 border-red-400/30 rounded-full animate-[spin_6s_linear_infinite]">
                          <div className="absolute bottom-0 right-1/2 w-2 h-2 translate-x-1/2 translate-y-1/2 bg-red-400 rounded-full"></div>
                        </div>
                        <div className="absolute inset-4 border border-red-300/20 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>

                        {/* Center initial */}
                        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-red-950 to-black border border-red-500/50 flex items-center justify-center shadow-lg shadow-red-500/20">
                          <div className="text-4xl font-bold text-red-400 font-mono animate-pulse">
                            {brand2 ? brand2.charAt(0).toUpperCase() : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-widest uppercase">
                          {brand2 || "Target 2"}
                        </div>
                        <div className="font-['JetBrains_Mono'] text-xs text-red-400 uppercase tracking-widest animate-pulse">
                          Scanning...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* Winner Announcement - Spy Style */}
                <div className="relative overflow-hidden border border-red-900/50 bg-gradient-to-b from-red-950/20 to-black p-8 text-center">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-red-600"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-600"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-600"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-red-600"></div>

                  {result.winner === "Match nul" ? (
                    <>
                      <h3 className="text-3xl font-bold text-white font-mono mb-2 uppercase tracking-widest">
                        {t("perfect_equality")}
                      </h3>
                      <div className="text-gray-400 font-mono">
                        {t("power_index", { score: result.brand1_analysis.global_score })}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl text-red-500 font-mono mb-2 uppercase tracking-[0.2em]">
                        {t("dominant_target_identified")}
                      </h3>
                      <div className="text-5xl font-bold text-white font-sans mb-4 uppercase tracking-tighter">
                        {result.winner}
                      </div>
                      <div className="inline-flex items-center gap-4 text-gray-400 bg-black/50 px-6 py-2 border border-white/10 rounded-full">
                        <span className="font-mono text-sm">{t("power_delta")}</span>
                        <span className="text-red-500 font-bold font-mono">+{result.score_difference} PTS</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Brand 1 Card */}
                  <div className="lg:col-span-1 border border-white/10 bg-zinc-950/50 p-6 flex flex-col gap-6">
                    <div className="text-center border-b border-white/5 pb-4">
                      <h4 className="text-2xl font-bold text-white uppercase font-mono">{brand1}</h4>
                      {getWinnerBadge(brand1, result.winner)}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="text-sm text-gray-400 font-mono text-justify leading-relaxed">
                        {result.brand1_analysis.rationale}
                      </div>
                      {result.brand1_analysis.google_summary && (
                        <div className="bg-black/50 p-3 border-l-2 border-red-900/50 text-xs text-gray-500">
                          {result.brand1_analysis.google_summary}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comparison Stats - Center */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-black border border-white/10 p-6 space-y-6">
                      <h5 className="text-red-500 text-xs font-mono uppercase text-center mb-4">
                        {t("comparative_metrics")}
                      </h5>

                      {/* Presence */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 font-mono mb-2">
                          <span>{t("visibility")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono font-bold w-8 text-right",
                              getScoreColor(result.brand1_analysis.presence_score),
                            )}
                          >
                            {result.brand1_analysis.presence_score}
                          </span>
                          <div className="flex-1 h-2 bg-gray-900 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-white/20 w-1/2 border-r border-black">
                              <div
                                className="h-full bg-white transition-all"
                                style={{ width: `${result.brand1_analysis.presence_score}%` }}
                              ></div>
                            </div>
                            <div className="absolute top-0 right-0 h-full bg-white/20 w-1/2">
                              <div
                                className="h-full bg-red-600 transition-all ml-auto"
                                style={{ width: `${result.brand2_analysis.presence_score}%` }}
                              ></div>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "font-mono font-bold w-8",
                              getScoreColor(result.brand2_analysis.presence_score),
                            )}
                          >
                            {result.brand2_analysis.presence_score}
                          </span>
                        </div>
                      </div>

                      {/* Tone */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 font-mono mb-2">
                          <span>{t("sentiment")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono font-bold w-8 text-right",
                              getScoreColor(result.brand1_analysis.tone_score),
                            )}
                          >
                            {result.brand1_analysis.tone_score}
                          </span>
                          <div className="flex-1 h-2 bg-gray-900 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-white/20 w-1/2 border-r border-black">
                              <div
                                className="h-full bg-white transition-all"
                                style={{ width: `${result.brand1_analysis.tone_score}%` }}
                              ></div>
                            </div>
                            <div className="absolute top-0 right-0 h-full bg-white/20 w-1/2">
                              <div
                                className="h-full bg-red-600 transition-all ml-auto"
                                style={{ width: `${result.brand2_analysis.tone_score}%` }}
                              ></div>
                            </div>
                          </div>
                          <span
                            className={cn("font-mono font-bold w-8", getScoreColor(result.brand2_analysis.tone_score))}
                          >
                            {result.brand2_analysis.tone_score}
                          </span>
                        </div>
                      </div>

                      {/* Coherence */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 font-mono mb-2">
                          <span>{t("coherence")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono font-bold w-8 text-right",
                              getScoreColor(result.brand1_analysis.coherence_score),
                            )}
                          >
                            {result.brand1_analysis.coherence_score}
                          </span>
                          <div className="flex-1 h-2 bg-gray-900 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-white/20 w-1/2 border-r border-black">
                              <div
                                className="h-full bg-white transition-all"
                                style={{ width: `${result.brand1_analysis.coherence_score}%` }}
                              ></div>
                            </div>
                            <div className="absolute top-0 right-0 h-full bg-white/20 w-1/2">
                              <div
                                className="h-full bg-red-600 transition-all ml-auto"
                                style={{ width: `${result.brand2_analysis.coherence_score}%` }}
                              ></div>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "font-mono font-bold w-8",
                              getScoreColor(result.brand2_analysis.coherence_score),
                            )}
                          >
                            {result.brand2_analysis.coherence_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brand 2 Card */}
                  <div className="lg:col-span-1 border border-white/10 bg-zinc-950/50 p-6 flex flex-col gap-6">
                    <div className="text-center border-b border-white/5 pb-4">
                      <h4 className="text-2xl font-bold text-white uppercase font-mono">{brand2}</h4>
                      {getWinnerBadge(brand2, result.winner)}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="text-sm text-gray-400 font-mono text-justify leading-relaxed">
                        {result.brand2_analysis.rationale}
                      </div>
                      {result.brand2_analysis.google_summary && (
                        <div className="bg-black/50 p-3 border-l-2 border-red-900/50 text-xs text-gray-500">
                          {result.brand2_analysis.google_summary}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Comparison */}
                {result.detailed_comparison && !isAnalyzing && (
                  <div className="border-t border-red-900/20 bg-zinc-950/30">
                    <button
                      onClick={() => setExpandedComparison(!expandedComparison)}
                      className="w-full flex items-center justify-between px-8 py-5 hover:bg-red-950/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-red-500" />
                        <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] uppercase tracking-wide">
                          {t("detailed_comparative_analysis")}
                        </h3>
                      </div>
                      {expandedComparison ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      )}
                    </button>

                    {expandedComparison && (
                      <div className="px-8 pb-8 pt-4">
                        <div className="bg-black/40 border border-red-900/20 rounded-lg p-8">
                          <div className="prose prose-invert prose-lg max-w-none">
                            {formatComparisonText(result.detailed_comparison)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AnalysisResultsFullscreen
        isOpen={showFullscreenView}
        onClose={() => {
          setShowFullscreenView(false)
          onClose()
        }}
        result={result}
        type="duel"
      />
    </>
  )
}
