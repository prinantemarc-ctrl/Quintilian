"use client"

import { useState, useEffect } from "react"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"
import { InfoModal } from "@/components/info-modal"
import { analysisHistory } from "@/lib/history"
import { useLanguage } from "@/contexts/language-context"

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
  const { language: uiLanguage } = useLanguage()
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
      modal.showLoading("Analyse en cours...")
    } else if (!isOpen && modal.isOpen) {
      modal.closeModal()
    }
  }, [isOpen])

  const startAnalysis = async (identity?: string) => {
    setLoadingProgress(0)
    modal.showLoading("Analyse en cours...")

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
            uiLanguage: uiLanguage,
            selected_identity: identity,
            search_results: identitySelection?.search_results || [],
          }
        : {
            brand: searchTerm,
            message: message,
            language: language,
            uiLanguage: uiLanguage,
          }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'analyse"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage

          if (response.status === 429 || errorData.error === "RATE_LIMIT_EXCEEDED") {
            errorMessage =
              errorData.message ||
              "L'API Google a atteint sa limite de requêtes. Veuillez réessayer dans quelques minutes."
          }
        } catch (jsonError) {
          errorMessage = response.statusText || `Erreur ${response.status}`
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
      modal.showError("Erreur d'Analyse", err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  const showIdentitySelection = (identityData: IdentitySelectionResponse) => {
    const content: DialogFitContent = {
      title: "Sélection d'identité",
      content: `
**${identityData.message}**

Plusieurs identités ont été trouvées pour "${searchTerm}". Veuillez sélectionner celle qui correspond le mieux à votre recherche ou préciser votre identité.

**Identités trouvées :**
${identityData.identified_entities.map((entity, index) => `${index + 1}. ${entity}`).join("\n")}

Vous pouvez également préciser votre identité en utilisant le champ de texte ci-dessous.
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

    // Onglet Résumés
    if (resultData.google_summary || resultData.gpt_summary) {
      let resumeContent = "## Résumés de l'Analyse\n\n"

      if (resultData.google_summary) {
        resumeContent += "### 🔍 Résumé Google\n"
        resumeContent += "*Basé sur les résultats de recherche Google*\n\n"
        resumeContent += resultData.google_summary + "\n\n"
      }

      if (resultData.gpt_summary) {
        resumeContent += "### 🤖 Résumé GPT\n"
        resumeContent += "*Analyse IA avancée et contextuelle*\n\n"
        resumeContent += resultData.gpt_summary + "\n\n"
      }

      resumeContent += "---\n\n"
      resumeContent += "### 🚀 Votre score ne vous satisfait pas ?\n"
      resumeContent += "Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.\n\n"
      resumeContent += "**📞 Contactez-nous dès maintenant !**"

      tabs.push({
        id: "resume",
        label: "Résumés",
        content: resumeContent,
      })
    }

    // Onglet Analyse Détaillée
    if (resultData.detailed_analysis || resultData.rationale) {
      let detailContent = "## Analyse Détaillée\n\n"

      if (resultData.detailed_analysis) {
        detailContent += resultData.detailed_analysis
      } else if (resultData.rationale) {
        detailContent += resultData.rationale
      }

      detailContent += "\n\n---\n\n"
      detailContent += "### 🚀 Votre score ne vous satisfait pas ?\n"
      detailContent += "Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.\n\n"
      detailContent += "**📞 Contactez-nous dès maintenant !**"

      tabs.push({
        id: "analyse",
        label: "Analyse Détaillée",
        content: detailContent,
      })
    }

    // Onglet Conclusion
    if (resultData.structured_conclusion) {
      let conclusionContent = "## Conclusion Stratégique\n\n"
      conclusionContent += resultData.structured_conclusion

      conclusionContent += "\n\n---\n\n"
      conclusionContent += "### 🚀 Votre score ne vous satisfait pas ?\n"
      conclusionContent += "Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.\n\n"
      conclusionContent += "**📞 Contactez-nous dès maintenant !**"

      tabs.push({
        id: "conclusion",
        label: "Conclusion",
        content: conclusionContent,
      })
    }

    // Si pas d'onglets, créer un contenu simple
    let content = ""
    if (tabs.length === 0) {
      content = `## Analyse de "${searchTerm}"\n\n`
      content += `**Message analysé :** ${message}\n\n`
      content += `**Score Global :** ${globalScore}/100\n\n`

      content += `### Scores Détaillés\n\n`
      content += `- **Présence Digitale :** ${resultData.presence_score}/100\n`
      content += `- **Sentiment :** ${resultData.tone_score}/100 (${resultData.tone_label})\n`
      content += `- **Cohérence :** ${resultData.coherence_score}/100\n\n`

      if (resultData.rationale) {
        content += `### Analyse\n\n${resultData.rationale}\n\n`
      }

      content += "---\n\n"
      content += "### 🚀 Votre score ne vous satisfait pas ?\n"
      content += "Vous voulez influer dessus ? Nous avons les solutions qu'il vous faut.\n\n"
      content += "**📞 Contactez-nous dès maintenant !**"
    }

    const analysisContent: DialogFitContent = {
      title: `Analyse de "${searchTerm}" - Score: ${globalScore}/100`,
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
      fr: "Français",
      en: "Anglais",
      es: "Español",
      de: "Allemand",
      it: "Italien",
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
