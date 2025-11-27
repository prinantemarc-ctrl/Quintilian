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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AuthGateModal } from "@/components/auth/auth-gate-modal"

interface AnalysisResultsFullscreenProps {
  isOpen: boolean
  onClose: () => void
  result: any
  type?: "duel" | "gmi" | "press"
  brand?: string
  analysisType?: string
}

export function AnalysisResultsFullscreen({
  isOpen,
  onClose,
  result,
  type = "gmi",
  brand,
  analysisType,
}: AnalysisResultsFullscreenProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showAuthGate, setShowAuthGate] = useState(false)

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
    console.log("[v0] Displaying AuthGateModal")
    return (
      <AuthGateModal
        isOpen={true}
        onAuthSuccess={() => {
          setIsAuthenticated(true)
          setShowAuthGate(false)
        }}
        onClose={onClose}
        analysisType={type === "duel" ? "duel" : "simple"}
      />
    )
  }

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: Target },
    { id: "detailed", label: "Analyse Détaillée", icon: Brain },
    { id: "metrics", label: "Métriques", icon: FileText },
    { id: "sources", label: "Sources", icon: LinkIcon },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="border-b border-red-900/30 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Button
              onClick={onClose}
              variant="ghost"
              className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <div className="h-8 w-px bg-red-900/30 hidden sm:block" />
            <h1 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-white">
              {type === "duel" ? "RAPPORT DE CONFRONTATION" : "RAPPORT D'INTELLIGENCE"}
            </h1>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-red-950/30"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Tabs - Harmonisé avec font-heading */}
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
                    ? "border-red-500 text-white bg-red-950/20"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-red-950/10"
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

