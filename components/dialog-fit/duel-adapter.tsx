"use client"

import { useState, useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"
import { useLanguage } from "@/contexts/language-context"

interface DuelAdapterProps {
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

export function DuelAdapter({ isOpen, onClose, formData }: DuelAdapterProps) {
  const modal = useModal()
  const { language: uiLanguage } = useLanguage()
  const [result, setResult] = useState<DuelResult | null>(null)

  useEffect(() => {
    if (isOpen && formData.brand1 && formData.brand2) {
      startDuelAnalysis()
    }
  }, [isOpen, formData])

  useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.showLoading("Duel en cours...")
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const startDuelAnalysis = async () => {
    modal.showLoading("Duel en cours...")

    try {
      const response = await fetch("/api/duel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          uiLanguage: uiLanguage,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur lors du duel: ${response.status} - ${errorText}`)
      }

      const apiResponse = await response.json()
      const duelResult = apiResponse.data

      if (!duelResult || !duelResult.brand1_analysis || !duelResult.brand2_analysis) {
        throw new Error("Structure de données de duel invalide")
      }

      setResult(duelResult)
      showDuelResults(duelResult)
    } catch (error) {
      console.error("Duel error:", error)
      modal.showError("Erreur de Duel", error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  const showDuelResults = (duelResult: DuelResult) => {
    const winnerEmoji = duelResult.winner === "Match nul" ? "🤝" : "🏆"
    const title =
      duelResult.winner === "Match nul"
        ? `${winnerEmoji} Match nul ! - ${formData.brand1} vs ${formData.brand2}`
        : `${winnerEmoji} ${duelResult.winner} remporte le duel !`

    const tabs = [
      {
        id: "resume",
        label: "Résumés",
        content: `## ${winnerEmoji} Résultat du Duel

**${formData.brand1}** vs **${formData.brand2}**

${
  duelResult.winner === "Match nul"
    ? `### 🤝 Match nul !
Les deux entités sont à égalité avec un score de ${duelResult.brand1_analysis.global_score}/100`
    : `### 🏆 ${duelResult.winner} remporte le duel !
Score global : ${duelResult.winner === formData.brand1 ? duelResult.brand1_analysis.global_score : duelResult.brand2_analysis.global_score}/100
${duelResult.score_difference > 0 ? `(Écart de ${duelResult.score_difference} points)` : ""}`
}

### 📊 Comparaison des Scores

**Présence Digitale :**
- ${formData.brand1} : ${duelResult.brand1_analysis.presence_score}/100
- ${formData.brand2} : ${duelResult.brand2_analysis.presence_score}/100

**Sentiment :**
- ${formData.brand1} : ${duelResult.brand1_analysis.tone_score}/100
- ${formData.brand2} : ${duelResult.brand2_analysis.tone_score}/100

**Cohérence :**
- ${formData.brand1} : ${duelResult.brand1_analysis.coherence_score}/100
- ${formData.brand2} : ${duelResult.brand2_analysis.coherence_score}/100

### 🥊 Scores Globaux

**${formData.brand1} :** ${duelResult.brand1_analysis.global_score}/100
**${formData.brand2} :** ${duelResult.brand2_analysis.global_score}/100`,
      },
      {
        id: "analyse1",
        label: formData.brand1,
        content: `## Analyse de ${formData.brand1}

### 📈 Scores Détaillés
- **Présence Digitale :** ${duelResult.brand1_analysis.presence_score}/100
- **Sentiment :** ${duelResult.brand1_analysis.tone_score}/100 (${duelResult.brand1_analysis.tone_label})
- **Cohérence :** ${duelResult.brand1_analysis.coherence_score}/100
- **Score Global :** ${duelResult.brand1_analysis.global_score}/100

### 🔍 Analyse Détaillée
${duelResult.brand1_analysis.rationale}

${
  duelResult.brand1_analysis.google_summary
    ? `### 📊 Résumé SEO
${duelResult.brand1_analysis.google_summary}`
    : ""
}

${
  duelResult.brand1_analysis.gpt_summary
    ? `### 🤖 Analyse GPT
${duelResult.brand1_analysis.gpt_summary}`
    : ""
}

${
  duelResult.brand1_analysis.structured_conclusion
    ? `### 📋 Conclusion
${duelResult.brand1_analysis.structured_conclusion}`
    : ""
}`,
      },
      {
        id: "analyse2",
        label: formData.brand2,
        content: `## Analyse de ${formData.brand2}

### 📈 Scores Détaillés
- **Présence Digitale :** ${duelResult.brand2_analysis.presence_score}/100
- **Sentiment :** ${duelResult.brand2_analysis.tone_score}/100 (${duelResult.brand2_analysis.tone_label})
- **Cohérence :** ${duelResult.brand2_analysis.coherence_score}/100
- **Score Global :** ${duelResult.brand2_analysis.global_score}/100

### 🔍 Analyse Détaillée
${duelResult.brand2_analysis.rationale}

${
  duelResult.brand2_analysis.google_summary
    ? `### 📊 Résumé SEO
${duelResult.brand2_analysis.google_summary}`
    : ""
}

${
  duelResult.brand2_analysis.gpt_summary
    ? `### 🤖 Analyse GPT
${duelResult.brand2_analysis.gpt_summary}`
    : ""
}

${
  duelResult.brand2_analysis.structured_conclusion
    ? `### 📋 Conclusion
${duelResult.brand2_analysis.structured_conclusion}`
    : ""
}`,
      },
    ]

    if (duelResult.detailed_comparison) {
      tabs.push({
        id: "comparison",
        label: "Comparaison",
        content: `## 🔍 Analyse Comparative Détaillée

${duelResult.detailed_comparison}

---

### 🚀 Vous voulez améliorer votre score ?
Nous avons tous les outils pour optimiser votre présence digitale et votre cohérence de message.

**📞 Contactez-nous dès maintenant !**`,
      })
    }

    const duelContent: DialogFitContent = {
      title,
      tabs,
      metadata: {
        query: `${formData.brand1} vs ${formData.brand2}`,
        totalResults: 2,
      },
    }

    modal.openModal(duelContent, {
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
