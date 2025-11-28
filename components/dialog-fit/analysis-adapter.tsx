"use client"

import { useState, useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"
import { InfoModal } from "@/components/info-modal"
import { analysisHistory } from "@/lib/history"

interface AnalysisAdapterProps {
  isOpen: boolean
  onClose: () => void
  searchTerm: string
  message: string
  language: string
}

interface AnalysisResult {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
  rationale: string
  sources: Array<{
    title: string
    link: string
  }>
  google_summary?: string
  gpt_summary?: string
  structured_conclusion?: string
  detailed_analysis?: string
  search_volume?: number
  competition_level?: string
  trending_topics?: string[]
  geographic_presence?: string[]
  content_quality_score?: number
  social_signals?: number
  technical_seo_score?: number
  processing_time?: number
  sources_analyzed?: number
  cache_hit?: boolean
}

interface IdentitySelectionResponse {
  requires_identity_selection: boolean
  identified_entities: string[]
  search_results: Array<{
    title?: string
    link?: string
    snippet?: string
  }>
  message: string
  presence_score?: number
  tone_score?: number
  coherence_score?: number
  tone_label?: string
  rationale?: string
  google_summary?: string
  gpt_summary?: string
  structured_conclusion?: string
  detailed_analysis?: string
}

export function AnalysisAdapter({ isOpen, onClose, searchTerm, message, language }: AnalysisAdapterProps) {
  const modal = useModal()
  const [showInfo, setShowInfo] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [identitySelection, setIdentitySelection] = useState<IdentitySelectionResponse | null>(null)
  const [selectedIdentity, setSelectedIdentity] = useState<string>("")
  const [customIdentity, setCustomIdentity] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (isOpen && searchTerm) {
      startAnalysis()
    }
  }, [isOpen, searchTerm, message, language])

  useEffect(() => {
    if (isOpen && !modal.isOpen) {
      modal.showLoading("Analysis in progress...")
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const startAnalysis = async (identity?: string) => {
    setLoadingProgress(0)
    modal.showLoading("Analysis in progress...")

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const increment = prev < 60 ? Math.random() * 8 : prev < 85 ? Math.random() * 4 : Math.random() * 2
        return Math.min(prev + increment, 92)
      })
    }, 1200)

    try {
      const requestBody = identity
        ? {
            brand: searchTerm,
            message: message,
            language: language,
            uiLanguage: "en",
            selected_identity: identity,
            search_results: identitySelection?.search_results || [],
          }
        : {
            brand: searchTerm,
            message: message,
            language: language,
            uiLanguage: "en",
          }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = "Analysis error"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage

          if (response.status === 429 || errorData.error === "RATE_LIMIT_EXCEEDED") {
            errorMessage =
              errorData.message || "Google API has reached its request limit. Please try again in a few minutes."
          }
        } catch (jsonError) {
          errorMessage = response.statusText || `Error ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const analysisResult = await response.json()
      const resultData = analysisResult.data || analysisResult

      clearInterval(progressInterval)
      setLoadingProgress(100)

      if (resultData.requires_identity_selection) {
        setIdentitySelection(resultData)
        showIdentitySelection(resultData)
        return
      }

      setTimeout(() => {
        setResult(resultData)
        showAnalysisResults(resultData)

        // Sauvegarder dans l'historique
        if (resultData) {
          analysisHistory.addAnalysis({
            brand: searchTerm,
            message: message,
            language: language,
            type: "simple",
            results: {
              presence_score: resultData.presence_score,
              tone_score: resultData.tone_score,
              coherence_score: resultData.coherence_score,
              tone_label: resultData.tone_label,
              rationale: resultData.rationale,
              google_summary: resultData.google_summary,
              gpt_summary: resultData.gpt_summary,
              structured_conclusion: resultData.structured_conclusion,
              detailed_analysis: resultData.detailed_analysis,
              sources: resultData.sources,
            },
            metadata: {
              fromCache: resultData._cache_stats ? true : false,
            },
          })
        }
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      console.error("Analysis error:", err)
      modal.showError("Analysis Error", err instanceof Error ? err.message : "An error occurred")
    }
  }

  const showIdentitySelection = (identityData: IdentitySelectionResponse) => {
    const content: DialogFitContent = {
      title: "Identity Selection",
      content: `
**${identityData.message}**

Multiple identities were found for "${searchTerm}". Please select the one that best matches your search or specify your identity.

**Identities found:**
${identityData.identified_entities.map((entity, index) => `${index + 1}. ${entity}`).join("\n")}

You can also specify your identity using the text field below.
      `,
      metadata: {
        query: searchTerm,
        totalResults: identityData.identified_entities.length,
      },
    }

    modal.openModal(content, {
      variant: "lg",
      showToolbar: false,
    })
  }

  const showAnalysisResults = (resultData: AnalysisResult) => {
    const globalScore = Math.round((resultData.presence_score + resultData.tone_score + resultData.coherence_score) / 3)

    const tabs = []

    if (resultData.google_summary || resultData.gpt_summary) {
      let resumeContent = "## Analysis Summaries\n\n"

      if (resultData.google_summary) {
        resumeContent += "### 🔍 Google Summary\n"
        resumeContent += "*Based on Google search results*\n\n"
        resumeContent += resultData.google_summary + "\n\n"
      }

      if (resultData.gpt_summary) {
        resumeContent += "### 🤖 GPT Summary\n"
        resumeContent += "*Advanced AI and contextual analysis*\n\n"
        resumeContent += resultData.gpt_summary + "\n\n"
      }

      resumeContent += "---\n\n"
      resumeContent += "### 🚀 Not satisfied with your score?\n"
      resumeContent += "Want to improve it? We have the solutions you need.\n\n"
      resumeContent += "**📞 Contact us now!**"

      tabs.push({
        id: "resume",
        label: "Summaries",
        content: resumeContent,
      })
    }

    if (resultData.detailed_analysis || resultData.rationale) {
      let detailContent = "## Detailed Analysis\n\n"

      if (resultData.detailed_analysis) {
        detailContent += resultData.detailed_analysis
      } else if (resultData.rationale) {
        detailContent += resultData.rationale
      }

      detailContent += "\n\n---\n\n"
      detailContent += "### 🚀 Not satisfied with your score?\n"
      detailContent += "Want to improve it? We have the solutions you need.\n\n"
      detailContent += "**📞 Contact us now!**"

      tabs.push({
        id: "analyse",
        label: "Detailed Analysis",
        content: detailContent,
      })
    }

    if (resultData.structured_conclusion) {
      let conclusionContent = "## Strategic Conclusion\n\n"
      conclusionContent += resultData.structured_conclusion

      conclusionContent += "\n\n---\n\n"
      conclusionContent += "### 🚀 Not satisfied with your score?\n"
      conclusionContent += "Want to improve it? We have the solutions you need.\n\n"
      conclusionContent += "**📞 Contact us now!**"

      tabs.push({
        id: "conclusion",
        label: "Conclusion",
        content: conclusionContent,
      })
    }

    let content = ""
    if (tabs.length === 0) {
      content = `## Analysis of "${searchTerm}"\n\n`
      content += `**Analyzed Message:** ${message}\n\n`
      content += `**Global Score:** ${globalScore}/100\n\n`

      content += `### Detailed Scores\n\n`
      content += `- **Digital Presence:** ${resultData.presence_score}/100\n`
      content += `- **Sentiment:** ${resultData.tone_score}/100 (${resultData.tone_label})\n`
      content += `- **Coherence:** ${resultData.coherence_score}/100\n\n`

      if (resultData.rationale) {
        content += `### Analysis\n\n${resultData.rationale}\n\n`
      }

      content += "---\n\n"
      content += "### 🚀 Not satisfied with your score?\n"
      content += "Want to improve it? We have the solutions you need.\n\n"
      content += "**📞 Contact us now!**"
    }

    const analysisContent: DialogFitContent = {
      title: `Analysis of "${searchTerm}" - Score: ${globalScore}/100`,
      content: tabs.length === 0 ? content : undefined,
      tabs: tabs.length > 0 ? tabs : undefined,
      metadata: {
        processingTime: resultData.processing_time,
        totalResults: resultData.sources_analyzed,
        query: searchTerm,
      },
    }

    modal.openModal(analysisContent, {
      autoSize: true,
      allowFullscreen: true,
    })
  }

  const handleIdentitySelection = (identity: string) => {
    setSelectedIdentity(identity)
    setIdentitySelection(null)
    startAnalysis(identity)
  }

  const handleCustomIdentitySubmit = () => {
    if (customIdentity.trim()) {
      const customDescription = `${searchTerm} - ${customIdentity.trim()}`
      handleIdentitySelection(customDescription)
    }
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      fr: "French",
      en: "English",
      es: "Spanish",
      de: "German",
      it: "Italian",
    }
    return labels[lang] || lang
  }

  return (
    <>
      {/* Modal DialogFit principal */}
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

      {/* Modal d'information sur la méthodologie */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
