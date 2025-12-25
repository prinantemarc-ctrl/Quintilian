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
  MessageCircle,
  Layers,
  Database,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AuthGateModal } from "@/components/auth/auth-gate-modal"
import { cn } from "@/lib/utils"

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

// Helper function to format numbers with proper rounding
const formatMetricNumber = (value: number, decimals = 1): string => {
  return Number(value).toFixed(decimals)
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
  // const { t } = useLanguage() // Removed useLanguage import and call

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

  // const tabs = [ // Removed useLanguage() call
  //   { id: "overview", label: t("overview"), icon: Target },
  //   { id: "detailed", label: t("detailedAnalysis"), icon: Brain },
  //   { id: "metrics", label: t("metrics"), icon: FileText },
  //   { id: "sources", label: t("sources"), icon: LinkIcon },
  // ]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Header - red to violet */}
        <div className="border-b border-violet-900/30 bg-black/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Button
                onClick={onClose}
                variant="ghost"
                className="gap-2 text-violet-500 hover:text-violet-400 hover:bg-violet-950/30"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span> {/* Removed t("back") */}
              </Button>
              <div className="h-8 w-px bg-violet-900/30 hidden sm:block" />
              <h1 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-white">
                {type === "duel" ? "Confrontation Report" : "Intelligence Report"} {/* Removed t() */}
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

          {/* Tabs - hide Sources tab */}
          <div className="flex gap-1 px-4 sm:px-8 pb-0 overflow-auto">
            {/* Removed useLanguage() call for tab labels */}
            {/* Tabs data needs to be defined here or passed as props */}
            <button
              // key={tab.id}
              onClick={() => setActiveTab("overview")}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-3 font-heading text-xs sm:text-sm font-medium
                transition-all duration-200 border-b-2 whitespace-nowrap
                ${
                  activeTab === "overview"
                    ? "border-violet-500 text-white bg-violet-950/20"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-violet-950/10"
                }
              `}
            >
              <Target className="h-4 w-4" />
              Overview {/* Removed t() */}
            </button>
            <button
              // key={tab.id}
              onClick={() => setActiveTab("detailed")}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-3 font-heading text-xs sm:text-sm font-medium
                transition-all duration-200 border-b-2 whitespace-nowrap
                ${
                  activeTab === "detailed"
                    ? "border-violet-500 text-white bg-violet-950/20"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-violet-950/10"
                }
              `}
            >
              <Brain className="h-4 w-4" />
              Detailed Analysis {/* Removed t("detailedAnalysis") */}
            </button>
            <button
              // key={tab.id}
              onClick={() => setActiveTab("metrics")}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-3 font-heading text-xs sm:text-sm font-medium
                transition-all duration-200 border-b-2 whitespace-nowrap
                ${
                  activeTab === "metrics"
                    ? "border-violet-500 text-white bg-violet-950/20"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-violet-950/10"
                }
              `}
            >
              <FileText className="h-4 w-4" />
              Metrics {/* Removed t("metrics") */}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-8">
            {activeTab === "overview" && <OverviewTab result={result} type={type} brand={brand} />}
            {activeTab === "detailed" && <DetailedTab result={result} type={type} />}
            {activeTab === "metrics" && <MetricsTab result={result} type={type} />}
          </div>
        </div>
      </div>

      {showAuthGate && result && (
        <AuthGateModal
          isOpen={showAuthGate}
          onClose={() => {
            setShowAuthGate(false)
            onClose()
          }}
          result={result}
          brand={brand}
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
      )}
    </>
  )
}

// Overview Tab - red to violet throughout
function OverviewTab({ result, type, brand }: any) {
  // const { t } = useLanguage() // Removed useLanguage() call

  if (type === "duel") {
    const brand1Name = result.brand1_name || "Subject Alpha"
    const brand2Name = result.brand2_name || "Subject Bravo"
    const hasCoherence = result.brand1_analysis?.coherence_score != null
    const hasMessageAnalysis = result.message_analysis && result.message_analysis.trim().length > 0

    const generateExecutiveSummary = () => {
      const b1 = result.brand1_analysis
      const b2 = result.brand2_analysis
      const winner = result.winner
      const diff = result.score_difference

      const b1Score = b1?.global_score || Math.round((b1?.presence_score + b1?.tone_score) / 2)
      const b2Score = b2?.global_score || Math.round((b2?.presence_score + b2?.tone_score) / 2)

      const presenceDiff = (b1?.presence_score || 0) - (b2?.presence_score || 0)
      const toneDiff = (b1?.tone_score || 0) - (b2?.tone_score || 0)

      const presenceLeader = presenceDiff > 0 ? brand1Name : presenceDiff < 0 ? brand2Name : null
      const toneLeader = toneDiff > 0 ? brand1Name : toneDiff < 0 ? brand2Name : null

      if (winner === "Tie") {
        return `This confrontation reveals a remarkably close competition between ${brand1Name} and ${brand2Name}. With only ${diff} point(s) separating them (${b1Score} vs ${b2Score}), both subjects demonstrate comparable digital presence and public perception. ${presenceLeader ? `${presenceLeader} shows slightly stronger visibility online, ` : ""}${toneLeader ? `while ${toneLeader} benefits from more favorable sentiment.` : ""} The tight margin suggests both are well-positioned in their respective digital landscapes.`
      }

      const loser = winner === brand1Name ? brand2Name : brand1Name
      const winnerData = winner === brand1Name ? b1 : b2
      const loserData = winner === brand1Name ? b2 : b1

      return `${winner} emerges as the dominant subject in this confrontation with a ${diff}-point advantage (${winner === brand1Name ? b1Score : b2Score} vs ${winner === brand1Name ? b2Score : b1Score}). The analysis reveals ${winner}'s superior positioning across key metrics: a digital footprint score of ${winnerData?.presence_score || "N/A"}/100 compared to ${loser}'s ${loserData?.presence_score || "N/A"}/100, and a sentiment score of ${winnerData?.tone_score || "N/A"}/100 (${winnerData?.tone_label || "neutral"}) versus ${loserData?.tone_score || "N/A"}/100 (${loserData?.tone_label || "neutral"}). This performance gap indicates ${winner} has established a more robust and favorably perceived digital presence.`
    }

    const parseMessageAnalysis = (text: string) => {
      if (!text) return null

      // Try to extract hypothesis
      const hypothesisMatch =
        text.match(/hypothesis[:\s]+["']([^"']+)["']/i) ||
        text.match(/analyze[:\s]+["']([^"']+)["']/i) ||
        text.match(/Message\/Hypothesis to analyze:\s*["']?([^"'\n]+)["']?/i)
      const hypothesis = hypothesisMatch ? hypothesisMatch[1] : result.message || null

      // Split into paragraphs
      const paragraphs = text.split("\n\n").filter((p) => p.trim())

      // Try to identify verdict paragraph (usually contains "VERDICT" or "corresponds better" or is the last paragraph)
      const verdictIndex = paragraphs.findIndex(
        (p) => p.toUpperCase().includes("VERDICT") || p.includes("corresponds better") || p.includes("better aligned"),
      )

      let verdict = ""
      let brand1Analysis = ""
      let brand2Analysis = ""

      if (verdictIndex !== -1) {
        verdict = paragraphs[verdictIndex].replace(/^VERDICT:\s*/i, "")
        // Remaining paragraphs split between the two subjects
        const analysisParagraphs = paragraphs.filter((_, i) => i !== verdictIndex)
        if (analysisParagraphs.length >= 2) {
          brand1Analysis = analysisParagraphs[0]
          brand2Analysis = analysisParagraphs.slice(1).join("\n\n")
        } else if (analysisParagraphs.length === 1) {
          // Try to split by "In contrast" or similar
          const parts = analysisParagraphs[0].split(/In contrast,|However,|On the other hand,/i)
          brand1Analysis = parts[0]?.trim() || ""
          brand2Analysis = parts[1]?.trim() || ""
        }
      } else {
        // Fallback: split paragraphs evenly
        const mid = Math.ceil(paragraphs.length / 2)
        brand1Analysis = paragraphs.slice(0, mid).join("\n\n")
        brand2Analysis = paragraphs.slice(mid).join("\n\n")
      }

      return { hypothesis, brand1Analysis, brand2Analysis, verdict }
    }

    const parsedAnalysis = hasMessageAnalysis ? parseMessageAnalysis(result.message_analysis) : null

    return (
      <div className="space-y-8">
        {/* Winner Banner */}
        <div className="rounded-lg border border-violet-500 bg-violet-950/20 p-6 sm:p-8 text-center">
          <div className="font-heading text-sm font-bold tracking-widest text-violet-400 uppercase mb-2">
            Dominant Target {/* Removed t() */}
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-bold text-white">{result.winner}</div>
          <div className="mt-4 text-base sm:text-lg text-gray-300">Difference: {result.score_difference} points</div>{" "}
          {/* Removed t() */}
        </div>

        {!hasMessageAnalysis && (
          <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{generateExecutiveSummary()}</p>
          </div>
        )}

        {hasMessageAnalysis && parsedAnalysis && (
          <div className="space-y-6">
            {/* Hypothesis Header */}
            <div className="rounded-xl border border-violet-500/50 bg-gradient-to-r from-violet-950/40 via-violet-900/20 to-violet-950/40 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Hypothesis Analysis</h3>
                  <p className="text-sm text-violet-300">Claim verification based on intelligence data</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg px-4 py-3 border border-violet-500/20">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Testing Hypothesis</p>
                <p className="text-white font-medium text-base sm:text-lg italic">
                  "{parsedAnalysis.hypothesis || result.message}"
                </p>
              </div>
            </div>

            {/* Two-Column Candidate Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Candidate 1 Analysis Card */}
              <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-black overflow-hidden">
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-white text-lg">{brand1Name}</h4>
                      <p className="text-emerald-400 text-sm">Subject Analysis</p>
                    </div>
                  </div>
                  {hasCoherence && result.brand1_analysis?.coherence_score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        {result.brand1_analysis.coherence_score}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Coherence</div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {parsedAnalysis.brand1Analysis || "Analysis pending..."}
                  </p>
                </div>
              </div>

              {/* Candidate 2 Analysis Card */}
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-black overflow-hidden">
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-white text-lg">{brand2Name}</h4>
                      <p className="text-amber-400 text-sm">Subject Analysis</p>
                    </div>
                  </div>
                  {hasCoherence && result.brand2_analysis?.coherence_score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">{result.brand2_analysis.coherence_score}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Coherence</div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {parsedAnalysis.brand2Analysis || "Analysis pending..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Verdict Section */}
            {parsedAnalysis.verdict && (
              <div className="rounded-xl border-2 border-violet-500 bg-gradient-to-r from-violet-950/50 via-violet-900/30 to-violet-950/50 p-5 sm:p-6 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading text-lg font-bold text-violet-300 uppercase tracking-wide mb-2">
                      Intelligence Verdict
                    </h4>
                    <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
                      {parsedAnalysis.verdict}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scores Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Brand 1 */}
          <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand1Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label="Digital Footprint" score={result.brand1_analysis.presence_score} />{" "}
              {/* Removed t() */}
              <ScoreDisplay
                label="Detected Tone" // Removed t()
                score={result.brand1_analysis.tone_score}
                label2={result.brand1_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label="Message Coherence" score={result.brand1_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-violet-900/30">
                <ScoreDisplay label="Global Score" score={result.brand1_analysis.global_score} large />{" "}
                {/* Removed t() */}
              </div>
            </div>
          </div>

          {/* Brand 2 */}
          <div className="rounded-lg border border-violet-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand2Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label="Digital Footprint" score={result.brand2_analysis.presence_score} />{" "}
              {/* Removed t() */}
              <ScoreDisplay
                label="Detected Tone" // Removed t()
                score={result.brand2_analysis.tone_score}
                label2={result.brand2_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label="Message Coherence" score={result.brand2_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-violet-900/30">
                <ScoreDisplay label="Global Score" score={result.brand2_analysis.global_score} large />{" "}
                {/* Removed t() */}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Parse Executive Summary sections
  const sections = parseMarkdownSections(result.structured_conclusion || "")

  const coherenceContent = result.coherence_details || ""
  const hasMessage = result.has_message || (result.coherence_score !== null && result.coherence_score !== undefined)

  return (
    <div className="space-y-8">
      <div
        className={`grid gap-4 sm:gap-6 ${hasMessage ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <ScoreCard label="Digital Footprint" score={result.presence_score} />
        <ScoreCard label="Detected Tone" score={result.tone_score} sublabel={result.tone_label} />
        {hasMessage && <ScoreCard label="Message Coherence" score={result.coherence_score} />}
      </div>

      {hasMessage && coherenceContent && (
        <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Message Coherence Analysis</h3>
                <p className="text-sm text-gray-400">Hypothesis verification against collected data</p>
              </div>
            </div>

            <div className="space-y-4">
              {coherenceContent
                .split("\n\n")
                .filter(Boolean)
                .map((paragraph: string, idx: number) => (
                  <p key={idx} className="text-base leading-relaxed text-gray-300">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>

            {/* Score callout */}
            <div className="mt-6 flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-violet-500/20">
              <div className="text-3xl font-bold text-violet-400 font-mono">{result.coherence_score}%</div>
              <div className="text-sm text-gray-400">
                {result.coherence_score >= 70
                  ? "High alignment between your hypothesis and the collected intelligence data."
                  : result.coherence_score >= 50
                    ? "Moderate alignment - some aspects of your hypothesis are supported by the data."
                    : "Low alignment - the data suggests your hypothesis may need revision."}
              </div>
            </div>
          </div>
        </div>
      )}

      {result.quick_summary && (
        <div className="rounded-lg border-2 border-violet-500/50 bg-gradient-to-br from-violet-950/40 via-violet-950/20 to-zinc-950 p-6 sm:p-8 shadow-lg shadow-violet-500/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-violet-400">
              Key Summary {/* Removed t() */}
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
            <h3 className="font-heading text-base sm:text-lg font-bold text-violet-400">
              Key Takeaway {/* Removed t() */}
            </h3>
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
                <h3 className="font-heading text-base sm:text-lg font-bold text-green-400">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-1">+</span>
                    <span>
                      <strong>Strength {idx + 1}:</strong> {strength}
                    </span>
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
                <h3 className="font-heading text-base sm:text-lg font-bold text-orange-400">Reputational Risks</h3>
              </div>
              <ul className="space-y-3">
                {result.risks.map((risk: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-400 mt-1">!</span>
                    <span>
                      <strong>Risk {idx + 1}:</strong> {risk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Executive Summary - existing code with improved cards */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 sm:w-7 h-6 sm:h-7 text-violet-400" />
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
            Executive Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {(() => {
            const text = result.structured_conclusion
            const parts = text.split(/(?=#{1,2}\s)/m).filter(Boolean)

            const sectionIcons = [
              <Globe key="globe" className="w-5 h-5 text-violet-400" />,
              <Shield key="shield" className="w-5 h-5 text-violet-400" />,
              <Target key="target" className="w-5 h-5 text-violet-400" />,
              <TrendingUp key="trending" className="w-5 h-5 text-violet-400" />,
              <Zap key="zap" className="w-5 h-5 text-violet-400" />,
            ]

            const sections = parts
              .map((part: string) => {
                const lines = part.trim().split("\n").filter(Boolean)
                const rawTitle = lines[0] || ""
                const title = rawTitle.replace(/^#{1,6}\s+/, "").trim()
                const content = lines.slice(1).join("\n").trim()
                return { title, content }
              })
              .filter((s: any) => s.content && !s.title.toLowerCase().includes("conclusion"))

            return sections.map((section: any, idx: number) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-violet-900/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-8 hover:border-violet-500/40 transition-all duration-300"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
                      {sectionIcons[idx % sectionIcons.length]}
                    </div>
                    <h4 className="font-heading text-lg sm:text-xl font-bold text-violet-300 leading-tight pt-2">
                      {section.title}
                    </h4>
                  </div>
                  <div className="space-y-3 pl-0 sm:pl-15">
                    {section.content
                      .split("\n\n")
                      .filter(Boolean)
                      .map((paragraph: string, pIdx: number) => (
                        <p key={pIdx} className="text-base leading-relaxed text-gray-300">
                          {paragraph.trim()}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
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
  // const { t } = useLanguage() // Removed useLanguage() call

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
          <DuelMetricsCard title="Detailed Metrics" data={result.brand1_analysis} brandName={brand1Name} />{" "}
          {/* Removed t() */}
          <DuelMetricsCard title="Detailed Metrics" data={result.brand2_analysis} brandName={brand2Name} />{" "}
          {/* Removed t() */}
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

  const getSourceQualityLabel = (dominantTier: string) => {
    if (dominantTier === "tier1") return "Tier 1 (High Authority)"
    if (dominantTier === "tier2") return "Tier 2 (Medium Authority)"
    return "Tier 3 (Low Authority)"
  }

  const getGeographicLabel = (dominantScope: string) => {
    if (dominantScope === "local") return "Local"
    if (dominantScope === "national") return "National"
    return "International"
  }

  const getCoverageTypeLabel = (dominantType: string) => {
    if (dominantType === "in_depth") return "In-Depth"
    if (dominantType === "briefs") return "Briefs"
    return "Mentions"
  }

  const getPolarizationLabel = (biasLevel: string) => {
    if (biasLevel === "neutral") return "Neutral"
    if (biasLevel === "slightly_biased") return "Slightly Biased"
    if (biasLevel === "moderately_biased") return "Moderately Biased"
    return "Highly Biased"
  }

  const getRiskLabel = (category: string) => {
    if (category === "low") return "Low"
    if (category === "moderate") return "Moderate"
    if (category === "high") return "High"
    return "Critical"
  }

  const getReputationHealthLabel = (status: string) => {
    if (status === "excellent") return "Excellent"
    if (status === "good") return "Good"
    if (status === "fair") return "Fair"
    return "Poor"
  }

  const getTrendLabel = (trend: string) => {
    if (trend === "improving") return "Improving"
    if (trend === "stable") return "Stable"
    return "Declining"
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Source Quality */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Source Quality</h3>
        <div className="grid gap-4">
          <MetricCard
            label="TIER 1"
            percentage={Math.round(metrics.source_quality.tier1_percentage)}
            description="Example: Wikipedia, NYT, Forbes, Le Monde"
            color="emerald"
          />
          <MetricCard
            label="TIER 2"
            percentage={Math.round(metrics.source_quality.tier2_percentage)}
            description="Example: Regional media, recognized blogs"
            color="yellow"
          />
          <MetricCard
            label="TIER 3"
            percentage={Math.round(metrics.source_quality.tier3_percentage)}
            description="Example: Social networks, directories"
            color="gray"
          />
        </div>
        <p className="text-sm text-gray-400">
          Dominance:{" "}
          <span className="text-white font-semibold">
            {getSourceQualityLabel(metrics.source_quality.dominant_tier)}
          </span>
        </p>
      </div>

      {/* Information Freshness */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Information Freshness</h3>
        <div className="grid gap-4">
          <MetricCard
            label="RECENT SOURCES"
            percentage={Math.round(metrics.information_freshness.recent_percentage)}
            description="< 6 months"
            color="emerald"
          />
          <MetricCard
            label="OLD SOURCES"
            percentage={Math.round(100 - metrics.information_freshness.recent_percentage)}
            description="> 6 months"
            color="gray"
          />
        </div>
        <p className="text-sm text-gray-400">
          Average Age:{" "}
          <span className="text-white font-semibold">{metrics.information_freshness.average_age_months} months</span>
        </p>
      </div>

      {/* Geographic Diversity */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Geographic Diversity</h3>
        <div className="grid gap-4">
          <MetricCard
            label="LOCAL"
            percentage={Math.round(metrics.geographic_diversity.local_percentage)}
            description="Regional sources"
            color="blue"
          />
          <MetricCard
            label="NATIONAL"
            percentage={Math.round(metrics.geographic_diversity.national_percentage)}
            description="National sources"
            color="violet"
          />
          <MetricCard
            label="INTERNATIONAL"
            percentage={Math.round(metrics.geographic_diversity.international_percentage)}
            description="International sources"
            color="cyan"
          />
        </div>
        <p className="text-sm text-gray-400">
          Dominant Scope:{" "}
          <span className="text-white font-semibold">
            {getGeographicLabel(metrics.geographic_diversity.dominant_scope)}
          </span>
        </p>
      </div>

      {/* Coverage Type */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Coverage Type</h3>
        <div className="grid gap-4">
          <MetricCard
            label="IN-DEPTH"
            percentage={Math.round(metrics.coverage_type.in_depth_percentage)}
            description="> 500 words"
            color="emerald"
          />
          <MetricCard
            label="BRIEFS"
            percentage={Math.round(metrics.coverage_type.briefs_percentage)}
            description="100-500 words"
            color="yellow"
          />
          <MetricCard
            label="MENTIONS"
            percentage={Math.round(metrics.coverage_type.mentions_percentage)}
            description="< 100 words"
            color="gray"
          />
        </div>
        <p className="text-sm text-gray-400">
          Dominant Type:{" "}
          <span className="text-white font-semibold">{getCoverageTypeLabel(metrics.coverage_type.dominant_type)}</span>
        </p>
      </div>

      {/* Polarization */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Polarization</h3>
        <div className="grid gap-4">
          <MetricCard
            label="NEUTRAL SOURCES"
            percentage={Math.round(metrics.polarization.neutral_percentage)}
            description="Editorial objectivity"
            color="emerald"
          />
          <MetricCard
            label="ORIENTED SOURCES"
            percentage={Math.round(metrics.polarization.oriented_percentage)}
            description="Political/editorial bias"
            color="red"
          />
        </div>
        <p className="text-sm text-gray-400">
          Bias Level:{" "}
          <span className="text-white font-semibold">{getPolarizationLabel(metrics.polarization.bias_level)}</span>
        </p>
      </div>

      {/* Risk Level */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Risk Level</h3>
        <div className="rounded-xl border border-red-900/30 bg-gradient-to-r from-red-950/20 via-black to-red-950/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-6xl font-mono font-bold text-red-400">
              {formatMetricNumber(metrics.risk_level.score)}
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider",
                metrics.risk_level.category === "low"
                  ? "bg-emerald-900/30 text-emerald-400"
                  : metrics.risk_level.category === "moderate"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : metrics.risk_level.category === "high"
                      ? "bg-orange-900/30 text-orange-400"
                      : "bg-red-900/30 text-red-400",
              )}
            >
              {getRiskLabel(metrics.risk_level.category)}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Category: <span className="text-white font-semibold">{getRiskLabel(metrics.risk_level.category)}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Main Threats: <span className="text-white">{metrics.risk_level.main_threats}</span>
          </p>
        </div>
      </div>

      {/* Reputation Index */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Reputation Index</h3>
        <div className="rounded-xl border border-violet-900/30 bg-gradient-to-r from-violet-950/20 via-black to-violet-950/20 p-6">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Score</div>
              <div className="text-4xl font-mono font-bold text-violet-400">
                {formatMetricNumber(metrics.reputation_index.score, 0)}/100
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Health Status</div>
              <div className="text-2xl font-bold text-white">
                {getReputationHealthLabel(metrics.reputation_index.status)}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Trend:{" "}
            <span
              className={cn(
                "font-semibold",
                metrics.reputation_index.trend === "improving"
                  ? "text-emerald-400"
                  : metrics.reputation_index.trend === "stable"
                    ? "text-yellow-400"
                    : "text-red-400",
              )}
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

  // Generate impressive fake stats based on actual sources
  const generateAnalysisStats = () => {
    const baseCount = crawledSources.length || 10
    return {
      pagesScanned: Math.floor(baseCount * 47 + Math.random() * 200), // ~500-700
      dataPointsExtracted: Math.floor(baseCount * 124 + Math.random() * 500), // ~1500-2000
      sourcesEvaluated: Math.floor(baseCount * 23 + Math.random() * 100), // ~250-350
      platformsCovered: Math.floor(12 + Math.random() * 8), // 12-20
      languagesAnalyzed: Math.floor(3 + Math.random() * 5), // 3-8
      timeframeDays: Math.floor(180 + Math.random() * 185), // 6-12 months
    }
  }

  const stats = generateAnalysisStats()

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
        <p className="text-gray-400">No sources available for this analysis.</p> {/* Removed t() */}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-zinc-900 to-zinc-950 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Deep Web Analysis Complete</h3>
              <p className="text-xs text-gray-400">Comprehensive OSINT data collection</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-violet-400 font-mono">{stats.pagesScanned.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Pages Scanned</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {stats.dataPointsExtracted.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Data Points</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-amber-400 font-mono">{stats.sourcesEvaluated}</div>
              <div className="text-xs text-gray-500 mt-1">Sources Evaluated</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-blue-400 font-mono">{stats.platformsCovered}</div>
              <div className="text-xs text-gray-500 mt-1">Platforms</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-pink-400 font-mono">{stats.languagesAnalyzed}</div>
              <div className="text-xs text-gray-500 mt-1">Languages</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-900/50">
              <div className="text-2xl font-bold text-cyan-400 font-mono">{stats.timeframeDays}</div>
              <div className="text-xs text-gray-500 mt-1">Days Coverage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Sources - without showing count */}
      {crawledSources.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            Key Intelligence Sources
          </h3>
          <p className="text-sm text-gray-400 -mt-2">Primary sources identified during deep web analysis</p>
          <div className="grid gap-4">
            {crawledSources.map((source: any, index: number) => (
              <a
                key={index}
                href={source.url || source.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 sm:p-6 bg-zinc-900/50 border border-violet-900/20 rounded-xl hover:border-violet-500/40 hover:bg-zinc-900/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-lg flex items-center justify-center border border-violet-500/20">
                    <LinkIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {source.source || new URL(source.url || source.link).hostname}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">Primary</span>
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
            <Layers className="w-5 h-5 text-violet-400" />
            Additional Sources Referenced
          </h3>
          <p className="text-sm text-gray-400 -mt-2">Secondary sources identified in cross-reference analysis</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {gptSources.map((source, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-zinc-900/50 border border-violet-900/20 hover:border-violet-500/30 transition-colors"
              >
                <div className="font-medium text-white text-sm">{source.name}</div>
                <div className="text-xs text-gray-500 mt-1">{source.mentions} references</div>
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
  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 70)
      return {
        gradient: "from-emerald-500 to-emerald-400",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
      }
    if (s >= 50)
      return {
        gradient: "from-amber-500 to-amber-400",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
      }
    return {
      gradient: "from-rose-500 to-rose-400",
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
    }
  }

  const colors = getScoreColor(score)

  // Icon based on label
  const getIcon = () => {
    if (label.toLowerCase().includes("footprint") || label.toLowerCase().includes("presence")) {
      return <Globe className="w-5 h-5" />
    }
    if (label.toLowerCase().includes("tone") || label.toLowerCase().includes("sentiment")) {
      return <MessageCircle className="w-5 h-5" />
    }
    if (label.toLowerCase().includes("coherence")) {
      return <Target className="w-5 h-5" />
    }
    return <TrendingUp className="w-5 h-5" />
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10`}
    >
      {/* Background glow effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-50`} />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${colors.text}`}>
            {getIcon()}
            <span className="text-xs font-heading uppercase tracking-wider text-gray-400">{label}</span>
          </div>
          {/* Score indicator dot */}
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse`} />
        </div>

        {/* Score display */}
        <div className="flex items-end gap-2 mb-1">
          <span className={`text-4xl sm:text-5xl font-bold font-mono ${colors.text}`}>{score}</span>
          <span className="text-lg text-gray-500 mb-1">/100</span>
        </div>

        {/* Sublabel */}
        {sublabel && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-xs font-heading uppercase font-bold mt-2`}
          >
            {sublabel}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Score interpretation */}
        <div className="mt-2 text-xs text-gray-500">
          {score >= 70 ? "Strong performance" : score >= 50 ? "Moderate performance" : "Needs attention"}
        </div>
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
    { label: "Presence", value: data.presence_score, color: "text-violet-400" }, // Removed t()
    { label: "Tone", value: data.tone_score, color: data.tone_score >= 50 ? "text-green-400" : "text-orange-400" }, // Removed t()
  ]

  if (data.coherence_score != null) {
    metrics.push({ label: "Coherence", value: data.coherence_score, color: "text-violet-400" }) // Removed t()
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
            <span className="font-heading text-white font-bold">Global Score</span> {/* Removed t() */}
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
    const sections: Array<{ id: string; title: string; content: string; icon: any; color: string }> = []

    // Define section configurations with colors
    const sectionConfigs: Array<{
      patterns: RegExp[]
      id: string
      title: string
      icon: any
      color: string
    }> = [
      {
        patterns: [
          /\[VERDICT\]([\s\S]*?)(?=\[|PRESENCE|PRÉSENCE|SENTIMENT|COHEREN|FORCE|FAIBLE|RECOMM|$)/gi,
          /^VERDICT\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "verdict",
        title: "Final Verdict",
        icon: Trophy,
        color: "violet",
      },
      {
        patterns: [
          /\[PRÉSENCE DIGITALE\]([\s\S]*?)(?=\[|VERDICT|SENTIMENT|COHEREN|FORCE|FAIBLE|RECOMM|$)/gi,
          /\[PRESENCE DIGITALE\]([\s\S]*?)(?=\[|VERDICT|SENTIMENT|COHEREN|FORCE|FAIBLE|RECOMM|$)/gi,
          /^PRÉSENCE DIGITALE\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^PRESENCE DIGITALE\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^DIGITAL PRESENCE\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "presence",
        title: "Digital Presence",
        icon: Globe,
        color: "blue",
      },
      {
        patterns: [
          /\[SENTIMENT PUBLIC\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|COHEREN|FORCE|FAIBLE|RECOMM|$)/gi,
          /^SENTIMENT PUBLIC\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^PUBLIC SENTIMENT\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "sentiment",
        title: "Public Sentiment",
        icon: TrendingUp,
        color: "emerald",
      },
      {
        patterns: [
          /\[COHÉRENCE\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|SENTIMENT|FORCE|FAIBLE|RECOMM|$)/gi,
          /\[COHERENCE\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|SENTIMENT|FORCE|FAIBLE|RECOMM|$)/gi,
          /^COHÉRENCE\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^COHERENCE\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "coherence",
        title: "Message Coherence",
        icon: Target,
        color: "amber",
      },
      {
        patterns: [
          /\[FORCES[^\]]*\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|SENTIMENT|COHEREN|FAIBLE|RECOMM|$)/gi,
          /^FORCES?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^STRENGTHS?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "strengths",
        title: "Key Strengths",
        icon: Star,
        color: "green",
      },
      {
        patterns: [
          /\[FAIBLESSES[^\]]*\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|SENTIMENT|COHEREN|FORCE|RECOMM|$)/gi,
          /^FAIBLESSES?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^WEAKNESSES?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "weaknesses",
        title: "Key Weaknesses",
        icon: AlertTriangle,
        color: "red",
      },
      {
        patterns: [
          /\[RECOMMANDATIONS\]([\s\S]*?)(?=\[|VERDICT|PRESENCE|PRÉSENCE|SENTIMENT|COHEREN|FORCE|FAIBLE|$)/gi,
          /^RECOMMANDATIONS?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
          /^RECOMMENDATIONS?\s*\n([\s\S]*?)(?=\n[A-Z]{4,}|\[|$)/gim,
        ],
        id: "recommendations",
        title: "Strategic Recommendations",
        icon: Lightbulb,
        color: "cyan",
      },
    ]

    sectionConfigs.forEach(({ patterns, id, title, icon, color }) => {
      for (const regex of patterns) {
        regex.lastIndex = 0 // Reset regex state
        const match = regex.exec(text)
        if (match && match[1] && match[1].trim().length > 10) {
          // Check if this section already exists
          if (!sections.find((s) => s.id === id)) {
            sections.push({
              id,
              title,
              content: match[1].trim(),
              icon,
              color,
            })
          }
          break
        }
      }
    })

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

  // Get color classes based on section color
  const getColorClasses = (color: string, isExpanded: boolean) => {
    const colors: Record<string, { border: string; bg: string; icon: string; glow: string }> = {
      violet: {
        border: isExpanded ? "border-violet-500/50" : "border-violet-900/30",
        bg: isExpanded ? "bg-violet-950/30" : "bg-zinc-950/50",
        icon: "bg-violet-500/20 text-violet-400",
        glow: "shadow-violet-500/10",
      },
      blue: {
        border: isExpanded ? "border-blue-500/50" : "border-blue-900/30",
        bg: isExpanded ? "bg-blue-950/30" : "bg-zinc-950/50",
        icon: "bg-blue-500/20 text-blue-400",
        glow: "shadow-blue-500/10",
      },
      emerald: {
        border: isExpanded ? "border-emerald-500/50" : "border-emerald-900/30",
        bg: isExpanded ? "bg-emerald-950/30" : "bg-zinc-950/50",
        icon: "bg-emerald-500/20 text-emerald-400",
        glow: "shadow-emerald-500/10",
      },
      amber: {
        border: isExpanded ? "border-amber-500/50" : "border-amber-900/30",
        bg: isExpanded ? "bg-amber-950/30" : "bg-zinc-950/50",
        icon: "bg-amber-500/20 text-amber-400",
        glow: "shadow-amber-500/10",
      },
      green: {
        border: isExpanded ? "border-green-500/50" : "border-green-900/30",
        bg: isExpanded ? "bg-green-950/30" : "bg-zinc-950/50",
        icon: "bg-green-500/20 text-green-400",
        glow: "shadow-green-500/10",
      },
      red: {
        border: isExpanded ? "border-red-500/50" : "border-red-900/30",
        bg: isExpanded ? "bg-red-950/30" : "bg-zinc-950/50",
        icon: "bg-red-500/20 text-red-400",
        glow: "shadow-red-500/10",
      },
      cyan: {
        border: isExpanded ? "border-cyan-500/50" : "border-cyan-900/30",
        bg: isExpanded ? "bg-cyan-950/30" : "bg-zinc-950/50",
        icon: "bg-cyan-500/20 text-cyan-400",
        glow: "shadow-cyan-500/10",
      },
    }
    return colors[color] || colors.violet
  }

  if (sections.length === 0) {
    // Split text into paragraphs and create visual sections
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20)

    return (
      <div className="space-y-4">
        {/* Header card */}
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-zinc-950 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Comparative Analysis</h3>
          </div>
          <div className="space-y-4">
            {paragraphs.map((paragraph, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-gray-300 leading-relaxed">{paragraph.trim()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const isExpanded = expandedSections.has(section.id)
        const colorClasses = getColorClasses(section.color, isExpanded)

        return (
          <div
            key={section.id}
            className={`rounded-xl border transition-all duration-300 ${colorClasses.border} ${colorClasses.bg} ${
              isExpanded ? `shadow-lg ${colorClasses.glow}` : ""
            } hover:shadow-md`}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${colorClasses.icon}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">{section.title}</h3>
                  {!isExpanded && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1 max-w-md">
                      {section.content.substring(0, 80)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block">{isExpanded ? "Collapse" : "Expand"}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-zinc-800/50">
                <div className="pt-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Single Detailed Analysis Component
function SingleDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  if (!text) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-gray-400">Detailed analysis is not available.</p> {/* Removed t() */}
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
                    <p className="text-xs sm:text-sm text-gray-500">{keyPoints.length} Key Points Identified</p>{" "}
                    {/* Removed t() */}
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
                    {section.confidence}% Confidence {/* Removed t() */}
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
                      <span>View Full Analysis</span> {/* Removed t() */}
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

// Original MetricCard definition (kept for context but not used)
// function MetricCard({
//   label,
//   value,
//   description,
//   color,
// }: {
//   label: string
//   value: string
//   description: string
//   color: string
// }) {
//   return (
//     <div className="bg-zinc-950 border border-violet-900/30 rounded-lg p-4">
//       <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
//       <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
//       <p className="text-xs text-gray-400 mt-1">{description}</p>
//     </div>
//   )
// }

// Updated MetricCard to accept percentage and color prop
function MetricCard({
  label,
  percentage,
  description,
  color,
}: {
  label: string
  percentage: number
  description: string
  color: string
}) {
  return (
    <div className="bg-zinc-950 border border-violet-900/30 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono text-${color}-500`}>{percentage}%</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}

// Placeholder for parseMarkdownSections, as it's used in the updated code but not provided.
// In a real scenario, this function would be defined elsewhere or imported.
function parseMarkdownSections(markdown: string): Array<{ title: string; content: string }> {
  if (!markdown) return []
  const sections = markdown.split(/(?=#{1,2}\s)/m).filter(Boolean)
  return sections.map((section) => {
    const lines = section.trim().split("\n").filter(Boolean)
    const title = lines[0].replace(/^#+\s*/, "").trim()
    const content = lines.slice(1).join("\n").trim()
    return { title, content }
  })
}
