"use client"

import { useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"

interface CountryResult {
  country: string
  countryCode: string
  flag: string
  presence: number
  sentiment: number
  coherence: number
  globalScore: number
  analysis: string
  presenceRationale: string
  sentimentRationale: string
  coherenceRationale: string
}

interface WorldReputationAdapterProps {
  isOpen: boolean
  onClose: () => void
  results: {
    query: string
    totalCountries: number
    results: CountryResult[]
    bestCountry: CountryResult
    worstCountry: CountryResult
    globalAnalysis: string
    averageScore: number
  }
  query: string
}

export function WorldReputationAdapter({ isOpen, onClose, results, query }: WorldReputationAdapterProps) {
  const modal = useModal()

  useEffect(() => {
    if (isOpen && results) {
      showWorldReputationResults()
    }
  }, [isOpen, results])

  useEffect(() => {
    if (isOpen && !modal.isOpen && results) {
      showWorldReputationResults()
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const showWorldReputationResults = () => {
    if (!results.results || results.results.length === 0) {
      const emptyContent: DialogFitContent = {
        title: `Réputation Mondiale de "${results.query}"`,
        content: `## Aucun résultat trouvé

Aucune donnée disponible pour "${results.query}" dans les pays analysés.

Cela peut être dû à :
- Un terme de recherche trop spécifique
- Une présence digitale limitée dans les régions analysées
- Des restrictions d'accès aux données dans certains pays

**Suggestions :**
- Essayez avec un terme plus général
- Vérifiez l'orthographe du terme recherché
- Contactez-nous pour une analyse personnalisée`,
        metadata: {
          query: results.query,
          totalResults: 0,
        },
      }

      modal.openModal(emptyContent, { variant: "lg" })
      return
    }

    const bestCountry = results.bestCountry
    const worstCountry = results.worstCountry

    let title = `🌍 Réputation Mondiale de "${results.query}"`
    if (bestCountry) {
      title += ` - ${bestCountry.flag} ${bestCountry.country} en tête !`
    }

    const tabs = [
      {
        id: "resume",
        label: "Résumés",
        content: `## 🌍 Analyse Mondiale de "${results.query}"

### 📊 Vue d'Ensemble
- **Pays analysés :** ${results.totalCountries}
- **Score moyen global :** ${results.averageScore}/100
- **Pays avec données :** ${results.results.length}

${
  bestCountry
    ? `### 🏆 Meilleur Marché
**${bestCountry.flag} ${bestCountry.country}** - Score: ${bestCountry.globalScore}/100

${bestCountry.analysis}`
    : ""
}

${
  worstCountry
    ? `### 📈 Marché à Améliorer  
**${worstCountry.flag} ${worstCountry.country}** - Score: ${worstCountry.globalScore}/100

Ce marché présente le plus grand potentiel d'amélioration et d'opportunités de croissance.`
    : ""
}

### 🔍 Analyse Comparative Globale
${results.globalAnalysis}`,
      },
      {
        id: "pays",
        label: "Analyse par Pays",
        content: `## 📍 Analyse Détaillée par Pays

${results.results
  .sort((a, b) => b.globalScore - a.globalScore)
  .map(
    (country, index) => `### ${index + 1}. ${country.flag} ${country.country} - ${country.globalScore}/100

**Scores détaillés :**
- Présence Digitale : ${country.presence}/100
- Sentiment : ${country.sentiment}/100  
- Cohérence : ${country.coherence}/100

**Analyse :**
${country.analysis}

**Détails des scores :**
- *Présence :* ${country.presenceRationale}
- *Sentiment :* ${country.sentimentRationale}
- *Cohérence :* ${country.coherenceRationale}

---`,
  )
  .join("\n\n")}`,
      },
      {
        id: "recommandations",
        label: "Recommandations",
        content: `## 🎯 Recommandations Stratégiques

### 🚀 Plan d'Action Recommandé

**Phase 1 (0-6 mois) - Consolidation**
${
  bestCountry
    ? `- Maintenir l'excellence en ${bestCountry.country}
- Capitaliser sur les points forts identifiés
- Renforcer la position de leader`
    : "- Identifier les marchés les plus prometteurs\n- Développer une stratégie de base solide"
}

**Phase 2 (6-12 mois) - Expansion**
${
  worstCountry
    ? `- Développer une stratégie spécifique pour ${worstCountry.country}
- Adapter le message aux spécificités culturelles locales
- Établir des partenariats locaux`
    : "- Étendre la présence sur les marchés secondaires\n- Optimiser la cohérence du message global"
}

**Phase 3 (12-18 mois) - Optimisation Globale**
- Harmoniser la stratégie sur tous les marchés
- Mesurer et ajuster les performances
- Expansion vers de nouveaux marchés émergents

### 💡 Opportunités Identifiées

${results.results
  .filter((country) => country.globalScore < 70)
  .map(
    (country) =>
      `**${country.flag} ${country.country} :** Potentiel d'amélioration de ${100 - country.globalScore} points`,
  )
  .join("\n")}

### ⚠️ Points d'Attention

${results.results
  .filter((country) => country.globalScore < 50)
  .map(
    (country) =>
      `**${country.flag} ${country.country} :** Nécessite une attention immédiate (Score: ${country.globalScore}/100)`,
  )
  .join("\n")}

### 🎯 ROI Attendu
- Amélioration du score global de ${results.averageScore} à ${Math.min(results.averageScore + 15, 95)}+ sur 18 mois
- Augmentation de 40% de la visibilité dans les marchés à faible score
- Croissance de 25% de l'engagement global

---

### 🚀 Vous voulez améliorer votre réputation mondiale ?
Nous avons tous les outils pour optimiser votre présence digitale internationale.

**📞 Contactez-nous dès maintenant !**`,
      },
    ]

    const worldContent: DialogFitContent = {
      title,
      tabs,
      metadata: {
        query: results.query,
        totalResults: results.results.length,
      },
    }

    modal.openModal(worldContent, {
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
