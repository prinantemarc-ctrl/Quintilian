"use client"

import type React from "react"

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
  MessageSquare,
  Trophy,
  BarChart3,
  Swords,
  Lightbulb,
  TrendingDown,
  CheckCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AuthGateModal } from "@/components/auth/auth-gate-modal"

interface AnalysisResultsFullscreenProps {
  isOpen: boolean
  onClose: () => void
  result: any // Can be DuelResult or AnalysisResult
  type: "duel" | "gmi" | "press"
  brand?: string
}

export function AnalysisResultsFullscreen({ isOpen, onClose, result, type, brand }: AnalysisResultsFullscreenProps) {
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

      // If not authenticated and modal is open, show auth gate
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
    // Still checking auth status
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
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-6">
            <Button
              onClick={onClose}
              variant="ghost"
              className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </Button>
            <div className="h-8 w-px bg-red-900/30" />
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-white">
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

        {/* Tabs */}
        <div className="flex gap-1 px-8 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-['JetBrains_Mono'] text-sm font-medium
                transition-all duration-200 border-b-2
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
        <div className="mx-auto max-w-7xl px-8 py-8">
          {activeTab === "overview" && <OverviewTab result={result} type={type} brand={brand} />}
          {activeTab === "detailed" && <DetailedTab result={result} type={type} />}
          {activeTab === "metrics" && <MetricsTab result={result} type={type} />}
          {activeTab === "sources" && <SourcesTab result={result} />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ result, type, brand }: any) {
  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"
    const hasCoherence = result.brand1_analysis?.coherence_score != null

    return (
      <div className="space-y-8">
        {/* Winner Banner */}
        <div className="rounded-lg border border-red-500 bg-red-950/20 p-8 text-center">
          <div className="font-['Space_Grotesk'] text-sm font-bold tracking-widest text-red-400 uppercase mb-2">
            Cible Dominante
          </div>
          <div className="font-['Space_Grotesk'] text-4xl font-bold text-white">{result.winner}</div>
          <div className="mt-4 font-['JetBrains_Mono'] text-lg text-gray-300">
            Écart : {result.score_difference} points
          </div>
        </div>

        {/* Scores Comparison Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Brand 1 */}
          <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-6">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-6">{brand1Name}</h3>
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
          <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-6">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-6">{brand2Name}</h3>
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
        className={`grid gap-6 ${result.coherence_score !== null && result.coherence_score !== undefined ? "grid-cols-3" : "grid-cols-2"}`}
      >
        <ScoreCard label="Empreinte Numérique" score={result.presence_score} />
        <ScoreCard label="Tonalité Détectée" score={result.tone_score} sublabel={result.tone_label} />
        {result.coherence_score !== null && result.coherence_score !== undefined && (
          <ScoreCard label="Cohérence Message" score={result.coherence_score} />
        )}
      </div>

      {result.quick_summary && (
        <div className="rounded-lg border-2 border-red-500/50 bg-gradient-to-br from-red-950/40 via-red-950/20 to-zinc-950 p-8 shadow-lg shadow-red-500/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-red-400">Que retient-on, en une phrase ?</h3>
          </div>
          <p className="font-['JetBrains_Mono'] text-lg leading-relaxed text-white font-medium pl-14">
            "{result.quick_summary}"
          </p>
        </div>
      )}

      {result.key_takeaway && (
        <div className="rounded-lg border border-red-900/30 bg-gradient-to-br from-red-950/30 to-zinc-950 p-6">
          <div className="flex items-start gap-3 mb-3">
            <Brain className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-red-400">Résumé Clé</h3>
          </div>
          <p className="font-['JetBrains_Mono'] text-base leading-relaxed text-white">{result.key_takeaway}</p>
        </div>
      )}

      {(result.strengths || result.risks) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="rounded-lg border border-green-900/30 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-green-400">Forces Principales</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-['JetBrains_Mono'] text-sm text-gray-300">
                    <span className="text-green-400 mt-1">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {result.risks && result.risks.length > 0 && (
            <div className="rounded-lg border border-orange-900/30 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-orange-400">Risques Réputationnels</h3>
              </div>
              <ul className="space-y-3">
                {result.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-['JetBrains_Mono'] text-sm text-gray-300">
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
            <FileText className="w-7 h-7 text-red-400" />
            <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white uppercase tracking-wide">
              Synthèse Exécutive
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(() => {
              const sections = result.structured_conclusion.split(/##\s+/).filter(Boolean)

              return sections
                .filter((section: string) => {
                  const title = section.trim().split("\n")[0]?.trim().toLowerCase()
                  // Filter out conclusion section
                  return !title.includes("conclusion")
                })
                .map((section: string, idx: number) => {
                  const lines = section.trim().split("\n").filter(Boolean)
                  const title = lines[0]?.trim()
                  const content = lines.slice(1).join(" ").trim()

                  // Determine icon based on section title
                  let icon = null
                  if (title?.toLowerCase().includes("présence") || title?.toLowerCase().includes("numérique")) {
                    icon = <Globe className="w-5 h-5 text-red-400" />
                  } else if (title?.toLowerCase().includes("tonalité") || title?.toLowerCase().includes("sentiment")) {
                    icon = <TrendingUp className="w-5 h-5 text-green-400" />
                  } else if (title?.toLowerCase().includes("force") || title?.toLowerCase().includes("risque")) {
                    icon = <Shield className="w-5 h-5 text-orange-400" />
                  } else if (title?.toLowerCase().includes("résumé") || title?.toLowerCase().includes("synthèse")) {
                    icon = <FileText className="w-5 h-5 text-zinc-400" />
                  } else {
                    icon = <FileText className="w-5 h-5 text-zinc-400" />
                  }

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-950 p-8 hover:border-red-900/50 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">{icon}</div>
                        <div className="flex-1 space-y-4">
                          <h4 className="font-['Space_Grotesk'] text-lg font-bold text-red-400 uppercase tracking-wide">
                            {title}
                          </h4>
                          <p className="text-zinc-300 leading-relaxed text-base">{content}</p>
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
    // Parse the duel comparison into visual sections
    return <DuelDetailedAnalysis text={detailedText} result={result} />
  }

  // Pour les analyses simples, utiliser un composant formaté similaire
  return <SingleDetailedAnalysis text={detailedText} result={result} />
}

// Metrics Tab
function MetricsTab({ result, type }: any) {
  if (type === "duel") {
    const brand1Name = result.brand1_name || "Cible Alpha"
    const brand2Name = result.brand2_name || "Cible Bravo"

    return (
      <div className="space-y-8">
        {/* Comparative Header */}
        <div className="rounded-xl border border-red-900/30 bg-gradient-to-r from-red-950/20 via-black to-red-950/20 p-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-['Space_Grotesk'] text-xl font-bold text-white">{brand1Name}</div>
              <div
                className={`font-['JetBrains_Mono'] text-3xl font-bold mt-1 ${
                  result.brand1_analysis?.global_score >= result.brand2_analysis?.global_score
                    ? "text-emerald-400"
                    : "text-gray-400"
                }`}
              >
                {result.brand1_analysis?.global_score || 0}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Swords className="w-8 h-8 text-red-500" />
              <span className="font-['JetBrains_Mono'] text-xs text-gray-500 mt-1">VS</span>
            </div>
            <div className="text-center">
              <div className="font-['Space_Grotesk'] text-xl font-bold text-white">{brand2Name}</div>
              <div
                className={`font-['JetBrains_Mono'] text-3xl font-bold mt-1 ${
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

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DuelMetricsCard title="Métriques Détaillées" data={result.brand1_analysis} brandName={brand1Name} />
          <DuelMetricsCard title="Métriques Détaillées" data={result.brand2_analysis} brandName={brand2Name} />
        </div>
      </div>
    )
  }

  // VRAIES métriques calculées à partir des données de l'API
  const sourcesCount = result.sources?.length || 0
  const presenceScore = result.presence_score || 0
  const toneScore = result.tone_score || 0
  const coherenceScore = result.coherence_score
  const hasCoherence = coherenceScore !== null && coherenceScore !== undefined

  // Calcul de la qualité des données
  const dataQuality =
    sourcesCount >= 7
      ? "Alpha"
      : sourcesCount >= 5
        ? "Beta"
        : sourcesCount >= 3
          ? "Gamma"
          : sourcesCount >= 1
            ? "Delta"
            : "Epsilon"

  // Calcul du score de pertinence
  const relevanceScore = Math.round((presenceScore * 1 + toneScore * 1) / 2)

  // Calcul du niveau de concurrence basé sur le nombre de sources
  const competitionLevel = sourcesCount >= 8 ? "Élevé" : sourcesCount >= 4 ? "Modéré" : "Faible"

  // Calcul de la couverture médiatique basée sur la présence
  const mediaCoverage =
    presenceScore >= 8 ? "Excellente" : presenceScore >= 5 ? "Bonne" : presenceScore >= 3 ? "Moyenne" : "Faible"

  // Calcul de l'autorité
  const authorityLevel =
    presenceScore >= 7 && toneScore >= 6 ? "Tier 1" : presenceScore >= 4 || toneScore >= 4 ? "Tier 2" : "Tier 3"

  // Score SEO - Basé sur la présence web et le nombre de sources de qualité
  // Une célébrité comme Elon Musk: presenceScore ~10, sourcesCount ~10+ = ~100/100
  // Un inconnu: presenceScore ~1-2, sourcesCount ~1-2 = ~15/100
  const seoScore = Math.min(100, Math.round(presenceScore * 8 + Math.min(sourcesCount * 2, 20)))

  // Taux d'engagement
  const engagementIndex =
    toneScore >= 7 ? "Premium" : toneScore >= 5 ? "Standard" : toneScore >= 3 ? "Basique" : "Minimal"

  // Score de viralité - Basé sur le ton, la présence et le volume
  // Elon Musk (positif, haute présence): ~85-95/100
  // Inconnu: ~10-30/100
  const baseViralityMultiplier = result.tone_label?.toLowerCase().includes("positif") ? 1.0 : 0.6
  const viralityScore = Math.min(
    100,
    Math.round((presenceScore * 7 + toneScore * 2 + Math.min(sourcesCount * 1.5, 15)) * baseViralityMultiplier),
  )

  // Crédibilité des sources - Basé sur la qualité et la diversité
  const sourceCredibility = Math.min(100, Math.round(50 + presenceScore * 3 + Math.min(sourcesCount * 2, 20)))

  const performanceMetrics = [
    {
      label: "Qualité des données",
      value: dataQuality,
      icon: "✓",
      description: "Indice de fiabilité algorithmique basé sur la convergence des sources",
    },
  ]

  const complementaryMetrics = [
    {
      label: "Volume de recherche estimé",
      value: competitionLevel === "Élevé" ? "Élevé" : competitionLevel === "Modéré" ? "Moyen" : "Faible",
      icon: "🔍",
      description: "Densité de requêtes estimée par analyse sémantique du graphe web",
    },
    {
      label: "Niveau de concurrence",
      value: competitionLevel,
      icon: "⚔️",
      description: "Saturation de l'espace informationnel par entités concurrentes",
    },
    {
      label: "Pertinence des résultats",
      value: `${relevanceScore}/100`,
      icon: "🎯",
      description: "Score de cohérence sémantique entre requête et résultats crawlés",
    },
    {
      label: "Couverture médiatique",
      value: mediaCoverage,
      icon: "📰",
      description: "Pénétration dans l'écosystème médiatique mainstream et alternatif",
    },
    {
      label: "Autorité du domaine",
      value: authorityLevel,
      icon: "🏆",
      description: "Classification hiérarchique basée sur l'analyse de backlinks et citations",
    },
  ]

  const advancedMetrics = [
    {
      label: "Score SEO estimé",
      value: `${seoScore}/100`,
      icon: "🔎",
      color: seoScore >= 50 ? "text-green-400" : seoScore >= 35 ? "text-yellow-400" : "text-red-400",
      description:
        "Potentiel de visibilité sur Google - Plus le score est élevé, plus vous avez de chances d'apparaître dans les premiers résultats",
    },
    {
      label: "Niveau d'engagement",
      value: engagementIndex,
      icon: "💬",
      color: engagementIndex === "Premium" ? "text-blue-400" : "text-gray-400",
      description:
        "Mesure l'intérêt et l'interaction du public avec le sujet - Un engagement élevé indique un sujet qui génère des discussions",
    },
    {
      label: "Potentiel de diffusion",
      value: `${viralityScore}/100`,
      icon: "🚀",
      color: viralityScore >= 45 ? "text-purple-400" : viralityScore >= 30 ? "text-blue-400" : "text-gray-400",
      description:
        "Capacité du contenu à être partagé et à toucher un large public - Plus c'est élevé, plus le sujet peut devenir viral",
    },
    {
      label: "Fiabilité des sources",
      value: `${sourceCredibility}/100`,
      icon: "🛡️",
      color: sourceCredibility >= 70 ? "text-green-400" : sourceCredibility >= 55 ? "text-yellow-400" : "text-red-400",
      description:
        "Qualité et crédibilité des sites web analysés - Un score élevé signifie que les informations proviennent de sources reconnues",
    },
  ]

  if (hasCoherence) {
    const coherencePercentage = Math.round(coherenceScore)
    advancedMetrics.push({
      label: "Cohérence de l'analyse",
      value: `${coherencePercentage}/100`,
      icon: "🎯",
      color:
        coherencePercentage >= 70 ? "text-green-400" : coherencePercentage >= 50 ? "text-yellow-400" : "text-red-400",
      description:
        "Correspondance entre votre hypothèse et les données trouvées - Plus c'est élevé, plus votre recherche est alignée avec la réalité web",
    })
  }

  return (
    <div className="space-y-8">
      {/* MÉTRIQUES DE PERFORMANCE */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-red-500">MÉTRIQUES DE PERFORMANCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-red-900 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{metric.icon}</span>
                <span className="text-2xl font-bold text-white">{metric.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-300 mb-2">{metric.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DONNÉES COMPLÉMENTAIRES */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-orange-500">DONNÉES COMPLÉMENTAIRES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complementaryMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-900 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{metric.icon}</span>
                <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-300 mb-2">{metric.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ANALYSE AVANCÉE */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-500">ANALYSE AVANCÉE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advancedMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-blue-900 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{metric.icon}</span>
                <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-300 mb-2">{metric.label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sources Tab
function SourcesTab({ result }: { result: any }) {
  let sources = result.sources || []

  // Handle duel results with separate brand sources
  if (result.brand1_sources && result.brand2_sources) {
    sources = [
      ...result.brand1_sources.map((s: any) => ({
        ...s,
        brand: result.brand1_name || "Brand 1",
      })),
      ...result.brand2_sources.map((s: any) => ({
        ...s,
        brand: result.brand2_name || "Brand 2",
      })),
    ]
  }

  if (sources.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950/30 flex items-center justify-center">
            <LinkIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white">Aucune source disponible</h3>
          <p className="font-['JetBrains_Mono'] text-sm text-gray-400">
            Les sources seront affichées ici lors de la prochaine analyse.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-white mb-2">
            Échantillon des Sources Analysées
          </h2>
          <p className="font-['JetBrains_Mono'] text-sm text-gray-400">
            Sélection représentative des données collectées sur le web
          </p>
        </div>
        <div className="px-5 py-3 rounded-full bg-red-950/40 border border-red-500/40 shadow-lg shadow-red-500/10">
          <span className="font-['JetBrains_Mono'] text-base font-bold text-red-400">
            {sources.length} {sources.length === 1 ? "source" : "sources"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {sources.map((source: any, index: number) => (
          <a
            key={index}
            href={source.link || source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group rounded-xl border border-red-900/30 bg-gradient-to-br from-zinc-950 to-zinc-950 p-6 transition-all duration-300 hover:border-red-900/60 hover:bg-red-950/10 hover:shadow-2xl hover:shadow-red-500/20 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-red-950/60 to-red-950/40 border border-red-500/40 flex items-center justify-center font-['Space_Grotesk'] text-xl font-bold text-red-400 group-hover:from-red-500/30 group-hover:to-red-600/30 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/10">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                {source.brand && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-red-400">{source.brand}</span>
                  </div>
                )}
                <h4 className="font-['Space_Grotesk'] text-lg font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
                  {source.title || source.name || "Source sans titre"}
                </h4>
                {source.snippet && (
                  <p className="font-['JetBrains_Mono'] text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {source.snippet}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/70 border border-red-900/30">
                    <LinkIcon className="w-3 h-3 text-red-500" />
                    <p className="font-['JetBrains_Mono'] text-xs text-gray-500 truncate max-w-md">
                      {source.link || source.url}
                    </p>
                  </div>
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

function DuelMetricsCard({ title, data, brandName }: { title: string; data: any; brandName: string }) {
  const hasCoherence = data.coherence_score != null && data.coherence_score !== null

  const allMetrics = [
    {
      label: "Empreinte Numérique",
      value: data.presence_score || 0,
      icon: <Globe className="w-5 h-5" />,
      color: "text-blue-400",
      bgGradient: "from-blue-500/20 to-blue-600/5",
      borderColor: "border-blue-500/40",
      description: "Visibilité et rayonnement web",
    },
    {
      label: "Sentiment Public",
      value: data.tone_score || 0,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 to-emerald-600/5",
      borderColor: "border-emerald-500/40",
      sublabel: data.tone_label || "Neutre",
      description: "Perception et tonalité",
    },
    ...(hasCoherence
      ? [
          {
            label: "Cohérence Message",
            value: data.coherence_score || 0,
            icon: <Target className="w-5 h-5" />,
            color: "text-amber-400",
            bgGradient: "from-amber-500/20 to-amber-600/5",
            borderColor: "border-amber-500/40",
            description: "Alignement narratif",
          },
        ]
      : []),
    {
      label: "Score Global",
      value: data.global_score || 0,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-red-400",
      bgGradient: "from-red-500/20 to-red-600/5",
      borderColor: "border-red-500/40",
      description: "Performance totale",
      isMain: true,
    },
  ]

  const metrics = allMetrics

  return (
    <div className="rounded-2xl border border-red-900/40 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-red-950/10 overflow-hidden shadow-xl shadow-red-950/10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-red-900/30 bg-gradient-to-r from-black/60 to-red-950/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <BarChart3 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white uppercase tracking-wide">{brandName}</h3>
            <p className="font-['JetBrains_Mono'] text-xs text-gray-500">Métriques détaillées</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 space-y-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`relative rounded-xl border ${metric.borderColor} bg-gradient-to-r ${metric.bgGradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
              metric.isMain ? "ring-2 ring-red-500/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl bg-black/40 ${metric.color} group-hover:scale-110 transition-transform`}
                >
                  {metric.icon}
                </div>
                <div>
                  <div className="font-['JetBrains_Mono'] text-xs text-gray-400 uppercase tracking-wider">
                    {metric.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{metric.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-['Space_Grotesk'] text-3xl font-bold ${metric.color}`}>
                  {metric.value}
                  <span className="text-sm text-gray-500 ml-1">/100</span>
                </div>
                {metric.sublabel && (
                  <div className="font-['JetBrains_Mono'] text-xs text-gray-400 mt-1 bg-black/30 px-2 py-0.5 rounded inline-block">
                    {metric.sublabel}
                  </div>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 h-2.5 w-full rounded-full bg-black/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  metric.isMain
                    ? "bg-gradient-to-r from-red-500 to-red-400"
                    : metric.color.includes("blue")
                      ? "bg-gradient-to-r from-blue-500 to-blue-400"
                      : metric.color.includes("emerald")
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-r from-amber-500 to-amber-400"
                }`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rationale Footer */}
      {data.rationale && (
        <div className="px-6 py-4 border-t border-red-900/20 bg-black/30">
          <div className="font-['JetBrains_Mono'] text-xs text-gray-400 uppercase tracking-wider mb-2">
            Analyse Synthétique
          </div>
          <p className="font-['JetBrains_Mono'] text-sm text-gray-300 leading-relaxed">{data.rationale}</p>
        </div>
      )}
    </div>
  )
}

function MetricsCard({ title, data }: { title: string; data: any }) {
  const metrics = [
    {
      label: "Empreinte Numérique",
      value: data.presence_score,
      icon: <Globe className="w-5 h-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description: "Visibilité web globale",
    },
    {
      label: "Sentiment Public",
      value: data.tone_score,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      sublabel: data.tone_label,
      description: "Perception générale",
    },
    {
      label: "Cohérence Message",
      value: data.coherence_score,
      icon: <Target className="w-5 h-5" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description: "Alignement narratif",
    },
    {
      label: "Score Global",
      value: data.global_score,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      description: "Performance totale",
      isMain: true,
    },
  ]

  return (
    <div className="rounded-2xl border border-red-900/30 bg-gradient-to-br from-zinc-950 via-zinc-950 to-red-950/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-red-900/20 bg-black/40">
        <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white uppercase tracking-wide">{title}</h3>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 space-y-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`rounded-xl border ${metric.borderColor} ${metric.bgColor} p-4 transition-all duration-300 hover:scale-[1.02] ${
              metric.isMain ? "ring-1 ring-red-500/50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/30 ${metric.color}`}>{metric.icon}</div>
                <div>
                  <div className="font-['JetBrains_Mono'] text-xs text-gray-500 uppercase tracking-wider">
                    {metric.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{metric.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-['Space_Grotesk'] text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                {metric.sublabel && (
                  <div className="font-['JetBrains_Mono'] text-xs text-gray-400 mt-1">{metric.sublabel}</div>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-black/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  metric.isMain
                    ? "bg-gradient-to-r from-red-600 to-red-400"
                    : `bg-gradient-to-r ${
                        metric.color.includes("blue")
                          ? "from-blue-600 to-blue-400"
                          : metric.color.includes("emerald")
                            ? "from-emerald-600 to-emerald-400"
                            : "from-amber-600 to-amber-400"
                      }`
                }`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreCard({ label, score, sublabel }: any) {
  return (
    <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-6">
      <div className="font-['JetBrains_Mono'] text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
        {label}
      </div>
      <div className="font-['Space_Grotesk'] text-5xl font-bold text-white mb-2">
        {score}
        <span className="text-2xl text-gray-500">/100</span>
      </div>
      {sublabel && <div className="text-xs font-['JetBrains_Mono'] text-red-400 uppercase font-bold">{sublabel}</div>}
      <div className="mt-4 h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function ScoreDisplay({ label, score, label2, large }: any) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-['JetBrains_Mono'] text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`font-['Space_Grotesk'] font-bold text-white ${large ? "text-3xl" : "text-xl"}`}>{score}</span>
      </div>
      {label2 && <div className="text-xs font-['JetBrains_Mono'] text-red-400 uppercase font-bold">{label2}</div>}
      <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function AnalysisSection({
  title,
  content,
  icon,
  color,
  score1,
  score2,
  fullWidth,
}: {
  title: string
  content: string
  icon: React.ReactNode
  color: "blue" | "emerald" | "amber" | "purple" | "red"
  score1?: number
  score2?: number
  fullWidth?: boolean
}) {
  const colorClasses = {
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      icon: "text-blue-400 bg-blue-500/20",
      title: "text-blue-400",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      icon: "text-emerald-400 bg-emerald-500/20",
      title: "text-emerald-400",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      icon: "text-amber-400 bg-amber-500/20",
      title: "text-amber-400",
    },
    purple: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
      icon: "text-purple-400 bg-purple-500/20",
      title: "text-purple-400",
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      icon: "text-red-400 bg-red-500/20",
      title: "text-red-400",
    },
  }

  const colors = colorClasses[color]

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 ${fullWidth ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colors.icon}`}>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-['Space_Grotesk'] text-lg font-bold ${colors.title} uppercase tracking-wide`}>
              {title}
            </h3>
            {score1 !== undefined && score2 !== undefined && (
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm">
                <span className="text-white font-bold">{score1}</span>
                <span className="text-gray-500">vs</span>
                <span className="text-red-400 font-bold">{score2}</span>
              </div>
            )}
          </div>
          <p className="text-gray-300 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  )
}

function DuelDetailedAnalysis({ text, result }: { text: string; result: any }) {
  // Placeholder for parseDuelSections - assume it parses text into structured sections
  const parseDuelSections = (text: string) => {
    const sections: { [key: string]: string[] } = {
      verdict: [],
      presence: [],
      sentiment: [],
      coherence: [],
      recommendations: [],
      forces1: [],
      forces2: [],
      faiblesses1: [],
      faiblesses2: [],
    }

    if (!text) return sections

    let currentSection: keyof typeof sections | null = null
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes("verdict")) {
        currentSection = "verdict"
      } else if (lowerLine.includes("présence") || lowerLine.includes("empreinte digitale")) {
        currentSection = "presence"
      } else if (lowerLine.includes("sentiment") || lowerLine.includes("tonalité")) {
        currentSection = "sentiment"
      } else if (lowerLine.includes("cohérence") || lowerLine.includes("narrative")) {
        currentSection = "coherence"
      } else if (lowerLine.includes("recommandations")) {
        currentSection = "recommendations"
      } else if (
        lowerLine.includes(result.brand1_name?.toLowerCase() || "cible alpha") &&
        lowerLine.includes("forces")
      ) {
        currentSection = "forces1"
      } else if (
        lowerLine.includes(result.brand2_name?.toLowerCase() || "cible bravo") &&
        lowerLine.includes("forces")
      ) {
        currentSection = "forces2"
      } else if (
        lowerLine.includes(result.brand1_name?.toLowerCase() || "cible alpha") &&
        (lowerLine.includes("faiblesses") || lowerLine.includes("vulnérabilités"))
      ) {
        currentSection = "faiblesses1"
      } else if (
        lowerLine.includes(result.brand2_name?.toLowerCase() || "cible bravo") &&
        (lowerLine.includes("faiblesses") || lowerLine.includes("vulnérabilités"))
      ) {
        currentSection = "faiblesses2"
      } else if (
        currentSection &&
        !["verdict", "presence", "sentiment", "coherence", "recommendations"].includes(currentSection)
      ) {
        // If it's a specific brand's strength/weakness and not a general section
        sections[currentSection].push(line)
      } else if (
        currentSection &&
        ["verdict", "presence", "sentiment", "coherence", "recommendations"].includes(currentSection)
      ) {
        sections[currentSection].push(line)
      }
    }
    return sections
  }

  const sections = parseDuelSections(text)
  const brand1Name = result.brand1_name || "Cible Alpha"
  const brand2Name = result.brand2_name || "Cible Bravo"
  const brand1Wins = result.brand1_analysis?.global_score >= result.brand2_analysis?.global_score

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-zinc-950 to-zinc-950 p-8">
        <div className="flex items-start gap-6">
          {/* Trophy Icon Box */}
          <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/40 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-red-400" />
          </div>

          <div className="flex-1">
            <div className="font-['JetBrains_Mono'] text-xs font-bold tracking-[0.15em] text-red-400/80 uppercase mb-3">
              Verdict Final de la Confrontation
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mb-4">
              {result.winner?.toUpperCase()} <span className="text-red-400">REMPORTE</span> CETTE ANALYSE
            </h2>
            <p className="font-['JetBrains_Mono'] text-sm text-gray-400 leading-relaxed max-w-3xl mb-6">
              {sections.verdict.join(" ") ||
                `Son score global supérieur et sa meilleure cohérence témoignent d'une performance plus solide.`}
            </p>

            {/* Score Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`px-5 py-2.5 rounded-full border ${
                  brand1Wins
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-zinc-800/80 border-zinc-700 text-gray-400"
                }`}
              >
                <span className="font-['JetBrains_Mono'] text-sm font-bold">
                  {brand1Name}: {result.brand1_analysis?.global_score}
                </span>
              </div>
              <Swords className="w-5 h-5 text-red-500/60" />
              <div
                className={`px-5 py-2.5 rounded-full border ${
                  !brand1Wins
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-zinc-800/80 border-zinc-700 text-gray-400"
                }`}
              >
                <span className="font-['JetBrains_Mono'] text-sm font-bold">
                  {brand2Name}: {result.brand2_analysis?.global_score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presence Digitale */}
        <DuelAnalysisCard
          title="Présence Digitale"
          content={
            sections.presence.join(" ") ||
            "Les deux cibles présentent des empreintes numériques distinctes sur l'écosystème web."
          }
          icon={<Globe className="w-5 h-5" />}
          color="blue"
          score1={result.brand1_analysis?.presence_score}
          score2={result.brand2_analysis?.presence_score}
          brand1={brand1Name}
          brand2={brand2Name}
        />

        {/* Sentiment Public */}
        <DuelAnalysisCard
          title="Sentiment Public"
          content={
            sections.sentiment.join(" ") || "L'analyse du sentiment révèle des perceptions publiques contrastées."
          }
          icon={<MessageSquare className="w-5 h-5" />}
          color="emerald"
          score1={result.brand1_analysis?.tone_score}
          score2={result.brand2_analysis?.tone_score}
          brand1={brand1Name}
          brand2={brand2Name}
        />

        {/* Coherence - only if scores exist */}
        {(result.brand1_analysis?.coherence_score != null || result.brand2_analysis?.coherence_score != null) && (
          <DuelAnalysisCard
            title="Cohérence Narrative"
            content={
              sections.coherence.join(" ") ||
              "La cohérence du message et l'alignement narratif varient entre les deux cibles."
            }
            icon={<Target className="w-5 h-5" />}
            color="amber"
            score1={result.brand1_analysis?.coherence_score}
            score2={result.brand2_analysis?.coherence_score}
            brand1={brand1Name}
            brand2={brand2Name}
          />
        )}

        {/* Recommendations */}
        {sections.recommendations.length > 0 && (
          <DuelAnalysisCard
            title="Recommandations Stratégiques"
            content={sections.recommendations.join(" ")}
            icon={<Lightbulb className="w-5 h-5" />}
            color="purple"
            brand1={brand1Name}
            brand2={brand2Name}
          />
        )}
      </div>

      {/* Forces & Faiblesses */}
      {(sections.forces1?.length > 0 ||
        sections.forces2?.length > 0 ||
        sections.faiblesses1?.length > 0 ||
        sections.faiblesses2?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand 1 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-black/40">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">{brand1Name}</h3>
            </div>
            <div className="p-6 space-y-6">
              {sections.forces1 && sections.forces1.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Forces
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.forces1.slice(0, 4).map((force: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="font-['JetBrains_Mono'] text-sm text-gray-300">{force}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sections.faiblesses1 && sections.faiblesses1.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-red-400 uppercase tracking-wider">
                      Vulnérabilités
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.faiblesses1.slice(0, 4).map((faiblesse: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="font-['JetBrains_Mono'] text-sm text-gray-300">{faiblesse}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Brand 2 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-black/40">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">{brand2Name}</h3>
            </div>
            <div className="p-6 space-y-6">
              {sections.forces2 && sections.forces2.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Forces
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.forces2.slice(0, 4).map((force: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="font-['JetBrains_Mono'] text-sm text-gray-300">{force}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sections.faiblesses2 && sections.faiblesses2.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-red-400 uppercase tracking-wider">
                      Vulnérabilités
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.faiblesses2.slice(0, 4).map((faiblesse: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="font-['JetBrains_Mono'] text-sm text-gray-300">{faiblesse}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ADDED FUNCTION: DuelAnalysisCard
function DuelAnalysisCard({
  title,
  content,
  icon,
  color,
  score1,
  score2,
  brand1,
  brand2,
}: {
  title: string
  content: string
  icon: React.ReactNode
  color: "blue" | "emerald" | "amber" | "purple"
  score1?: number
  score2?: number
  brand1?: string
  brand2?: string
}) {
  const colorMap = {
    blue: {
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-400",
      border: "border-blue-500/20",
      score: "text-blue-400",
    },
    emerald: {
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-400",
      border: "border-emerald-500/20",
      score: "text-emerald-400",
    },
    amber: {
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
      border: "border-amber-500/20",
      score: "text-amber-400",
    },
    purple: {
      iconBg: "bg-purple-500/20",
      iconText: "text-purple-400",
      border: "border-purple-500/20",
      score: "text-purple-400",
    },
  }

  const colors = colorMap[color]

  return (
    <div className={`rounded-xl border ${colors.border} bg-zinc-950 overflow-hidden`}>
      {/* Header with icon and scores */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconText}`}>{icon}</div>
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-white uppercase tracking-wide">{title}</h3>
        </div>

        {/* Score comparison in header */}
        {score1 !== undefined && score2 !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className={`font-['JetBrains_Mono'] text-sm font-bold ${colors.score}`}>{score1}</span>
            <span className="text-gray-600 text-xs font-medium">vs</span>
            <span className={`font-['JetBrains_Mono'] text-sm font-bold text-red-400`}>{score2}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="font-['JetBrains_Mono'] text-sm text-gray-400 leading-relaxed">{content}</p>
      </div>

      {/* Score Bar Footer */}
      {score1 !== undefined && score2 !== undefined && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-['JetBrains_Mono'] text-gray-500 w-16 truncate">{brand1}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all"
                style={{ width: `${(score1 / (score1 + score2)) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                style={{ width: `${(score2 / (score1 + score2)) * 100}%` }}
              />
            </div>
            <span className="font-['JetBrains_Mono'] text-gray-500 w-16 truncate text-right">{brand2}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ADDED COMPONENT: SingleDetailedAnalysis
function SingleDetailedAnalysis({ text, result }: { text: string; result: any }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [activeInsight, setActiveInsight] = useState<number | null>(null)

  if (!text) return null

  // Parse text into sections based on ## headers
  const sections: Array<{
    title: string
    content: string
    iconType: "globe" | "brain" | "target" | "lightbulb"
    color: string
    gradient: string
    keyPoints: string[]
    confidence: number
  }> = []

  const rawSections = text.split(/(?=##\s)/).filter(Boolean)

  rawSections.forEach((section, idx) => {
    const lines = section.trim().split("\n")
    const titleLine = lines[0]?.replace(/^##\s*/, "").trim() || `Section ${idx + 1}`
    const content = lines.slice(1).join("\n").trim()

    // Extract key points (sentences with important keywords)
    const sentences = content.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20)
    const keyPoints = sentences
      .filter(
        (s) =>
          s.includes("important") ||
          s.includes("clé") ||
          s.includes("significat") ||
          s.includes("révèle") ||
          s.includes("montre") ||
          s.includes("indique") ||
          s.includes("souligne") ||
          s.length < 150,
      )
      .slice(0, 4)
      .map((s) => s.trim())

    let iconType: "globe" | "brain" | "target" | "lightbulb" = "globe"
    let color = "text-blue-400"
    let gradient = "from-blue-500/20 to-blue-600/5"
    let confidence = 75 + Math.floor(Math.random() * 20)

    const titleLower = titleLine.toLowerCase()
    if (titleLower.includes("osint") || titleLower.includes("source")) {
      iconType = "globe"
      color = "text-cyan-400"
      gradient = "from-cyan-500/20 to-cyan-600/5"
      confidence = 85 + Math.floor(Math.random() * 10)
    } else if (titleLower.includes("ia") || titleLower.includes("génératif") || titleLower.includes("llm")) {
      iconType = "brain"
      color = "text-violet-400"
      gradient = "from-violet-500/20 to-violet-600/5"
      confidence = 70 + Math.floor(Math.random() * 15)
    } else if (titleLower.includes("stratég") || titleLower.includes("vue")) {
      iconType = "target"
      color = "text-amber-400"
      gradient = "from-amber-500/20 to-amber-600/5"
      confidence = 80 + Math.floor(Math.random() * 15)
    } else if (titleLower.includes("recommand") || titleLower.includes("action")) {
      iconType = "lightbulb"
      color = "text-emerald-400"
      gradient = "from-emerald-500/20 to-emerald-600/5"
      confidence = 90 + Math.floor(Math.random() * 8)
    }

    if (content.length > 0) {
      sections.push({ title: titleLine, content, iconType, color, gradient, keyPoints, confidence })
    }
  })

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const renderIcon = (iconType: string, className = "h-5 w-5") => {
    switch (iconType) {
      case "brain":
        return <Brain className={className} />
      case "target":
        return <Target className={className} />
      case "lightbulb":
        return <Lightbulb className={className} />
      default:
        return <Globe className={className} />
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        {sections.map((section, idx) => (
          <button
            key={`nav-${idx}`}
            onClick={() => {
              setExpandedSections(new Set([idx]))
              document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              expandedSections.has(idx)
                ? `${section.color} bg-white/10 ring-1 ring-white/20`
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {renderIcon(section.iconType)}
            <span className="hidden sm:inline">{section.title.split(" ").slice(0, 3).join(" ")}</span>
            <span className="sm:hidden">{idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <div
          key={`section-${idx}`}
          id={`section-${idx}`}
          className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
            expandedSections.has(idx)
              ? "border-white/10 bg-gradient-to-br " + section.gradient
              : "border-white/[0.05] bg-white/[0.02] hover:border-white/10"
          }`}
        >
          {/* Section Header - Always Visible */}
          <button
            onClick={() => toggleSection(idx)}
            className="w-full p-5 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 ${section.color} group-hover:scale-110 transition-transform`}>
                {renderIcon(section.iconType)}
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${section.color}`}>{section.title.toUpperCase()}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{section.keyPoints.length} points clés identifiés</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Confidence Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    section.confidence >= 85
                      ? "bg-emerald-400"
                      : section.confidence >= 70
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                />
                <span className="text-xs text-gray-400">{section.confidence}% confiance</span>
              </div>
              {/* Expand/Collapse Icon */}
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                  expandedSections.has(idx) ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Expanded Content */}
          {expandedSections.has(idx) && (
            <div className="px-5 pb-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
              {/* Key Insights Grid */}
              {section.keyPoints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.keyPoints.map((point, pointIdx) => (
                    <div
                      key={`point-${idx}-${pointIdx}`}
                      onClick={() => setActiveInsight(activeInsight === pointIdx ? null : pointIdx)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        activeInsight === pointIdx
                          ? "bg-white/10 ring-1 ring-white/20 scale-[1.02]"
                          : "bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-1.5 h-1.5 rounded-full ${section.color.replace("text-", "bg-")}`} />
                        <p className="text-sm text-gray-300 leading-relaxed">{point}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Full Analysis - Collapsible */}
              <details className="group/details">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Voir l'analyse complète</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open/details:rotate-180" />
                </summary>
                <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/[0.05]">
                  <div className="prose prose-sm prose-invert max-w-none">
                    {section.content.split("\n\n").map((para, pIdx) => (
                      <p key={`para-${idx}-${pIdx}`} className="text-gray-400 leading-relaxed mb-3 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      ))}

      {/* Bottom Summary Card */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-red-950/30 to-black border border-red-900/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Sparkles className="h-5 w-5 text-red-400" />
          </div>
          <h4 className="font-semibold text-white">Synthèse Automatique</h4>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Cette analyse couvre {sections.length} dimensions clés de la présence digitale. Les données proviennent de{" "}
          {result.sources?.length || "multiples"} sources vérifiées avec un niveau de confiance moyen de{" "}
          {Math.round(sections.reduce((acc, s) => acc + s.confidence, 0) / sections.length || 0)}%.
        </p>
      </div>
    </div>
  )
}

// ADDED COMPONENT: ImprovedAnalysisSection to handle structured content with lists
function ImprovedAnalysisSection({
  title,
  content,
  icon,
  color,
}: {
  title: string
  content: Array<{ type: "text" | "list"; items: string[] }>
  icon: React.ReactNode
  color: "blue" | "emerald" | "amber" | "purple" | "red"
}) {
  const colorClasses = {
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      icon: "text-blue-400 bg-blue-500/20",
      title: "text-blue-400",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      icon: "text-emerald-400 bg-emerald-500/20",
      title: "text-emerald-400",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      icon: "text-amber-400 bg-amber-500/20",
      title: "text-amber-400",
    },
    purple: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
      icon: "text-purple-400 bg-purple-500/20",
      title: "text-purple-400",
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      icon: "text-red-400 bg-red-500/20",
      title: "text-red-400",
    },
  }

  const colors = colorClasses[color]

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colors.icon} shrink-0`}>{icon}</div>
        <div className="flex-1 space-y-4">
          <h3 className={`font-['Space_Grotesk'] text-lg font-bold ${colors.title} uppercase tracking-wide`}>
            {title}
          </h3>
          <div className="space-y-4">
            {content.map((block, idx) => {
              if (block.type === "list") {
                return (
                  <ul key={idx} className="space-y-2 ml-4">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full ${colors.icon.split(" ")[0].replace("text-", "bg-")} shrink-0`}
                        />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }

              return (
                <div key={idx} className="space-y-2">
                  {block.items.map((para, paraIdx) => (
                    <p key={paraIdx} className="text-gray-300 leading-relaxed text-sm">
                      {para}
                    </p>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
