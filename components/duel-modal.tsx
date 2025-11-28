"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Crosshair, Activity, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"
import { useLanguage } from "@/contexts/language-context"
import { DuelLoadingAnimation } from "@/components/duel-loading-animation"

interface DuelModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    brand1: string
    brand2: string
    message?: string
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

  const sections = text.split("\n\n").filter((s) => s.trim())

  sections.forEach((section) => {
    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l)

    if (lines.length === 0) return

    const firstLine = lines[0]

    if (firstLine.match(/^\[([A-Z\sÀ-Ÿ]+)\]$/)) {
      const title = firstLine.replace(/\[|\]/g, "")
      elements.push(
        <h3
          key={key++}
          className="text-lg font-bold text-violet-500 font-heading uppercase mt-8 mb-4 first:mt-0 tracking-wider"
        >
          {title}
        </h3>,
      )

      if (lines.length > 1) {
        const content = lines.slice(1)
        content.forEach((line) => {
          if (line.startsWith("-")) {
            elements.push(
              <div key={key++} className="flex items-start gap-3 mb-2 ml-4">
                <span className="text-violet-500 mt-1.5">•</span>
                <p className="text-gray-300 leading-relaxed flex-1">{line.substring(1).trim()}</p>
              </div>,
            )
          } else {
            elements.push(
              <p key={key++} className="text-gray-300 leading-relaxed mb-3">
                {line}
              </p>,
            )
          }
        })
      }
    } else {
      lines.forEach((line) => {
        if (line.startsWith("-")) {
          elements.push(
            <div key={key++} className="flex items-start gap-3 mb-2 ml-4">
              <span className="text-violet-500 mt-1.5">•</span>
              <p className="text-gray-300 leading-relaxed flex-1">{line.substring(1).trim()}</p>
            </div>,
          )
        } else if (line.includes(":") && line.split(":")[0].length < 40) {
          const [label, ...rest] = line.split(":")
          const content = rest.join(":").trim()
          elements.push(
            <p key={key++} className="mb-3 leading-relaxed">
              <span className="font-bold text-white font-heading">{label}:</span>
              {content && <span className="text-gray-300"> {content}</span>}
            </p>,
          )
        } else {
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
  const [expandedComparison, setExpandedComparison] = useState(false)

  const { brand1, brand2, message, language } = formData

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true)
      setResult(null)
      setCurrentStep(0)
      setExpandedComparison(false)
      analyzeDuel()
    }
  }, [isOpen])

  const analyzeDuel = async () => {
    try {
      const response = await fetch("/api/duel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand1, brand2, message, language }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur lors du duel: ${response.status} - ${errorText}`)
      }

      const apiResponse = await response.json()

      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error("Structure de réponse API invalide")
      }

      const duelResult = apiResponse.data

      if (!duelResult || !duelResult.brand1_analysis || !duelResult.brand2_analysis) {
        throw new Error("Structure de données de duel invalide")
      }

      setResult(duelResult)
      setIsAnalyzing(false)
      setCurrentStep(0)
    } catch (error) {
      console.error("[v0] Duel error details:", error)
      setIsAnalyzing(false)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    if (score >= 60) return "text-gray-300"
    return "text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
  }

  const getWinnerBadge = (brand: string, winner: string) => {
    if (brand === winner) {
      return (
        <Badge className="bg-violet-900/50 text-violet-200 border border-violet-500/50 font-heading tracking-wider">
          <Crosshair className="w-3 h-3 mr-1" />
          CIBLE DOMINANTE
        </Badge>
      )
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1400px] w-[96vw] max-h-[90vh] p-0 gap-0 flex flex-col bg-black border border-violet-900/30">
        <div className="flex items-center justify-between px-8 py-5 border-b border-violet-900/20 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 font-heading text-white">
            <Activity className="w-7 h-7 text-violet-500" strokeWidth={2.5} />
            {isAnalyzing ? t("decrypting") : t("confrontation_report")}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-violet-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAnalyzing ? (
            <DuelLoadingAnimation brand1={brand1} brand2={brand2} />
          ) : result ? (
            <div className="space-y-8">
              <div className="border border-violet-900/50 bg-gradient-to-b from-violet-950/20 to-black p-8 text-center">
                {result.winner === "Match nul" ? (
                  <h3 className="text-3xl font-bold text-white">{t("perfect_equality")}</h3>
                ) : (
                  <div>
                    <h3 className="text-xl text-violet-500 mb-2">{t("dominant_target_identified")}</h3>
                    <div className="text-5xl font-bold text-white">{result.winner}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="border border-white/10 p-6">
                  <h4 className="text-2xl font-bold text-white">{brand1}</h4>
                  {getWinnerBadge(brand1, result.winner)}
                  <div className="text-sm text-gray-400 mt-4">{result.brand1_analysis.rationale}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">{t("visibility")}</div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold w-8", getScoreColor(result.brand1_analysis.presence_score))}>
                        {result.brand1_analysis.presence_score}
                      </span>
                      <div className="flex-1 h-2 bg-gray-900"></div>
                      <span className={cn("font-bold w-8", getScoreColor(result.brand2_analysis.presence_score))}>
                        {result.brand2_analysis.presence_score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h4 className="text-2xl font-bold text-white">{brand2}</h4>
                  {getWinnerBadge(brand2, result.winner)}
                  <div className="text-sm text-gray-400 mt-4">{result.brand2_analysis.rationale}</div>
                </div>
              </div>

              {result.detailed_comparison && (
                <div className="border-t border-violet-900/20">
                  <button
                    onClick={() => setExpandedComparison(!expandedComparison)}
                    className="w-full flex items-center justify-between px-8 py-5"
                  >
                    <h3 className="text-xl font-bold text-white">{t("detailed_comparative_analysis")}</h3>
                    {expandedComparison ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {expandedComparison && (
                    <div className="px-8 pb-8">
                      <div className="bg-black/40 border border-violet-900/20 p-8">
                        {formatComparisonText(result.detailed_comparison)}
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
  )
}
