"use client"

import { useState, useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"
// import { useLanguage } from "@/contexts/language-context"

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
  // const { language: uiLanguage } = useLanguage()
  const [result, setResult] = useState<DuelResult | null>(null)

  useEffect(() => {
    if (isOpen && formData.brand1 && formData.brand2) {
      startDuelAnalysis()
    }
  }, [isOpen, formData])

  useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.showLoading("Duel in progress...")
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const startDuelAnalysis = async () => {
    modal.showLoading("Duel in progress...")

    try {
      const response = await fetch("/api/duel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          uiLanguage: "en",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Duel error: ${response.status} - ${errorText}`)
      }

      const apiResponse = await response.json()
      const duelResult = apiResponse.data

      if (!duelResult || !duelResult.brand1_analysis || !duelResult.brand2_analysis) {
        throw new Error("Structure of duel data invalid")
      }

      setResult(duelResult)
      showDuelResults(duelResult)
    } catch (error) {
      console.error("Duel error:", error)
      modal.showError("Duel Error", error instanceof Error ? error.message : "An error occurred")
    }
  }

  const showDuelResults = (duelResult: DuelResult) => {
    const winnerEmoji = duelResult.winner === "Draw" ? "🤝" : "🏆"
    const title =
      duelResult.winner === "Draw"
        ? `${winnerEmoji} Draw! - ${formData.brand1} vs ${formData.brand2}`
        : `${winnerEmoji} ${duelResult.winner} wins the duel!`

    const tabs = [
      {
        id: "resume",
        label: "Summaries",
        content: `## ${winnerEmoji} Duel Result

**${formData.brand1}** vs **${formData.brand2}**

${
  duelResult.winner === "Draw"
    ? `### 🤝 Draw!
Both entities are tied with a score of ${duelResult.brand1_analysis.global_score}/100`
    : `### 🏆 ${duelResult.winner} wins the duel!
Global score: ${duelResult.winner === formData.brand1 ? duelResult.brand1_analysis.global_score : duelResult.brand2_analysis.global_score}/100
${duelResult.score_difference > 0 ? `(${duelResult.score_difference} point difference)` : ""}`
}

### 📊 Score Comparison

**Digital Presence:**
- ${formData.brand1}: ${duelResult.brand1_analysis.presence_score}/100
- ${formData.brand2}: ${duelResult.brand2_analysis.presence_score}/100

**Sentiment:**
- ${formData.brand1}: ${duelResult.brand1_analysis.tone_score}/100
- ${formData.brand2}: ${duelResult.brand2_analysis.tone_score}/100

**Coherence:**
- ${formData.brand1}: ${duelResult.brand1_analysis.coherence_score}/100
- ${formData.brand2}: ${duelResult.brand2_analysis.coherence_score}/100

### 🥊 Global Scores

**${formData.brand1}:** ${duelResult.brand1_analysis.global_score}/100
**${formData.brand2}:** ${duelResult.brand2_analysis.global_score}/100`,
      },
      {
        id: "analyse1",
        label: formData.brand1,
        content: `## Analysis of ${formData.brand1}

### 📈 Detailed Scores
- **Digital Presence:** ${duelResult.brand1_analysis.presence_score}/100
- **Sentiment:** ${duelResult.brand1_analysis.tone_score}/100 (${duelResult.brand1_analysis.tone_label})
- **Coherence:** ${duelResult.brand1_analysis.coherence_score}/100
- **Global Score:** ${duelResult.brand1_analysis.global_score}/100

### 🔍 Detailed Analysis
${duelResult.brand1_analysis.rationale}

${
  duelResult.brand1_analysis.google_summary
    ? `### 📊 SEO Summary
${duelResult.brand1_analysis.google_summary}`
    : ""
}

${
  duelResult.brand1_analysis.gpt_summary
    ? `### 🤖 GPT Analysis
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
        content: `## Analysis of ${formData.brand2}

### 📈 Detailed Scores
- **Digital Presence:** ${duelResult.brand2_analysis.presence_score}/100
- **Sentiment:** ${duelResult.brand2_analysis.tone_score}/100 (${duelResult.brand2_analysis.tone_label})
- **Coherence:** ${duelResult.brand2_analysis.coherence_score}/100
- **Global Score:** ${duelResult.brand2_analysis.global_score}/100

### 🔍 Detailed Analysis
${duelResult.brand2_analysis.rationale}

${
  duelResult.brand2_analysis.google_summary
    ? `### 📊 SEO Summary
${duelResult.brand2_analysis.google_summary}`
    : ""
}

${
  duelResult.brand2_analysis.gpt_summary
    ? `### 🤖 GPT Analysis
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
        label: "Comparison",
        content: `## 🔍 Detailed Comparative Analysis

${duelResult.detailed_comparison}

---

### 🚀 Want to improve your score?
We have all the tools to optimize your digital presence and message coherence.

**📞 Contact us now!**`,
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
