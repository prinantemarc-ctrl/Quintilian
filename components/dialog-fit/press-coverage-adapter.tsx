"use client"

import { useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"

interface PressSource {
  title: string
  snippet: string
  url: string
  source: string
  date: string
  relevanceScore: number
  mediaType: string
}

interface PressCoverageResult {
  query: string
  globalScore: number
  coverageScore: number
  qualityScore: number
  reachScore: number
  totalArticles: number
  recognizedMediaCount: number
  analysis: string
  topSources: PressSource[]
  recommendations: string[]
  processingTime: number
}

interface PressCoverageAdapterProps {
  isOpen: boolean
  onClose: () => void
  result: PressCoverageResult | null
  query: string
}

export function PressCoverageAdapter({ isOpen, onClose, result, query }: PressCoverageAdapterProps) {
  const modal = useModal()

  useEffect(() => {
    if (isOpen && result) {
      showPressCoverageResults()
    }
  }, [isOpen, result])

  useEffect(() => {
    if (isOpen && !modal.isOpen && result) {
      showPressCoverageResults()
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellente"
    if (score >= 60) return "Bonne"
    if (score >= 40) return "Moyenne"
    return "Faible"
  }

  const getMediaTypeLabel = (type: string) => {
    switch (type) {
      case "international":
        return "International"
      case "national":
        return "National"
      case "specialized":
        return "Spécialisé"
      default:
        return "Autre"
    }
  }

  const showPressCoverageResults = () => {
    if (!result) return

    const title = `📰 Couverture Presse - "${result.query}" - Score: ${result.globalScore}/100`

    const tabs = [
      {
        id: "resume",
        label: "Résumés",
        content: `## 📰 Analyse de Couverture Presse

### 📊 Scores Principaux
- **Score Global :** ${result.globalScore}/100 (${getScoreLabel(result.globalScore)})
- **Couverture :** ${result.coverageScore}/100 (${result.totalArticles} articles)
- **Qualité :** ${result.qualityScore}/100 (Analyse contenu)
- **Portée :** ${result.reachScore}/100 (${result.recognizedMediaCount} médias)

### 🔍 Analyse Globale
${result.analysis}

### 📈 Métriques Clés
- **Articles trouvés :** ${result.totalArticles}
- **Médias reconnus :** ${result.recognizedMediaCount}
- **Temps de traitement :** ${result.processingTime}ms
- **Couverture :** ${getScoreLabel(result.coverageScore)}
- **Qualité :** ${getScoreLabel(result.qualityScore)}
- **Portée :** ${getScoreLabel(result.reachScore)}`,
      },
      {
        id: "articles",
        label: "Articles",
        content: `## 📄 Articles de Presse Analysés

${
  result.topSources.length > 0
    ? result.topSources
        .map(
          (source, index) => `### ${index + 1}. ${source.title}

**Source :** ${source.source} (${getMediaTypeLabel(source.mediaType)})
**Date :** ${source.date}
**Pertinence :** ${source.relevanceScore}%

**Extrait :**
${source.snippet}

**Lien :** [Lire l'article complet](${source.url})

---`,
        )
        .join("\n\n")
    : "Aucun article trouvé dans les médias reconnus pour cette recherche."
}`,
      },
      {
        id: "recommandations",
        label: "Recommandations",
        content: `## 💡 Recommandations Stratégiques

${
  result.recommendations.length > 0
    ? result.recommendations.map((rec, index) => `### ${index + 1}. ${rec}`).join("\n\n")
    : "Aucune recommandation spécifique disponible."
}

### 🎯 Plan d'Action Suggéré

**Amélioration de la Couverture :**
${
  result.coverageScore < 70
    ? `- Développer des relations avec plus de journalistes
- Créer des communiqués de presse plus attractifs
- Organiser des événements médiatiques
- Proposer des angles d'actualité pertinents`
    : `- Maintenir les bonnes relations existantes
- Diversifier les types de médias contactés
- Optimiser le timing des annonces`
}

**Amélioration de la Qualité :**
${
  result.qualityScore < 70
    ? `- Améliorer la qualité des communiqués de presse
- Fournir plus de données et d'analyses
- Proposer des interviews d'experts
- Créer du contenu plus engageant`
    : `- Continuer à fournir du contenu de qualité
- Innover dans les formats de communication
- Maintenir l'expertise sectorielle`
}

**Amélioration de la Portée :**
${
  result.reachScore < 70
    ? `- Cibler des médias à plus forte audience
- Développer une stratégie multi-canal
- Utiliser les réseaux sociaux pour amplifier
- Collaborer avec des influenceurs sectoriels`
    : `- Optimiser la diffusion sur les canaux existants
- Explorer de nouveaux médias émergents
- Renforcer la présence internationale`
}

---

### 🚀 Vous voulez améliorer votre couverture presse ?
Nous avons tous les outils pour optimiser votre stratégie de relations presse.

**📞 Contactez-nous dès maintenant !**`,
      },
    ]

    const pressContent: DialogFitContent = {
      title,
      tabs,
      metadata: {
        processingTime: result.processingTime,
        totalResults: result.totalArticles,
        query: result.query,
      },
    }

    modal.openModal(pressContent, {
      autoSize: true,
      allowFullscreen: true,
    })
  }

  return (
    <AdaptiveModal
      isOpen={modal.isOpen}
      onClose={() => {
        modal.closeModal()
        onClose()
      }}
      content={modal.content!}
      autoSize={modal.options.autoSize}
      showToolbar={modal.options.showToolbar}
      showProgress={modal.options.showProgress}
      allowFullscreen={modal.options.allowFullscreen}
      loading={modal.loading}
      error={modal.error}
    />
  )
}
