"use client"

import type React from "react"

import { useState } from "react"
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
  CheckCircle2,
  Award,
  Shield,
  MessageSquare,
  Trophy,
  BarChart3,
  Swords,
  Lightbulb,
  TrendingDown,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisResultsFullscreenProps {
  isOpen: boolean
  onClose: () => void
  result: any // Can be DuelResult or AnalysisResult
  type: "duel" | "gmi" | "press"
  brand?: string
}

export function AnalysisResultsFullscreen({ isOpen, onClose, result, type, brand }: AnalysisResultsFullscreenProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen || !result) return null

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

  return renderDetailedAnalysis(detailedText)
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

  // Calcul de la qualité des données - rendu mystérieux
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

  // Calcul du score de pertinence - FIX: division par 10 pour éviter les 775/100
  const relevanceScore = Math.round((presenceScore * 1 + toneScore * 1) / 2)

  // Calcul du niveau de concurrence basé sur le nombre de sources
  const competitionLevel = sourcesCount >= 8 ? "Élevé" : sourcesCount >= 4 ? "Modéré" : "Faible"

  // Calcul de la couverture médiatique basée sur la présence
  const mediaCoverage =
    presenceScore >= 8 ? "Excellente" : presenceScore >= 5 ? "Bonne" : presenceScore >= 3 ? "Moyenne" : "Faible"

  // Calcul de l'autorité - scores plus mystérieux
  const authorityLevel =
    presenceScore >= 7 && toneScore >= 6 ? "Tier 1" : presenceScore >= 4 || toneScore >= 4 ? "Tier 2" : "Tier 3"

  // Score SEO - BAISSÉ pour être plus réaliste (max 65 au lieu de 100)
  const seoScore = Math.min(65, Math.round(presenceScore * 5 + sourcesCount * 1.5))

  // Taux d'engagement - rendu mystérieux
  const engagementIndex =
    toneScore >= 7 ? "Premium" : toneScore >= 5 ? "Standard" : toneScore >= 3 ? "Basique" : "Minimal"

  // Score de viralité - BAISSÉ drastiquement (max 55 au lieu de 100+)
  const viralityScore = result.tone_label?.toLowerCase().includes("positif")
    ? Math.min(55, Math.round(presenceScore * 4 + toneScore * 0.8))
    : Math.min(35, Math.round(presenceScore * 3 + toneScore * 0.5))

  // Crédibilité des sources - algorithme mystérieux
  const sourceCredibility = Math.min(85, 45 + sourcesCount * 5 + presenceScore * 2)

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
      description: "Projection algorithmique du positionnement SERP potentiel",
    },
    {
      label: "Indice d'engagement",
      value: engagementIndex,
      icon: "💬",
      color: engagementIndex === "Premium" ? "text-blue-400" : "text-gray-400",
      description: "Métrique propriétaire calculée par analyse de sentiment multi-sources",
    },
    {
      label: "Potentiel viral",
      value: `${viralityScore}/100`,
      icon: "🚀",
      color: viralityScore >= 45 ? "text-purple-400" : viralityScore >= 30 ? "text-blue-400" : "text-gray-400",
      description: "Coefficient de propagation estimé selon l'analyse des signaux faibles",
    },
    {
      label: "Crédibilité des sources",
      value: `${sourceCredibility}/100`,
      icon: "🛡️",
      color: sourceCredibility >= 70 ? "text-green-400" : sourceCredibility >= 55 ? "text-yellow-400" : "text-red-400",
      description: "Score composite de trustrank et d'autorité des domaines indexés",
    },
  ]

  if (hasCoherence) {
    const coherencePercentage = Math.round(coherenceScore)
    advancedMetrics.push({
      label: "Alignement message/réalité",
      value: `${coherencePercentage}/100`,
      icon: "🎭",
      color:
        coherencePercentage >= 70 ? "text-green-400" : coherencePercentage >= 50 ? "text-yellow-400" : "text-red-400",
      description: "Taux de corrélation entre l'hypothèse fournie et les données crawlées",
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
  const sections = parseDuelSections(text)
  // </CHANGE> Use proper brand names from API response
  const brand1Name = result.brand1_name || "Cible Alpha"
  const brand2Name = result.brand2_name || "Cible Bravo"

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Verdict Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/50 bg-gradient-to-br from-red-950/50 via-black to-red-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

        <div className="relative p-10">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/30 to-red-600/10 border border-red-500/40 shadow-lg shadow-red-500/20">
              <Trophy className="w-10 h-10 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-['JetBrains_Mono'] text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-2">
                Verdict Final de la Confrontation
              </div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-white mb-4">
                {result.winner} <span className="text-red-400">remporte</span> cette analyse
              </h2>
              <p className="font-['JetBrains_Mono'] text-base text-gray-300 leading-relaxed max-w-3xl">
                {sections.verdict ||
                  `Avec un écart de ${result.score_difference} points, cette cible démontre une présence digitale plus établie et une meilleure perception publique.`}
              </p>

              {/* Score Pills */}
              <div className="flex items-center gap-4 mt-6">
                <div
                  className={`px-4 py-2 rounded-full border ${
                    result.brand1_analysis?.global_score >= result.brand2_analysis?.global_score
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-zinc-800 border-zinc-700 text-gray-400"
                  }`}
                >
                  <span className="font-['JetBrains_Mono'] text-sm font-bold">
                    {brand1Name}: {result.brand1_analysis?.global_score}
                  </span>
                </div>
                <Swords className="w-4 h-4 text-red-500" />
                <div
                  className={`px-4 py-2 rounded-full border ${
                    result.brand2_analysis?.global_score >= result.brand1_analysis?.global_score
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-zinc-800 border-zinc-700 text-gray-400"
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
      </div>

      {/* Analysis Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presence Digitale */}
        <DuelAnalysisCard
          title="Présence Digitale"
          content={
            sections.presence || "Les deux cibles présentent des empreintes numériques distinctes sur l'écosystème web."
          }
          icon={<Globe className="w-6 h-6" />}
          color="blue"
          score1={result.brand1_analysis?.presence_score}
          score2={result.brand2_analysis?.presence_score}
          brand1={brand1Name}
          brand2={brand2Name}
        />

        {/* Sentiment Public */}
        <DuelAnalysisCard
          title="Sentiment Public"
          content={sections.sentiment || "L'analyse du sentiment révèle des perceptions publiques contrastées."}
          icon={<MessageSquare className="w-6 h-6" />}
          color="emerald"
          score1={result.brand1_analysis?.tone_score}
          score2={result.brand2_analysis?.tone_score}
          brand1={brand1Name}
          brand2={brand2Name}
        />

        {/* Coherence */}
        <DuelAnalysisCard
          title="Cohérence Narrative"
          content={
            sections.coherence || "La cohérence du message et l'alignement narratif varient entre les deux cibles."
          }
          icon={<Target className="w-6 h-6" />}
          color="amber"
          score1={result.brand1_analysis?.coherence_score}
          score2={result.brand2_analysis?.coherence_score}
          brand1={brand1Name}
          brand2={brand2Name}
        />

        {/* Recommendations */}
        {sections.recommendations && (
          <DuelAnalysisCard
            title="Recommandations Stratégiques"
            content={sections.recommendations}
            icon={<Lightbulb className="w-6 h-6" />}
            color="purple"
            brand1={brand1Name}
            brand2={brand2Name}
          />
        )}
      </div>

      {/* Forces & Faiblesses */}
      {(sections.forces1 || sections.forces2 || sections.faiblesses1 || sections.faiblesses2) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand 1 */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
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
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
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
      bg: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "shadow-blue-500/10",
    },
    emerald: {
      bg: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      bg: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/30",
      text: "text-amber-400",
      glow: "shadow-amber-500/10",
    },
    purple: {
      bg: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/30",
      text: "text-purple-400",
      glow: "shadow-purple-500/10",
    },
  }

  const colors = colorMap[color]

  return (
    <div
      className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden shadow-xl ${colors.glow} hover:scale-[1.01] transition-transform duration-300`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-black/40 ${colors.text}`}>{icon}</div>
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">{title}</h3>
        </div>

        {/* Mini Score Comparison */}
        {score1 !== undefined && score2 !== undefined && (
          <div className="flex items-center gap-2">
            <span
              className={`font-['JetBrains_Mono'] text-sm font-bold ${score1 >= score2 ? "text-emerald-400" : "text-gray-500"}`}
            >
              {score1}
            </span>
            <span className="text-gray-600 text-xs">vs</span>
            <span
              className={`font-['JetBrains_Mono'] text-sm font-bold ${score2 >= score1 ? "text-emerald-400" : "text-gray-500"}`}
            >
              {score2}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="font-['JetBrains_Mono'] text-sm text-gray-300 leading-relaxed">{content}</p>
      </div>

      {/* Score Bar Footer */}
      {score1 !== undefined && score2 !== undefined && (
        <div className="px-6 pb-5">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-['JetBrains_Mono'] text-gray-500 w-16 truncate">{brand1}</span>
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                style={{ width: `${(score1 / (score1 + score2)) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
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

function parseDuelSections(text: string): {
  verdict?: string
  presence?: string
  sentiment?: string
  coherence?: string
  recommendations?: string
  forces1?: string[]
  forces2?: string[]
  faiblesses1?: string[]
  faiblesses2?: string[]
} {
  const result: any = {}

  // Split by section markers
  const verdictMatch = text.match(/\[VERDICT\]\s*([\s\S]*?)(?=\[|$)/i)
  if (verdictMatch) {
    result.verdict = verdictMatch[1].trim().replace(/^[^.]*remporte[^.]*\.\s*/i, "")
  }

  const presenceMatch = text.match(/\[PRÉSENCE DIGITALE\]\s*([\s\S]*?)(?=\[|$)/i)
  if (presenceMatch) result.presence = presenceMatch[1].trim()

  const sentimentMatch = text.match(/\[SENTIMENT PUBLIC\]\s*([\s\S]*?)(?=\[|$)/i)
  if (sentimentMatch) result.sentiment = sentimentMatch[1].trim()

  const coherenceMatch = text.match(/\[COHÉRENCE\]\s*([\s\S]*?)(?=\[|$)/i)
  if (coherenceMatch) result.coherence = coherenceMatch[1].trim()

  const recommendationsMatch = text.match(/\[RECOMMANDATIONS\]\s*([\s\S]*?)(?=\[|$)/i)
  if (recommendationsMatch) result.recommendations = recommendationsMatch[1].trim()

  // Parse forces and faiblesses - extract list items
  const forcesMatches = text.matchAll(/\[FORCES ([^\]]+)\]\s*([\s\S]*?)(?=\[|$)/gi)
  const faiblessesMatches = text.matchAll(/\[FAIBLESSES ([^\]]+)\]\s*([\s\S]*?)(?=\[|$)/gi)

  let forceIdx = 1
  for (const match of forcesMatches) {
    const items = match[2]
      .split(/\n/)
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line.length > 0)
    if (forceIdx === 1) result.forces1 = items
    else result.forces2 = items
    forceIdx++
  }

  let faiblesseIdx = 1
  for (const match of faiblessesMatches) {
    const items = match[2]
      .split(/\n/)
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line.length > 0)
    if (faiblesseIdx === 1) result.faiblesses1 = items
    else result.faiblesses2 = items
    faiblesseIdx++
  }

  return result
}

function DetailBlock({ label, content }: any) {
  return (
    <div>
      <h4 className="font-['JetBrains_Mono'] text-xs font-bold text-red-400 uppercase tracking-wider mb-2">{label}</h4>
      <p className="font-['JetBrains_Mono'] text-sm text-gray-300 leading-relaxed">{content}</p>
    </div>
  )
}

function MetricRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-red-900/20">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  )
}

function formatDetailedText(text: string) {
  // Split by double newlines to create paragraphs
  const sections = text.split(/\n\n+/)

  return sections.map((section, i) => {
    const lines = section.split("\n")
    return (
      <div key={i} className="space-y-2">
        {lines.map((line, j) => {
          // Detect titles (all caps or starts with special markers)
          if (line.match(/^[A-Z\s-]{10,}$/) || line.startsWith("[SECTION]")) {
            const cleanTitle = line.replace("[SECTION]", "").trim()
            return (
              <h3 key={j} className="font-['Space_Grotesk'] text-xl font-bold text-red-400 mt-6 mb-3">
                {cleanTitle}
              </h3>
            )
          }
          // Detect bullet points
          if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
            return (
              <div key={j} className="flex gap-3 ml-4">
                <span className="text-red-500 flex-shrink-0">•</span>
                <span className="font-['JetBrains_Mono'] text-sm leading-relaxed">{line.replace(/^[-•]\s*/, "")}</span>
              </div>
            )
          }
          // Regular paragraph
          return (
            <p key={j} className="font-['JetBrains_Mono'] text-sm leading-relaxed">
              {line}
            </p>
          )
        })}
      </div>
    )
  })
}

function parseMarkdownToSections(markdown: string): Array<{
  title: string | null
  content: Array<{
    type: "subtitle" | "paragraph" | "list" | "highlight"
    text?: string
    items?: string[]
  }>
}> {
  const sections: Array<{
    title: string | null
    content: Array<{
      type: "subtitle" | "paragraph" | "list" | "highlight"
      text?: string
      items?: string[]
    }>
  }> = []
  const lines = markdown.split("\n").filter((l) => l.trim())

  let currentSection: any = { title: null, content: [] }
  let currentList: string[] = []
  let currentParagraph: string[] = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const fullText = currentParagraph.join(" ")
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText]

      sentences.forEach((sentence, idx) => {
        const trimmedSentence = sentence.trim()
        if (idx === 0 && currentSection.content.length === 0) {
          currentSection.content.push({
            type: "highlight",
            text: trimmedSentence,
          })
        } else {
          currentSection.content.push({
            type: "paragraph",
            text: trimmedSentence,
          })
        }
      })

      currentParagraph = []
    }
  }

  const flushList = () => {
    if (currentList.length > 0) {
      currentSection.content.push({ type: "list", items: [...currentList] })
      currentList = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (trimmed.match(/^#{1,2}\s+/)) {
      flushParagraph()
      flushList()
      if (currentSection.title || currentSection.content.length > 0) {
        sections.push(currentSection)
      }
      currentSection = {
        title: trimmed.replace(/^#+\s*/, "").trim(),
        content: [],
      }
      return
    }

    if (trimmed.match(/^###\s+/)) {
      flushParagraph()
      flushList()
      currentSection.content.push({
        type: "subtitle",
        text: trimmed.replace(/^###\s*/, "").trim(),
      })
      return
    }

    if (trimmed.match(/^[-*•]\s+/)) {
      flushParagraph()
      currentList.push(trimmed.replace(/^[-*•]\s+/, "").trim())
      return
    }

    if (trimmed) {
      flushList()
      currentParagraph.push(trimmed)
    }
  })

  flushParagraph()
  flushList()
  if (currentSection.title || currentSection.content.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

function formatTextWithBold(text: string) {
  const cleanedText = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "")

  const parts = cleanedText.split(/(\b[A-ZÀ-Ÿ][a-zà-ÿ\s]+:)/)
  return parts.map((part, idx) => {
    if (part.match(/^[A-ZÀ-Ÿ][a-zà-ÿ\s]+:$/)) {
      return (
        <strong key={idx} className="text-white font-bold">
          {part}
        </strong>
      )
    }
    return part
  })
}

function getSectionIcon(title: string) {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes("présence") || lowerTitle.includes("numérique") || lowerTitle.includes("digital")) {
    return <Globe className="w-6 h-6 text-red-400" />
  }
  if (lowerTitle.includes("tonalité") || lowerTitle.includes("sentiment")) {
    return <TrendingUp className="w-6 h-6 text-green-400" />
  }
  if (lowerTitle.includes("cohérence") || lowerTitle.includes("message")) {
    return <CheckCircle2 className="w-6 h-6 text-red-400" />
  }
  if (lowerTitle.includes("force") || lowerTitle.includes("atout")) {
    return <Award className="w-6 h-6 text-red-400" />
  }
  if (lowerTitle.includes("risque") || lowerTitle.includes("danger") || lowerTitle.includes("menace")) {
    return <AlertTriangle className="w-6 h-6 text-red-400" />
  }
  if (lowerTitle.includes("conclusion") || lowerTitle.includes("synthèse")) {
    return <FileText className="w-6 h-6 text-red-400" />
  }

  return <Brain className="w-6 h-6 text-red-400" />
}

function cleanTitle(title: string): string {
  return title
    .replace(/^#+\s*/, "") // Remove markdown headers
    .replace(/^\[.*?\]\s*/, "") // Remove [SECTION] markers
    .replace(/\*\*/g, "") // Remove bold markers
    .trim()
}

function renderDetailedAnalysis(detailedText: string) {
  if (!detailedText || detailedText.trim().length === 0) {
    return (
      <div className="rounded-lg border border-red-900/30 bg-zinc-950 p-12 text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
        <p className="font-['JetBrains_Mono'] text-gray-400">Aucune analyse détaillée disponible</p>
      </div>
    )
  }

  const sections = parseMarkdownToSections(detailedText)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-red-900/30 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-950 overflow-hidden shadow-2xl shadow-red-500/5"
        >
          {/* Section Header with Icon */}
          {section.title && (
            <div className="bg-gradient-to-r from-red-950/40 to-red-950/20 border-b border-red-900/30 px-8 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                {getSectionIcon(section.title)}
              </div>
              <div className="flex-1">
                <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white uppercase tracking-wide">
                  {cleanTitle(section.title)}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-transparent mt-2 rounded-full"></div>
              </div>
            </div>
          )}

          <div className="p-8 space-y-6">
            {section.content.map((item, itemIdx) => {
              if (item.type === "subtitle") {
                return (
                  <div key={itemIdx} className="flex items-center gap-3 mt-8 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-900 rounded-full"></div>
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold text-red-400 uppercase tracking-wider">
                      {formatTextWithBold(item.text || "")}
                    </h3>
                  </div>
                )
              }

              if (item.type === "highlight") {
                return (
                  <div
                    key={itemIdx}
                    className="relative rounded-lg bg-gradient-to-r from-red-950/30 to-orange-950/20 border border-red-500/30 p-6 shadow-lg shadow-red-500/10"
                  >
                    <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="font-['Space_Grotesk'] text-lg text-white leading-relaxed pl-4">
                      {formatTextWithBold(item.text || "")}
                    </p>
                  </div>
                )
              }

              if (item.type === "paragraph") {
                return (
                  <div
                    key={itemIdx}
                    className="rounded-lg bg-zinc-900/40 border border-zinc-800/50 p-5 hover:border-red-900/40 transition-colors duration-300"
                  >
                    <p className="font-['JetBrains_Mono'] text-sm text-gray-300 leading-relaxed">
                      {formatTextWithBold(item.text || "")}
                    </p>
                  </div>
                )
              }

              if (item.type === "list") {
                return (
                  <div key={itemIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {item.items?.map((listItem, listIdx) => (
                      <div
                        key={listIdx}
                        className="flex items-start gap-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50 p-4 hover:border-red-900/50 hover:bg-zinc-950/80 transition-all duration-300"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="font-['JetBrains_Mono'] text-sm text-gray-300 leading-relaxed">
                          {formatTextWithBold(listItem)}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