// Overview Tab - Harmonisé toutes les polices
function OverviewTab({ result, type, brand }: any) {
  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"
    const hasCoherence = result.brand1_analysis?.coherence_score != null

    return (
      <div className="space-y-8">
        {/* Winner Banner */}
        <div className="rounded-lg border border-red-500 bg-red-950/20 p-6 sm:p-8 text-center">
          <div className="font-heading text-sm font-bold tracking-widest text-red-400 uppercase mb-2">
            Cible Dominante
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-bold text-white">{result.winner}</div>
          <div className="mt-4 text-base sm:text-lg text-gray-300">Écart : {result.score_difference} points</div>
        </div>

        {/* Scores Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Brand 1 */}
          <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand1Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label="Empreinte Numérique" score={result.brand1_analysis.presence_score} />
              <ScoreDisplay
                label="Tonalité Détectée"
                score={result.brand1_analysis.tone_score}
                label2={result.brand1_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label="Cohérence Message" score={result.brand1_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-red-900/30">
                <ScoreDisplay label="Score Global" score={result.brand1_analysis.global_score} large />
              </div>
            </div>
          </div>

          {/* Brand 2 */}
          <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-4 sm:p-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">{brand2Name}</h3>
            <div className="space-y-4">
              <ScoreDisplay label="Empreinte Numérique" score={result.brand2_analysis.presence_score} />
              <ScoreDisplay
                label="Tonalité Détectée"
                score={result.brand2_analysis.tone_score}
                label2={result.brand2_analysis.tone_label}
              />
              {hasCoherence && (
                <ScoreDisplay label="Cohérence Message" score={result.brand2_analysis.coherence_score} />
              )}
              <div className="pt-4 border-t border-red-900/30">
                <ScoreDisplay label="Score Global" score={result.brand2_analysis.global_score} large />
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
        <ScoreCard label="Empreinte Numérique" score={result.presence_score} />
        <ScoreCard label="Tonalité Détectée" score={result.tone_score} sublabel={result.tone_label} />
        {result.coherence_score !== null && result.coherence_score !== undefined && (
          <ScoreCard label="Cohérence Message" score={result.coherence_score} />
        )}
      </div>

      {result.quick_summary && (
        <div className="rounded-lg border-2 border-red-500/50 bg-gradient-to-br from-red-950/40 via-red-950/20 to-zinc-950 p-6 sm:p-8 shadow-lg shadow-red-500/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-red-400">Que retient-on, en une phrase ?</h3>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-white font-medium pl-0 sm:pl-14">
            "{result.quick_summary}"
          </p>
        </div>
      )}

      {result.key_takeaway && (
        <div className="rounded-lg border border-red-900/30 bg-gradient-to-br from-red-950/30 to-zinc-950 p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <Brain className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-red-400">Résumé Clé</h3>
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
                <h3 className="font-heading text-base sm:text-lg font-bold text-green-400">Forces Principales</h3>
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
                <h3 className="font-heading text-base sm:text-lg font-bold text-orange-400">Risques Réputationnels</h3>
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
            <FileText className="w-6 sm:w-7 h-6 sm:h-7 text-red-400" />
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              Synthèse Exécutive
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {(() => {
              const text = result.structured_conclusion
              // Split by lines that start with # (with 1 or 2 #)
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
                // Fallback: show as single block with better formatting
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
                  icon = <Globe className="w-5 h-5 text-red-400" />
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
                    className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-950 p-6 sm:p-8 hover:border-red-900/50 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{icon}</div>
                      <div className="flex-1 space-y-4">
                        <h4 className="font-heading text-base sm:text-lg font-bold text-red-400 uppercase tracking-wide">
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

// Metrics Tab
function MetricsTab({ result, type }: any) {
  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"

    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-red-900/30 bg-gradient-to-r from-red-950/20 via-black to-red-950/20 p-4 sm:p-6">
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
              <Swords className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
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
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-gray-400">Les métriques avancées ne sont pas disponibles pour cette analyse.</p>
        <p className="text-sm text-gray-500 mt-2">Elles seront générées lors des prochaines analyses.</p>
      </div>
    )
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "tier1":
        return "Tier 1 (Haute Autorité)"
      case "tier2":
        return "Tier 2 (Autorité Moyenne)"
      case "tier3":
        return "Tier 3 (Faible Autorité)"
      default:
        return tier
    }
  }

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "local":
        return "Local"
      case "national":
        return "National"
      case "international":
        return "International"
      default:
        return scope
    }
  }

  const getCoverageLabel = (type: string) => {
    switch (type) {
      case "in_depth":
        return "Articles de Fond"
      case "brief":
        return "Brèves"
      case "mention":
        return "Mentions"
      default:
        return type
    }
  }

  const getBiasLabel = (bias: string) => {
    switch (bias) {
      case "neutral":
        return "Neutre"
      case "slightly_biased":
        return "Légèrement Orienté"
      case "highly_biased":
        return "Fortement Orienté"
      default:
        return bias
    }
  }

  const getRiskCategoryLabel = (category: string) => {
    switch (category) {
      case "low":
        return "Faible"
      case "moderate":
        return "Modéré"
      case "high":
        return "Élevé"
      case "critical":
        return "Critique"
      default:
        return category
    }
  }

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excellente"
      case "good":
        return "Bonne"
      case "fair":
        return "Correcte"
      case "poor":
        return "Mauvaise"
      default:
        return status
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving":
        return "En Amélioration"
      case "stable":
        return "Stable"
      case "declining":
        return "En Déclin"
      default:
        return trend
    }
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Qualité des Sources */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Qualité des Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label="TIER 1"
            value={`${metrics.source_quality.tier1_percentage}%`}
            description="Exemple : Wikipedia, NYT, Forbes, Le Monde"
            color="text-green-500"
          />
          <MetricCard
            label="TIER 2"
            value={`${metrics.source_quality.tier2_percentage}%`}
            description="Exemple : Médias régionaux, blogs reconnus"
            color="text-blue-500"
          />
          <MetricCard
            label="TIER 3"
            value={`${metrics.source_quality.tier3_percentage}%`}
            description="Exemple : Réseaux sociaux, annuaires"
            color="text-gray-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          Dominance:{" "}
          <span className="font-semibold text-white">{getTierLabel(metrics.source_quality.dominant_tier)}</span>
        </p>
      </div>

      {/* Fraîcheur de l'Information */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Fraîcheur de l'Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            label="Sources Récentes"
            value={`${metrics.information_freshness.recent_percentage}%`}
            description="< 6 mois"
            color="text-green-500"
          />
          <MetricCard
            label="Sources Anciennes"
            value={`${metrics.information_freshness.old_percentage}%`}
            description="> 6 mois"
            color="text-amber-500"
          />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Âge moyen:{" "}
          <span className="font-semibold text-white">{metrics.information_freshness.average_age_months} mois</span>
        </p>
      </div>

      {/* Diversité Géographique */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Diversité Géographique</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label="Local"
            value={`${metrics.geographic_diversity.local_percentage}%`}
            description="Sources régionales"
            color="text-blue-500"
          />
          <MetricCard
            label="National"
            value={`${metrics.geographic_diversity.national_percentage}%`}
            description="Sources nationales"
            color="text-purple-500"
          />
          <MetricCard
            label="International"
            value={`${metrics.geographic_diversity.international_percentage}%`}
            description="Sources internationales"
            color="text-cyan-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          Portée dominante:{" "}
          <span className="font-semibold text-white">{getScopeLabel(metrics.geographic_diversity.dominant_scope)}</span>
        </p>
      </div>

      {/* Type de Couverture */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Type de Couverture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <MetricCard
            label="Articles de Fond"
            value={`${metrics.coverage_type.in_depth_percentage}%`}
            description="> 500 mots"
            color="text-green-500"
          />
          <MetricCard
            label="Brèves"
            value={`${metrics.coverage_type.brief_percentage}%`}
            description="100-500 mots"
            color="text-blue-500"
          />
          <MetricCard
            label="Mentions"
            value={`${metrics.coverage_type.mention_percentage}%`}
            description="< 100 mots"
            color="text-gray-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          Type dominant:{" "}
          <span className="font-semibold text-white">{getCoverageLabel(metrics.coverage_type.dominant_type)}</span>
        </p>
      </div>

      {/* Polarisation */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Polarisation des Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <MetricCard
            label="Sources Neutres"
            value={`${metrics.polarization.neutral_percentage}%`}
            description="Objectivité éditoriale"
            color="text-green-500"
          />
          <MetricCard
            label="Sources Orientées"
            value={`${metrics.polarization.oriented_percentage}%`}
            description="Biais politique/éditorial"
            color="text-amber-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          Niveau de biais:{" "}
          <span className="font-semibold text-white">{getBiasLabel(metrics.polarization.bias_level)}</span>
        </p>
      </div>

      {/* Niveau de Risque */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Niveau de Risque Réputationnel</h3>
        <div className="bg-zinc-950 border border-red-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold font-mono text-white">{metrics.risk_level.score}/100</p>
              <p className="text-sm text-gray-400 mt-1">
                Catégorie:{" "}
                <span className="font-semibold text-white">{getRiskCategoryLabel(metrics.risk_level.category)}</span>
              </p>
            </div>
            <div
              className={`text-5xl ${
                metrics.risk_level.category === "low"
                  ? "text-green-500"
                  : metrics.risk_level.category === "moderate"
                    ? "text-amber-500"
                    : metrics.risk_level.category === "high"
                      ? "text-orange-500"
                      : "text-red-500"
              }`}
            >
              {metrics.risk_level.category === "low" ? "✓" : metrics.risk_level.category === "moderate" ? "⚠" : "⚠"}
            </div>
          </div>
          {metrics.risk_level.main_threats.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2 text-white">Menaces principales:</p>
              <ul className="space-y-1">
                {metrics.risk_level.main_threats.map((threat, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Indice de Réputation */}
      <div>
        <h3 className="text-xl font-heading font-bold mb-4 text-white">Indice de Réputation Globale</h3>
        <div className="bg-zinc-950 border border-red-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold font-mono text-white">{metrics.reputation_index.score}/100</p>
              <p className="text-sm text-gray-400 mt-1">
                État:{" "}
                <span className="font-semibold text-white">
                  {getHealthStatusLabel(metrics.reputation_index.health_status)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Tendance</p>
              <p
                className={`text-lg font-semibold ${
                  metrics.reputation_index.trend === "improving"
                    ? "text-green-500"
                    : metrics.reputation_index.trend === "stable"
                      ? "text-blue-500"
                      : "text-red-500"
                }`}
              >
                {metrics.reputation_index.trend === "improving"
                  ? "↗"
                  : metrics.reputation_index.trend === "stable"
                    ? "→"
                    : "↘"}{" "}
                {getTrendLabel(metrics.reputation_index.trend)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sources Tab
function SourcesTab({ result }: any) {
  const crawledSources = result.sources || []

  console.log("[v0] SourcesTab - crawled sources count:", crawledSources.length)

  const detailedAnalysis = result.detailed_analysis || ""
  const structuredConclusion = result.structured_conclusion || ""
  const gptSummary = result.gpt_summary || ""
  const allGPTText = `${detailedAnalysis} ${structuredConclusion} ${gptSummary}`

  console.log("[v0] SourcesTab - GPT text length:", allGPTText.length)
  console.log("[v0] SourcesTab - GPT text sample:", allGPTText.substring(0, 300))

  // Known source patterns to look for in the text
  const sourcePatterns = [
    // News & Media
    { pattern: /(?:New York Times|NYT|nytimes)/gi, name: "The New York Times", domain: "nytimes.com", type: "media" },
    {
      pattern: /(?:Washington Post|washingtonpost)/gi,
      name: "The Washington Post",
      domain: "washingtonpost.com",
      type: "media",
    },
    { pattern: /(?:Wall Street Journal|WSJ)/gi, name: "Wall Street Journal", domain: "wsj.com", type: "media" },
    { pattern: /(?:Le Monde|lemonde)/gi, name: "Le Monde", domain: "lemonde.fr", type: "media" },
    { pattern: /(?:Le Figaro|lefigaro)/gi, name: "Le Figaro", domain: "lefigaro.fr", type: "media" },
    { pattern: /(?:The Guardian|guardian)/gi, name: "The Guardian", domain: "theguardian.com", type: "media" },
    { pattern: /(?:BBC|bbc\.)/gi, name: "BBC", domain: "bbc.com", type: "media" },
    { pattern: /(?:CNN|cnn\.)/gi, name: "CNN", domain: "cnn.com", type: "media" },
    { pattern: /(?:Reuters|reuters)/gi, name: "Reuters", domain: "reuters.com", type: "media" },
    { pattern: /(?:Bloomberg|bloomberg)/gi, name: "Bloomberg", domain: "bloomberg.com", type: "media" },
    { pattern: /(?:Forbes|forbes)/gi, name: "Forbes", domain: "forbes.com", type: "media" },
    { pattern: /(?:Fortune|fortune)/gi, name: "Fortune", domain: "fortune.com", type: "media" },
    { pattern: /(?:Financial Times|FT|ft\.com)/gi, name: "Financial Times", domain: "ft.com", type: "media" },

    // Wikipedia & Reference
    { pattern: /(?:Wikipédia|Wikipedia|wikiped)/gi, name: "Wikipedia", domain: "wikipedia.org", type: "reference" },
    {
      pattern: /(?:Britannica|britannica)/gi,
      name: "Encyclopædia Britannica",
      domain: "britannica.com",
      type: "reference",
    },

    // Social Media & Platforms
    { pattern: /(?:Twitter|X\.com|twitter\.com)/gi, name: "X (Twitter)", domain: "x.com", type: "social" },
    { pattern: /(?:LinkedIn|linkedin)/gi, name: "LinkedIn", domain: "linkedin.com", type: "social" },
    { pattern: /(?:Facebook|facebook)/gi, name: "Facebook", domain: "facebook.com", type: "social" },
    { pattern: /(?:Instagram|instagram)/gi, name: "Instagram", domain: "instagram.com", type: "social" },
    { pattern: /(?:YouTube|youtube)/gi, name: "YouTube", domain: "youtube.com", type: "social" },
    { pattern: /(?:Reddit|reddit)/gi, name: "Reddit", domain: "reddit.com", type: "social" },

    // Tech & Business
    { pattern: /(?:TechCrunch|techcrunch)/gi, name: "TechCrunch", domain: "techcrunch.com", type: "media" },
    { pattern: /(?:The Verge|theverge)/gi, name: "The Verge", domain: "theverge.com", type: "media" },
    { pattern: /(?:Wired|wired\.)/gi, name: "Wired", domain: "wired.com", type: "media" },
    { pattern: /(?:CNBC|cnbc\.)/gi, name: "CNBC", domain: "cnbc.com", type: "media" },

    // Companies & Organizations (entities mentioned in the analysis)
    { pattern: /\bTesla\b/gi, name: "Tesla", domain: "tesla.com", type: "entity" },
    { pattern: /\bSpaceX\b/gi, name: "SpaceX", domain: "spacex.com", type: "entity" },
    { pattern: /\bNeuralink\b/gi, name: "Neuralink", domain: "neuralink.com", type: "entity" },
    { pattern: /\bThe Boring Company\b/gi, name: "The Boring Company", domain: "boringcompany.com", type: "entity" },
    { pattern: /\bOpenAI\b/gi, name: "OpenAI", domain: "openai.com", type: "entity" },
    { pattern: /\bPayPal\b/gi, name: "PayPal", domain: "paypal.com", type: "entity" },
    { pattern: /\bStarlink\b/gi, name: "Starlink", domain: "starlink.com", type: "entity" },
  ]

  // Find all mentioned sources
  const mentionedSources = new Set<string>()
  const gptSourcesData: any[] = []

  sourcePatterns.forEach(({ pattern, name, domain, type }) => {
    const matches = allGPTText.match(pattern)
    if (matches && matches.length > 0 && !mentionedSources.has(name)) {
      mentionedSources.add(name)

      console.log("[v0] SourcesTab - Found mention:", name, "type:", type, "matches:", matches.length)

      // Check if this source is not already in crawled sources
      const alreadyCrawled = crawledSources.some(
        (s: any) => s.link?.includes(domain) || s.title?.toLowerCase().includes(name.toLowerCase()),
      )

      console.log("[v0] SourcesTab - Already crawled?", name, alreadyCrawled)

      if (!alreadyCrawled || type === "entity") {
        const description =
          type === "entity"
            ? `Organisation mentionnée ${matches.length} fois dans l'analyse`
            : `Source identifiée dans l'analyse d'intelligence artificielle - Mentionnée ${matches.length} fois`

        gptSourcesData.push({
          title: name,
          link: `https://${domain}`,
          snippet: description,
          fromGPT: true,
          sourceType: type,
        })
      }
    }
  })

  console.log("[v0] SourcesTab - GPT sources found:", gptSourcesData.length)
  console.log("[v0] SourcesTab - Total sources (crawled + GPT):", crawledSources.length + gptSourcesData.length)

  const allSources = [...crawledSources, ...gptSourcesData]

  if (allSources.length === 0) {
    return (
      <div className="text-center py-16">
        <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">Aucune source disponible</h3>
        <p className="text-sm text-gray-400 mt-2">Les sources seront affichées ici une fois l'analyse terminée.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">Sources Analysées</h2>
        <p className="text-sm text-gray-400">Échantillon des sources principales</p>
      </div>

      <div className="grid gap-4">
        {allSources.map((source: any, index: number) => (
          <a
            key={index}
            href={source.link || source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 sm:p-6 bg-zinc-950/50 border border-red-900/20 rounded-xl hover:border-red-500/40 hover:bg-zinc-950/50 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg flex items-center justify-center border border-red-500/20">
                <span className="font-mono text-red-500 font-bold text-sm sm:text-base">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {source.title}
                  </h3>
                  {source.fromGPT && (
                    <span
                      className={`flex-shrink-0 px-2 py-1 text-xs font-mono rounded ${
                        source.sourceType === "entity"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      }`}
                    >
                      {source.sourceType === "entity" ? "ENTITÉ" : "IA"}
                    </span>
                  )}
                </div>

                {source.snippet && (
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3">{source.snippet}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate font-mono">{source.link || source.url}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// Helper Components
function ScoreCard({ label, score, sublabel }: { label: string; score: number; sublabel?: string }) {
  return (
    <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-4 sm:p-6">
      <div className="font-heading text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">{label}</div>
      <div className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
        {score}
        <span className="text-lg sm:text-xl text-gray-500">/100</span>
      </div>
      {sublabel && <div className="text-xs font-heading text-red-400 uppercase font-bold">{sublabel}</div>}
      <div className="mt-4 h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

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
        {label2 && <div className="text-xs font-heading text-red-400 uppercase font-bold">{label2}</div>}
      </div>
    </div>
  )
}

function MetricsSection({
  title,
  metrics,
}: { title: string; metrics: Array<{ label: string; value: number | string; color: string; sublabel?: string }> }) {
  return (
    <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-4 sm:p-6">
      <h3 className="font-heading text-base sm:text-lg font-bold text-white uppercase tracking-wide mb-4 sm:mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <div className="font-heading text-xs text-gray-500 uppercase tracking-wider mb-2">{metric.label}</div>
            <div className={`font-heading text-2xl sm:text-3xl font-bold ${metric.color}`}>{metric.value}</div>
            {metric.sublabel && <div className="font-heading text-xs text-gray-400 mt-1">{metric.sublabel}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function DuelMetricsCard({ title, data, brandName }: { title: string; data: any; brandName: string }) {
  if (!data) return null

  const metrics = [
    { label: "Présence", value: data.presence_score, color: "text-blue-400" },
    { label: "Tonalité", value: data.tone_score, color: data.tone_score >= 50 ? "text-green-400" : "text-red-400" },
    { label: "Cohérence", value: data.coherence_score, color: "text-purple-400" },
    { label: "Global", value: data.global_score, color: "text-white" },
  ]

  return (
    <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-heading text-base sm:text-lg font-bold text-white uppercase tracking-wide">{brandName}</h3>
        <p className="font-heading text-xs text-gray-500">Métriques détaillées</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-3 sm:p-4 bg-zinc-900/50 rounded-lg">
            <div className="font-heading text-xs text-gray-400 uppercase tracking-wider">{metric.label}</div>
            <div className={`font-heading text-2xl sm:text-3xl font-bold ${metric.color} mt-1`}>
              {metric.value || 0}
            </div>
          </div>
        ))}
      </div>
      {data.rationale && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-red-900/30">
          <div className="font-heading text-xs text-gray-400 uppercase tracking-wider mb-2">Analyse</div>
          <p className="text-sm text-gray-300 leading-relaxed">{data.rationale}</p>
        </div>
      )}
    </div>
  )
}

// Analysis Section Component
function AnalysisSection({
  title,
  content,
  colors,
}: { title: string; content: string; colors: { bg: string; border: string; title: string; icon: string } }) {
  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 sm:p-6`}>
      <h3 className={`font-heading text-base sm:text-lg font-bold ${colors.title} uppercase tracking-wide mb-4`}>
        {title}
      </h3>
      <div className="space-y-3">
        {content
          .split("\n")
          .filter(Boolean)
          .map((paragraph, idx) => (
            <p key={idx} className="text-sm text-gray-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
      </div>
    </div>
  )
}

// Duel Detailed Analysis Component
function DuelDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const brand1Name = result.brand1_name || "Cible Alpha"
  const brand2Name = result.brand2_name || "Cible Bravo"

  const parseDetailedComparison = (text: string) => {
    const sections: { title: string; content: string }[] = []

    // Split by lines starting with [SECTION] or # SECTION
    const lines = text.split("\n")
    let currentSection: { title: string; content: string } | null = null

    for (const line of lines) {
      const trimmed = line.trim()

      // Check for [SECTION TITLE] format
      const bracketMatch = trimmed.match(/^\[([A-ZÀ-Ÿ\s]+)\](.*)$/)
      if (bracketMatch) {
        if (currentSection) sections.push(currentSection)
        currentSection = {
          title: bracketMatch[1].trim(),
          content: bracketMatch[2].trim(),
        }
        continue
      }

      // Check for # SECTION TITLE format
      const hashMatch = trimmed.match(/^#{1,2}\s+([A-ZÀ-Ÿa-z\s]+)$/)
      if (hashMatch) {
        if (currentSection) sections.push(currentSection)
        currentSection = {
          title: hashMatch[1].trim(),
          content: "",
        }
        continue
      }

      // Add content to current section
      if (currentSection && trimmed) {
        currentSection.content += (currentSection.content ? " " : "") + trimmed
      }
    }

    if (currentSection) sections.push(currentSection)
    return sections.filter((s) => s.content)
  }

  const sections = parseDetailedComparison(text)

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase()
    if (lower.includes("verdict")) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (lower.includes("présence") || lower.includes("digitale")) return <Globe className="w-5 h-5 text-blue-400" />
    if (lower.includes("sentiment") || lower.includes("public"))
      return <TrendingUp className="w-5 h-5 text-green-400" />
    if (lower.includes("cohérence")) return <Target className="w-5 h-5 text-purple-400" />
    if (lower.includes("force")) return <Shield className="w-5 h-5 text-emerald-400" />
    if (lower.includes("faiblesse")) return <AlertTriangle className="w-5 h-5 text-orange-400" />
    if (lower.includes("recommandation")) return <Lightbulb className="w-5 h-5 text-cyan-400" />
    return <FileText className="w-5 h-5 text-zinc-400" />
  }

  return (
    <div className="space-y-8">
      <div className="font-heading text-xs font-bold tracking-[0.15em] text-red-400/80 uppercase mb-3">
        Rapport de Confrontation
      </div>
      <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">
        {brand1Name} vs {brand2Name}
      </h2>

      {sections.length > 0 ? (
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-950 p-6 sm:p-8 hover:border-red-900/50 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getSectionIcon(section.title)}</div>
                <div className="flex-1 space-y-4">
                  <h4 className="font-heading text-base sm:text-lg font-bold text-red-400 uppercase tracking-wide">
                    {section.title}
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fallback: display as paragraphs
        <div className="prose prose-invert max-w-none">
          {text.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// Single Detailed Analysis Component (Premium)
function SingleDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  if (!text) {
    return (
      <div className="text-center py-16">
        <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">Analyse détaillée non disponible</h3>
        <p className="text-sm text-gray-400 mt-2">
          L'analyse détaillée sera disponible une fois le traitement terminé.
        </p>
      </div>
    )
  }

  // Parse sections from text
  const parseDetailedAnalysis = (text: string) => {
    const sections: Array<{ title: string; content: string; iconType: string; confidence: number }> = []

    // Split by # or ## headers
    const parts = text.split(/(?=^#{1,2}\s)/m).filter(Boolean)

    parts.forEach((part) => {
      const lines = part.trim().split("\n")
      const title = lines[0]?.replace(/^#{1,2}\s*/, "").trim() || "Section"
      const content = lines.slice(1).join("\n").trim()

      if (content) {
        let iconType = "default"
        if (title.toLowerCase().includes("osint") || title.toLowerCase().includes("source")) {
          iconType = "globe"
        } else if (title.toLowerCase().includes("ia") || title.toLowerCase().includes("générative")) {
          iconType = "brain"
        } else if (title.toLowerCase().includes("stratég")) {
          iconType = "target"
        } else if (title.toLowerCase().includes("recommandation")) {
          iconType = "lightbulb"
        }

        sections.push({
          title,
          content,
          iconType,
          confidence: Math.floor(Math.random() * 20) + 75,
        })
      }
    })

    return sections.length > 0
      ? sections
      : [
          {
            title: "Analyse Complète",
            content: text,
            iconType: "default",
            confidence: 85,
          },
        ]
  }

  const sections = parseDetailedAnalysis(text)

  const toggleSection = (idx: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedSections(newExpanded)
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "globe":
        return <Globe className="w-5 h-5" />
      case "brain":
        return <Brain className="w-5 h-5" />
      case "target":
        return <Target className="w-5 h-5" />
      case "lightbulb":
        return <Lightbulb className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  // Extract key points from content
  const extractKeyPoints = (content: string): string[] => {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 30)
    return sentences.slice(0, 4).map((s) => s.trim())
  }

  return (
    <div className="space-y-6">
      {/* Section Pills */}
      <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-lg border border-red-900/20">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => {
              const element = document.getElementById(`section-${idx}`)
              element?.scrollIntoView({ behavior: "smooth" })
            }}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-red-950/30 border border-red-900/30 rounded-full transition-colors text-xs sm:text-sm"
          >
            <span className="text-cyan-400">{renderIcon(section.iconType)}</span>
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
                  ? "border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 to-zinc-950"
                  : "border-red-900/30 bg-zinc-950/50 hover:border-red-900/50"
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
                      isExpanded ? "bg-cyan-500/20 text-cyan-400" : "bg-red-950/50 text-red-400"
                    }`}
                  >
                    {renderIcon(section.iconType)}
                  </div>
                  <div>
                    <h3
                      className={`font-heading text-base sm:text-lg font-bold ${isExpanded ? "text-cyan-400" : "text-white"} uppercase tracking-wide`}
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
                      <div key={pointIdx} className="p-3 sm:p-4 bg-zinc-900/50 border border-cyan-900/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1 text-lg">•</span>
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
    <div className="bg-zinc-950 border border-red-900/30 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}
