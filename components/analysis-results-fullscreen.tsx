"use client"

import { useState, useEffect } from "react"
import {
  X,
  ArrowLeft,
  Target,
  Brain,
  FileText,
  LinkIcon,
  TrendingUp,
  AlertTriangle,
  Globe,
  Shield,
  Swords,
  Lightbulb,
  ChevronDown,
  ExternalLink,
  Trophy,
  Star,
  AlertCircle,
  Eye,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AuthGateModal } from "@/components/auth/auth-gate-modal"
import { useLanguage } from "@/contexts/language-context"

interface AnalysisResultsFullscreenProps {
  isOpen: boolean
  onClose: () => void
  result: any
  type?: "duel" | "gmi" | "press"
  brand?: string
  brand2?: string // Added for duel type
  analysisType?: string
  duelWinner?: string // Added for duel type
}

export function AnalysisResultsFullscreen({
  isOpen,
  onClose,
  result,
  type = "gmi",
  brand,
  brand2,
  analysisType,
  duelWinner,
}: AnalysisResultsFullscreenProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] Auth check - User:", user ? "authenticated" : "anonymous")
      console.log("[v0] Auth check - isOpen:", isOpen)

      setIsAuthenticated(!!user)

      if (!user && isOpen) {
        console.log("[v0] Showing auth gate - user not authenticated")
        setShowAuthGate(true)
      }
    }

    if (isOpen) {
      checkAuth()
    }
  }, [isOpen])

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      if (session?.user) {
        setShowAuthGate(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!isOpen || !result) return null

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Chargement...</div>
      </div>
    )
  }

  console.log("[v0] Rendering - isAuthenticated:", isAuthenticated, "showAuthGate:", showAuthGate)

  if (!isAuthenticated || showAuthGate) {
    console.log("[v0] Displaying AuthGateModal with preview data")
    return (
      <AuthGateModal
        isOpen={true}
        onAuthSuccess={() => {
          setIsAuthenticated(true)
          setShowAuthGate(false)
        }}
        onClose={onClose}
        analysisType={type === "duel" ? "duel" : "simple"}
        previewData={{
          brand: brand,
          global_score: result.global_score,
          presence_score: result.presence_score,
          tone_score: result.tone_score,
          coherence_score: result.coherence_score,
          tone_label: result.tone_label,
          rationale: result.rationale,
          gpt_summary: result.gpt_summary,
          detailed_analysis: result.detailed_analysis,
          sources_count: result.sources?.length || result.sources_analyzed,
        }}
      />
    )
  }

  const tabs = [
    { id: "overview", label: t("overview"), icon: Target },
    { id: "detailed", label: t("detailedAnalysis"), icon: Brain },
    { id: "metrics", label: t("metrics"), icon: FileText },
    { id: "sources", label: t("sources"), icon: LinkIcon },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header - red to violet */}
      <div className="border-b border-violet-900/30 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Button
              onClick={onClose}
              variant="ghost"
              className="gap-2 text-violet-500 hover:text-violet-400 hover:bg-violet-950/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">{t("back")}</span>
            </Button>
            <div className="h-8 w-px bg-violet-900/30 hidden sm:block" />
            <h1 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-white">
              {type === "duel" ? t("confrontationReport") : t("intelligenceReport")}
            </h1>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-violet-950/30"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Tabs - red to violet */}
        <div className="flex gap-1 px-4 sm:px-8 pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-3 font-heading text-xs sm:text-sm font-medium
                transition-all duration-200 border-b-2 whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "border-violet-500 text-white bg-violet-950/20"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-violet-950/10"
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-8">
          {activeTab === "overview" && <OverviewTab result={result} type={type} brand={brand} />}
          {activeTab === "detailed" && <DetailedTab result={result} type={type} />}
          {activeTab === "metrics" && <MetricsTab result={result} type={type} />}
          {activeTab === "sources" && <SourcesTab result={result} />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab - red to violet throughout
function OverviewTab({ result, type, brand }: any) {
  const { t } = useLanguage()

  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"
    const hasCoherence = result.brand1_analysis?.coherence_score != null

    return (
      <div className="space-y-8">
        {/* Winner Banner */}
        <div className="rounded-lg border border-violet-500 bg-violet-950/20 p-6 sm:p-8 text-center">
          <div className="font-heading text-sm font-bold tracking-widest text-violet-400 uppercase mb-2">
            Cible Dominante
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-bold text-white">{result.winner}</div>
          <div className="mt-4 text-base sm:text-lg text-gray-300">Écart : {result.score_difference} points</div>
        </div>

        {/* Scores Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Brand 1 */}
          <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand1Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label={t("results.digitalFootprint")} score={result.brand1_analysis.presence_score} />
              <ScoreDisplay
                label={t("results.detectedTone")}
                score={result.brand1_analysis.tone_score}
                label2={result.brand1_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label={t("results.messageCoherence")} score={result.brand1_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-violet-900/30">
                <ScoreDisplay label={t("results.globalScore")} score={result.brand1_analysis.global_score} large />
              </div>
            </div>
          </div>

          {/* Brand 2 */}
          <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand2Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label={t("results.digitalFootprint")} score={result.brand2_analysis.presence_score} />
              <ScoreDisplay
                label={t("results.detectedTone")}
                score={result.brand2_analysis.tone_score}
                label2={result.brand2_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label={t("results.messageCoherence")} score={result.brand2_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-violet-900/30">
                <ScoreDisplay label={t("results.globalScore")} score={result.brand2_analysis.global_score} large />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // GMI / Press overview
  return (
    <div className="space-y-8">
      <div
        className={`grid gap-4 sm:gap-6 ${result.coherence_score !== null && result.coherence_score !== undefined ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <ScoreCard label={t("results.digitalFootprint")} score={result.presence_score} />
        <ScoreCard label={t("results.detectedTone")} score={result.tone_score} sublabel={result.tone_label} />
        {result.coherence_score !== null && result.coherence_score !== undefined && (
          <ScoreCard label={t("results.messageCoherence")} score={result.coherence_score} />
        )}
      </div>

      {result.quick_summary && (
        <div className="rounded-lg border-2 border-violet-500/50 bg-gradient-to-br from-violet-950/40 via-violet-950/20 to-zinc-950 p-6 sm:p-8 shadow-lg shadow-violet-500/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-violet-400">
              {t("results.keySummaryTitle")}
            </h3>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white font-medium pl-0 sm:pl-14">
            "{result.quick_summary}"
          </p>
        </div>
      )}

      {result.key_takeaway && (
        <div className="rounded-lg border border-violet-900/30 bg-gradient-to-br from-violet-950/30 to-zinc-950 p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <Brain className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-violet-400">{t("results.keySummary")}</h3>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-white">{result.key_takeaway}</p>
        </div>
      )}

      {(result.strengths || result.risks) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="rounded-lg border border-green-900/30 bg-zinc-950 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-heading text-base sm:text-lg font-bold text-green-400">
                  {t("results.mainStrengths")}
                </h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-1">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {result.risks && result.risks.length > 0 && (
            <div className="rounded-lg border border-orange-900/30 bg-zinc-950 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-heading text-base sm:text-lg font-bold text-orange-400">
                  {t("results.reputationalRisks")}
                </h3>
              </div>
              <ul className="space-y-3">
                {result.risks.map((risk: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-400 mt-1">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result.structured_conclusion && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 sm:w-7 h-6 sm:h-7 text-violet-400" />
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              {t("results.executiveSummary")}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {(() => {
              const text = result.structured_conclusion
              const parts = text.split(/(?=^#{1,2}\s)/m).filter(Boolean)

              const sections = parts
                .map((part: string) => {
                  const lines = part.trim().split("\n").filter(Boolean)
                  const title = lines[0] || ""
                  const content = lines.slice(1).join(" ").trim()
                  return { title, content }
                })
                .filter((s: any) => s.content && !s.title.toLowerCase().includes("conclusion"))

              if (sections.length === 0) {
                return (
                  <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-950 p-6 sm:p-8">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                        {text.replace(/#{1,2}\s*/g, "\n\n**").replace(/\n\n\*\*([^*\n]+)/g, "\n\n$1:\n")}
                      </p>
                    </div>
                  </div>
                )
              }

              return sections.map((section: any, idx: number) => {
                let icon = null
                const titleLower = section.title?.toLowerCase() || ""
                if (
                  titleLower.includes("présence") ||
                  titleLower.includes("numérique") ||
                  titleLower.includes("empreinte") ||
                  titleLower.includes("digitale")
                ) {
                  icon = <Globe className="w-5 h-5 text-violet-400" />
                } else if (
                  titleLower.includes("tonalité") ||
                  titleLower.includes("sentiment") ||
                  titleLower.includes("polarisation")
                ) {
                  icon = <TrendingUp className="w-5 h-5 text-green-400" />
                } else if (
                  titleLower.includes("force") ||
                  titleLower.includes("risque") ||
                  titleLower.includes("stratég") ||
                  titleLower.includes("briefing")
                ) {
                  icon = <Shield className="w-5 h-5 text-orange-400" />
                } else {
                  icon = <FileText className="w-5 h-5 text-zinc-400" />
                }

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-950 p-6 sm:p-8 hover:border-violet-900/50 transition-all duration-300 shadow-lg hover:shadow-violet-500/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{icon}</div>
                      <div className="flex-1 space-y-4">
                        <h4 className="font-heading text-base sm:text-lg font-bold text-violet-400 uppercase tracking-wide">
                          {section.title}
                        </h4>
                        <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{section.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Detailed Tab
function DetailedTab({ result, type }: any) {
  const detailedText = type === "duel" ? result.detailed_comparison : result.detailed_analysis

  if (type === "duel" && detailedText) {
    return <DuelDetailedAnalysis text={detailedText} result={result} />
  }

  return <SingleDetailedAnalysis text={detailedText} result={result} />
}

// Metrics Tab - red to violet
function MetricsTab({ result, type }: any) {
  const { t } = useLanguage()

  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"

    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-violet-900/30 bg-gradient-to-r from-violet-950/20 via-black to-violet-950/20 p-4 sm:p-6">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="font-heading text-lg sm:text-xl font-bold text-white">{brand1Name}</div>
              <div
                className={`font-mono text-2xl sm:text-3xl font-bold mt-1 ${
                  result.brand1_analysis?.global_score >= result.brand2_analysis?.global_score
                    ? "text-emerald-400"
                    : "text-gray-400"
                }`}
              >
                {result.brand1_analysis?.global_score || 0}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Swords className="w-6 sm:w-8 h-6 sm:h-8 text-violet-500" />
              <span className="font-mono text-xs text-gray-500 mt-1">VS</span>
            </div>
            <div className="text-center">
              <div className="font-heading text-lg sm:text-xl font-bold text-white">{brand2Name}</div>
              <div
                className={`font-mono text-2xl sm:text-3xl font-bold mt-1 ${
                  result.brand2_analysis?.global_score >= result.brand1_analysis?.global_score
                    ? "text-emerald-400"
                    : "text-gray-400"
                }`}
              >
                {result.brand2_analysis?.global_score || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <DuelMetricsCard title="Métriques Détaillées" data={result.brand1_analysis} brandName={brand1Name} />
          <DuelMetricsCard title="Métriques Détaillées" data={result.brand2_analysis} brandName={brand2Name} />
        </div>
      </div>
    )
  }

  const metrics = result.advanced_metrics

  if (!metrics) {
    return (
      <div className="space-y-8 p-4 sm:p-8">
        {/* Basic scores section */}
        <div className="rounded-xl border border-violet-900/30 bg-gradient-to-r from-violet-950/20 via-black to-violet-950/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Core Analysis Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Score */}
            <div className="text-center">
              <Globe className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">Global Score</div>
              <div className="text-3xl font-bold text-white">{result.global_score || 0}</div>
              <div className="text-xs text-gray-500 mt-1">/ 100</div>
            </div>

            {/* Presence Score */}
            <div className="text-center">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">Visibility</div>
              <div className="text-3xl font-bold text-white">{result.presence_score || 0}</div>
              <div className="text-xs text-gray-500 mt-1">/ 100</div>
            </div>

            {/* Tone Score */}
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400 mb-1">Sentiment</div>
              <div className="text-3xl font-bold text-white">{result.tone_score || 0}</div>
              <div className="text-xs text-gray-500 mt-1">/ 100</div>
            </div>
          </div>

          {/* Tone Label */}
          {result.tone_label && (
            <div className="mt-6 text-center">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  result.tone_label === "positif"
                    ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50"
                    : result.tone_label === "négatif"
                      ? "bg-red-950/50 text-red-400 border border-red-900/50"
                      : "bg-gray-950/50 text-gray-400 border border-gray-900/50"
                }`}
              >
                Overall Sentiment: {result.tone_label.charAt(0).toUpperCase() + result.tone_label.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Rationale section */}
        {result.rationale && (
          <div className="rounded-xl border border-violet-900/30 bg-black/40 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              Analysis Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">{result.rationale}</p>
          </div>
        )}

        {/* Info message about advanced metrics */}
        <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/10 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-1">Advanced Metrics Coming Soon</h4>
              <p className="text-sm text-yellow-300/70">
                Detailed metrics (source quality, geographic diversity, risk assessment) will be available in future
                analyses.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "tier1":
        return t("metrics.tier1HighAuthority")
      case "tier2":
        return t("metrics.tier2MediumAuthority")
      case "tier3":
        return t("metrics.tier3LowAuthority")
      default:
        return tier
    }
  }

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "local":
        return t("metrics.local")
      case "national":
        return t("metrics.national")
      case "international":
        return t("metrics.international")
      default:
        return scope
    }
  }

  const getCoverageLabel = (type: string) => {
    switch (type) {
      case "in_depth":
        return t("metrics.inDepth")
      case "brief":
        return t("metrics.briefs")
      case "mention":
        return t("metrics.mentions")
      default:
        return type
    }
  }

  const getBiasLabel = (bias: string) => {
    switch (bias) {
      case "neutral":
        return t("metrics.neutral")
      case "slightly_biased":
        return t("metrics.slightlyBiased")
      case "moderately_biased":
        return t("metrics.moderatelyBiased")
      case "highly_biased":
        return t("metrics.highlyBiased")
      default:
        return bias
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "low":
        return t("metrics.low")
      case "moderate":
        return t("metrics.moderate")
      case "high":
        return t("metrics.high")
      case "critical":
        return t("metrics.critical")
      default:
        return level
    }
  }

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case "excellent":
        return t("metrics.excellent")
      case "good":
        return t("metrics.good")
      case "fair":
        return t("metrics.fair")
      case "poor":
        return t("metrics.poor")
      default:
        return status
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving":
        return t("metrics.improving")
      case "stable":
        return t("metrics.stable")
      case "declining":
        return t("metrics.declining")
      default:
        return trend
    }
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Source Quality */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.sourceQuality")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label={t("metrics.tier1")}
            value={`${metrics.source_quality.tier1_percentage}%`}
            description={t("metrics.tier1Example")}
            color="text-green-500"
          />
          <MetricCard
            label={t("metrics.tier2")}
            value={`${metrics.source_quality.tier2_percentage}%`}
            description={t("metrics.tier2Example")}
            color="text-blue-500"
          />
          <MetricCard
            label={t("metrics.tier3")}
            value={`${metrics.source_quality.tier3_percentage}%`}
            description={t("metrics.tier3Example")}
            color="text-gray-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          {t("metrics.dominance")}:{" "}
          <span className="font-semibold text-white">{getTierLabel(metrics.source_quality.dominant_tier)}</span>
        </p>
      </div>

      {/* Information Freshness */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.informationFreshness")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            label={t("metrics.recentSources")}
            value={`${metrics.information_freshness.recent_percentage}%`}
            description={t("metrics.lessThan6Months")}
            color="text-green-500"
          />
          <MetricCard
            label={t("metrics.oldSources")}
            value={`${metrics.information_freshness.old_percentage}%`}
            description={t("metrics.moreThan6Months")}
            color="text-amber-500"
          />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          {t("metrics.averageAge")}:{" "}
          <span className="font-semibold text-white">
            {metrics.information_freshness.average_age_months} {t("metrics.months")}
          </span>
        </p>
      </div>

      {/* Geographic Diversity */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.geographicDiversity")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label={t("metrics.local")}
            value={`${metrics.geographic_diversity.local_percentage}%`}
            description={t("metrics.localSources")}
            color="text-blue-500"
          />
          <MetricCard
            label={t("metrics.national")}
            value={`${metrics.geographic_diversity.national_percentage}%`}
            description={t("metrics.nationalSources")}
            color="text-purple-500"
          />
          <MetricCard
            label={t("metrics.international")}
            value={`${metrics.geographic_diversity.international_percentage}%`}
            description={t("metrics.internationalSources")}
            color="text-cyan-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          {t("metrics.dominantScope")}:{" "}
          <span className="font-semibold text-white">{getScopeLabel(metrics.geographic_diversity.dominant_scope)}</span>
        </p>
      </div>

      {/* Coverage Type */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.coverageType")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label={t("metrics.inDepth")}
            value={`${metrics.coverage_type.in_depth_percentage}%`}
            description={t("metrics.moreThan500Words")}
            color="text-green-500"
          />
          <MetricCard
            label={t("metrics.briefs")}
            value={`${metrics.coverage_type.brief_percentage}%`}
            description={t("metrics.between100And500Words")}
            color="text-blue-500"
          />
          <MetricCard
            label={t("metrics.mentions")}
            value={`${metrics.coverage_type.mention_percentage}%`}
            description={t("metrics.lessThan100Words")}
            color="text-gray-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          {t("metrics.dominantType")}:{" "}
          <span className="font-semibold text-white">{getCoverageLabel(metrics.coverage_type.dominant_type)}</span>
        </p>
      </div>

      {/* Polarization */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.polarization")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <MetricCard
            label={t("metrics.neutralSources")}
            value={`${metrics.polarization.neutral_percentage}%`}
            description={t("metrics.editorialObjectivity")}
            color="text-green-500"
          />
          <MetricCard
            label={t("metrics.orientedSources")}
            value={`${metrics.polarization.oriented_percentage}%`}
            description={t("metrics.politicalBias")}
            color="text-amber-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          {t("metrics.biasLevel")}:{" "}
          <span className="font-semibold text-white">{getBiasLabel(metrics.polarization.bias_level)}</span>
        </p>
      </div>

      {/* Risk Level */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.riskLevel")}</h3>
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-bold text-white">{metrics.risk_level.score}/100</span>
            <span
              className={`text-lg font-semibold ${
                metrics.risk_level.category === "low"
                  ? "text-green-500"
                  : metrics.risk_level.category === "moderate"
                    ? "text-yellow-500"
                    : metrics.risk_level.category === "high"
                      ? "text-orange-500"
                      : "text-red-500"
              }`}
            >
              {getRiskLabel(metrics.risk_level.category)}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {t("metrics.category")}:{" "}
            <span className="font-semibold text-white">{getRiskLabel(metrics.risk_level.category)}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {t("metrics.mainThreats")}: <span className="text-white">{metrics.risk_level.main_threats}</span>
          </p>
        </div>
      </div>

      {/* Reputation Index */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">{t("metrics.reputationIndex")}</h3>
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">{t("metrics.score")}</div>
              <span className="text-4xl font-bold text-white">{metrics.reputation_index.score}/100</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">{t("metrics.healthStatus")}</div>
              <span className="text-lg font-semibold text-white">
                {getHealthStatusLabel(metrics.reputation_index.health_status)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {t("metrics.trend")}:{" "}
            <span
              className={`font-semibold ${
                metrics.reputation_index.trend === "improving"
                  ? "text-green-500"
                  : metrics.reputation_index.trend === "declining"
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
            >
              {getTrendLabel(metrics.reputation_index.trend)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Sources Tab
function SourcesTab({ result }: any) {
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set())

  const crawledSources = result.crawled_results || result.sources || []

  console.log("[v0] SourcesTab - crawled sources:", crawledSources)
  console.log("[v0] SourcesTab - crawled sources count:", crawledSources.length)

  // Extract sources mentioned in GPT analysis
  const extractGPTSources = () => {
    const gptText = result.detailed_analysis || result.structured_conclusion || ""
    const knownSources = [
      "Forbes",
      "Bloomberg",
      "Reuters",
      "Le Monde",
      "Wikipedia",
      "LinkedIn",
      "Twitter",
      "X (Twitter)",
      "Facebook",
      "Instagram",
      "TikTok",
      "YouTube",
      "The Guardian",
      "New York Times",
      "Wall Street Journal",
      "Financial Times",
      "Le Figaro",
      "Les Echos",
      "BFM",
      "France Info",
      "Mediapart",
      "Libération",
      "La Tribune",
      "Capital",
      "Challenges",
      "L'Express",
      "Le Point",
      "BBC",
      "CNN",
      "CNBC",
      "Tech Crunch",
      "Wired",
      "The Verge",
    ]

    const foundSources: Array<{ name: string; type: string; mentions: number }> = []
    const crawledNames = crawledSources.map((s: any) => s.title?.toLowerCase() || "")

    knownSources.forEach((source) => {
      const regex = new RegExp(source, "gi")
      const matches = gptText.match(regex)
      if (matches && matches.length > 0) {
        console.log(`[v0] SourcesTab - Found mention: ${source} matches: ${matches.length}`)
        const alreadyCrawled = crawledNames.some((name: string) => name.includes(source.toLowerCase()))
        console.log(`[v0] SourcesTab - Already crawled? ${source}`, alreadyCrawled)
        if (!alreadyCrawled) {
          foundSources.push({
            name: source,
            type: "media",
            mentions: matches.length,
          })
        }
      }
    })

    // Extract entities (companies, organizations)
    const entities = [
      "Tesla",
      "SpaceX",
      "Neuralink",
      "The Boring Company",
      "OpenAI",
      "PayPal",
      "Starlink",
      "Twitter",
      "X Corp",
      "Microsoft",
      "Google",
      "Amazon",
      "Apple",
      "Meta",
      "Facebook",
      "Instagram",
      "WhatsApp",
      "Netflix",
      "Uber",
      "Airbnb",
    ]

    entities.forEach((entity) => {
      const regex = new RegExp(`\\b${entity}\\b`, "gi")
      const matches = gptText.match(regex)
      if (matches && matches.length > 0) {
        const alreadyFound = foundSources.some((s) => s.name.toLowerCase() === entity.toLowerCase())
        if (!alreadyFound) {
          foundSources.push({
            name: entity,
            type: "entity",
            mentions: matches.length,
          })
        }
      }
    })

    console.log("[v0] SourcesTab - GPT sources found:", foundSources.length)
    return foundSources.sort((a, b) => b.mentions - a.mentions)
  }

  const gptSources = extractGPTSources()

  const toggleSource = (index: number) => {
    const newExpanded = new Set(expandedSources)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSources(newExpanded)
  }

  if (crawledSources.length === 0 && gptSources.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-gray-400">Aucune source disponible pour cette analyse.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Crawled Sources */}
      {crawledSources.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            Sources Analysées ({crawledSources.length})
          </h3>
          <div className="grid gap-4">
            {crawledSources.map((source: any, index: number) => (
              <a
                key={index}
                href={source.url || source.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 sm:p-6 bg-zinc-950/50 border border-violet-900/20 rounded-xl hover:border-violet-500/40 hover:bg-zinc-950/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-lg flex items-center justify-center">
                    <span className="font-mono text-violet-500 font-bold text-sm sm:text-base">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {source.source || new URL(source.url || source.link).hostname}
                      </span>
                    </div>
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-violet-400 transition-colors line-clamp-2">
                      {source.title}
                    </h3>
                    {source.snippet && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{source.snippet}</p>}
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* GPT Mentioned Sources */}
      {gptSources.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Sources Mentionnées dans l'Analyse ({gptSources.length})
          </h3>
          <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-lg border border-violet-900/20">
            {gptSources.map((source, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-violet-950/30 border border-violet-900/30 rounded-full transition-colors text-xs sm:text-sm"
              >
                <span className="text-white font-medium">{source.name}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${source.type === "entity" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}
                >
                  {source.type === "entity" ? "ENTITÉ" : "IA"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Score Card Component - red to violet
function ScoreCard({ label, score, sublabel }: { label: string; score: number; sublabel?: string }) {
  return (
    <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
      <div className="text-sm font-heading text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl sm:text-4xl font-bold text-white font-mono">{score}</div>
      {sublabel && <div className="text-xs font-heading text-violet-400 uppercase font-bold">{sublabel}</div>}
      <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// Score Display Component - red to violet
function ScoreDisplay({
  label,
  score,
  label2,
  large,
}: { label: string; score: number; label2?: string; large?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <span className="font-heading text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-heading font-bold text-white ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
          {score}
        </span>
        {label2 && <div className="text-xs font-heading text-violet-400 uppercase font-bold">{label2}</div>}
      </div>
    </div>
  )
}

// Duel Metrics Card - red to violet
function DuelMetricsCard({ title, data, brandName }: { title: string; data: any; brandName: string }) {
  if (!data) return null

  const metrics = [
    { label: "Présence", value: data.presence_score, color: "text-violet-400" },
    { label: "Tonalité", value: data.tone_score, color: data.tone_score >= 50 ? "text-green-400" : "text-orange-400" },
  ]

  if (data.coherence_score != null) {
    metrics.push({ label: "Cohérence", value: data.coherence_score, color: "text-violet-400" })
  }

  return (
    <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
      <h4 className="font-heading text-lg font-bold text-white mb-4">{brandName}</h4>
      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{metric.label}</span>
            <span className={`font-mono font-bold ${metric.color}`}>{metric.value}</span>
          </div>
        ))}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-violet-900/30">
          <div className="flex items-center justify-between">
            <span className="font-heading text-white font-bold">Score Global</span>
            <span className="font-mono text-2xl font-bold text-violet-400">{data.global_score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Duel Detailed Analysis Component
function DuelDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["verdict"]))

  const parseComparisonText = (text: string) => {
    const sections: Array<{ id: string; title: string; content: string; icon: any }> = []

    // Parse [SECTION] format or # SECTION format
    const sectionPatterns = [
      { regex: /\[VERDICT\]([\s\S]*?)(?=\[|$)/gi, id: "verdict", title: "Verdict", icon: Trophy },
      { regex: /\[PRÉSENCE DIGITALE\]([\s\S]*?)(?=\[|$)/gi, id: "presence", title: "Présence Digitale", icon: Globe },
      {
        regex: /\[SENTIMENT PUBLIC\]([\s\S]*?)(?=\[|$)/gi,
        id: "sentiment",
        title: "Sentiment Public",
        icon: TrendingUp,
      },
      { regex: /\[COHÉRENCE\]([\s\S]*?)(?=\[|$)/gi, id: "coherence", title: "Cohérence", icon: Target },
      { regex: /\[FORCES[^\]]*\]([\s\S]*?)(?=\[|$)/gi, id: "forces1", title: "Forces", icon: TrendingUp },
      {
        regex: /\[FAIBLESSES[^\]]*\]([\s\S]*?)(?=\[|$)/gi,
        id: "faiblesses1",
        title: "Faiblesses",
        icon: AlertTriangle,
      },
      {
        regex: /\[RECOMMANDATIONS\]([\s\S]*?)(?=\[|$)/gi,
        id: "recommendations",
        title: "Recommandations",
        icon: Lightbulb,
      },
    ]

    sectionPatterns.forEach(({ regex, id, title, icon }) => {
      const match = regex.exec(text)
      if (match && match[1]) {
        sections.push({
          id,
          title,
          content: match[1].trim(),
          icon,
        })
      }
    })

    // If no sections found, try # format
    if (sections.length === 0) {
      const lines = text.split("\n")
      let currentSection: { id: string; title: string; content: string; icon: any } | null = null

      lines.forEach((line) => {
        if (line.startsWith("# ") || line.startsWith("## ")) {
          if (currentSection) {
            sections.push(currentSection)
          }
          const title = line.replace(/^#+\s*/, "").trim()
          currentSection = {
            id: title.toLowerCase().replace(/\s+/g, "-"),
            title,
            content: "",
            icon: FileText,
          }
        } else if (currentSection) {
          currentSection.content += line + "\n"
        }
      })

      if (currentSection) {
        sections.push(currentSection)
      }
    }

    return sections
  }

  const sections = parseComparisonText(text)

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSections(newExpanded)
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-6">
        <p className="text-gray-300 whitespace-pre-wrap">{text}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`rounded-lg border transition-all duration-300 ${
            expandedSections.has(section.id)
              ? "border-violet-500/50 bg-violet-950/20"
              : "border-violet-900/30 bg-zinc-950/50 hover:border-violet-900/50"
          }`}
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  expandedSections.has(section.id) ? "bg-violet-500/20 text-violet-400" : "bg-zinc-800 text-gray-400"
                }`}
              >
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{section.title}</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSections.has(section.id) ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.has(section.id) && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Single Detailed Analysis Component
function SingleDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  if (!text) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-gray-400">L'analyse détaillée n'est pas disponible.</p>
      </div>
    )
  }

  // Parse sections from the text
  const sections: Array<{ title: string; content: string; iconType: string; confidence: number }> = []
  const lines = text.split("\n")
  let currentSection: { title: string; content: string; iconType: string; confidence: number } | null = null

  // Icon mapping based on section title
  const getIconType = (title: string): string => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes("osint") || lowerTitle.includes("source") || lowerTitle.includes("crawl")) return "globe"
    if (lowerTitle.includes("ia") || lowerTitle.includes("génératif") || lowerTitle.includes("llm")) return "brain"
    if (lowerTitle.includes("sentiment") || lowerTitle.includes("tonalité")) return "trending"
    if (lowerTitle.includes("cohérence") || lowerTitle.includes("message")) return "target"
    if (lowerTitle.includes("risque") || lowerTitle.includes("menace")) return "alert"
    if (lowerTitle.includes("force") || lowerTitle.includes("opportunité")) return "star"
    return "file"
  }

  // Generate confidence based on content length and structure
  const getConfidence = (content: string): number => {
    const hasNumbers = /\d+/.test(content)
    const hasSpecificTerms = /(wikipedia|forbes|linkedin|twitter|facebook|média|source|article)/i.test(content)
    let base = 70
    if (hasNumbers) base += 10
    if (hasSpecificTerms) base += 10
    if (content.length > 500) base += 5
    return Math.min(base, 95)
  }

  lines.forEach((line) => {
    if (line.startsWith("# ") || line.startsWith("## ")) {
      if (currentSection && currentSection.content.trim()) {
        currentSection.confidence = getConfidence(currentSection.content)
        sections.push(currentSection)
      }
      const title = line.replace(/^#+\s*/, "").trim()
      currentSection = {
        title,
        content: "",
        iconType: getIconType(title),
        confidence: 75,
      }
    } else if (currentSection) {
      currentSection.content += line + "\n"
    }
  })

  if (currentSection && currentSection.content.trim()) {
    currentSection.confidence = getConfidence(currentSection.content)
    sections.push(currentSection)
  }

  // Extract key points from content
  const extractKeyPoints = (content: string): string[] => {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 30)
    return sentences.slice(0, 4).map((s) => s.trim())
  }

  // Render icon based on type
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "globe":
        return <Globe className="w-5 h-5" />
      case "brain":
        return <Brain className="w-5 h-5" />
      case "trending":
        return <TrendingUp className="w-5 h-5" />
      case "target":
        return <Target className="w-5 h-5" />
      case "alert":
        return <AlertTriangle className="w-5 h-5" />
      case "star":
        return <Star className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const toggleSection = (idx: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedSections(newExpanded)
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-6">
        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Pills */}
      <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-lg border border-violet-900/20">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => {
              const element = document.getElementById(`section-${idx}`)
              element?.scrollIntoView({ behavior: "smooth" })
            }}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-violet-950/30 border border-violet-900/30 rounded-full transition-colors text-xs sm:text-sm"
          >
            <span className="text-violet-400">{renderIcon(section.iconType)}</span>
            <span className="text-gray-300 truncate max-w-[120px] sm:max-w-none">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const isExpanded = expandedSections.has(idx)
          const keyPoints = extractKeyPoints(section.content)

          return (
            <div
              key={idx}
              id={`section-${idx}`}
              className={`rounded-xl border transition-all duration-300 ${
                isExpanded
                  ? "border-violet-500/50 bg-gradient-to-br from-violet-950/20 to-zinc-950"
                  : "border-violet-900/30 bg-zinc-950/50 hover:border-violet-900/50"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => toggleSection(idx)}
                className="w-full p-4 sm:p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center ${
                      isExpanded ? "bg-violet-500/20 text-violet-400" : "bg-zinc-950/50 text-violet-400"
                    }`}
                  >
                    {renderIcon(section.iconType)}
                  </div>
                  <div>
                    <h3
                      className={`font-heading text-base sm:text-lg font-bold ${isExpanded ? "text-violet-400" : "text-white"} uppercase tracking-wide`}
                    >
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">{keyPoints.length} points clés identifiés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      section.confidence >= 80 ? "bg-green-950/50 text-green-400" : "bg-yellow-950/50 text-yellow-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${section.confidence >= 80 ? "bg-green-400" : "bg-yellow-400"}`}
                    />
                    {section.confidence}% confiance
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                  {/* Key Points Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {keyPoints.map((point, pointIdx) => (
                      <div key={pointIdx} className="p-3 sm:p-4 bg-zinc-900/50 border border-violet-900/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-violet-400 mt-1 text-lg">•</span>
                          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{point}.</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full Analysis */}
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Voir l'analyse complète</span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                      <div className="prose prose-invert prose-sm max-w-none">
                        {section.content
                          .split("\n")
                          .filter(Boolean)
                          .map((paragraph, pIdx) => (
                            <p key={pIdx} className="text-sm text-gray-300 leading-relaxed mb-3">
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper Components

function MetricCard({
  label,
  value,
  description,
  color,
}: {
  label: string
  value: string
  description: string
  color: string
}) {
  return (
    <div className="bg-zinc-950 border border-violet-900/30 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}
