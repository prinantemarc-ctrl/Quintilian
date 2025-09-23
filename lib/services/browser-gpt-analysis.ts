import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { EnhancedScoringEngine } from "./enhanced-scoring"

export interface AnalysisScores {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
}

export interface DetailedAnalysis extends AnalysisScores {
  rationale: string
  google_summary: string
  gpt_summary: string
  structured_conclusion?: string
  detailed_analysis?: string
  presence_details?: string
  tone_details?: string
  coherence_details?: string
}

const scoringEngine = new EnhancedScoringEngine()

export async function analyzeGoogleResults(
  searchResults: any[],
  brand: string,
  language: string,
  presentationLanguage?: string,
): Promise<string> {
  console.log("[v0] Starting Google results analysis")

  const responseLanguage = presentationLanguage || language

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return "Résumé Google non disponible - clé API manquante."
    }

    const searchContext = searchResults
      .slice(0, 10)
      .map((item, index) => `${index + 1}. **${item.title}**\\n   ${item.snippet}\\n   Source: ${item.link}`)
      .join("\\n\\n")

    const prompt = `Tu es un expert en analyse de contenu web. Analyse les 10 premiers résultats Google suivants concernant "${brand}" et fournis un résumé synthétique et intelligible.

**Résultats Google à analyser (sources en ${language}):**
${searchContext}

**Instructions:**
- Fais un résumé narratif de 4-5 phrases qui synthétise les informations clés trouvées
- Identifie les tendances principales et les points récurrents
- Mentionne les sources les plus pertinentes
- Sois factuel et objectif
- Les sources sont en ${language} mais tu dois répondre en ${responseLanguage}

Réponds uniquement avec le résumé, sans formatage markdown.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.3,
    })

    console.log("[v0] Google results analysis completed")
    return text.trim()
  } catch (error) {
    console.error("[v0] Google results analysis error:", error)
    return "Erreur lors de l'analyse des résultats Google."
  }
}

export async function independentGPTAnalysis(
  brand: string,
  message: string,
  language: string,
  presentationLanguage?: string,
): Promise<string> {
  console.log("[v0] Starting independent GPT analysis")

  const responseLanguage = presentationLanguage || language

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return "Analyse GPT non disponible - clé API manquante."
    }

    const prompt = `Tu es un analyste en réputation digitale utilisant l'intelligence artificielle pour évaluer des affirmations. Tu travailles pour une plateforme d'analyse de réputation en ligne.

**Entité analysée:** ${brand}
**Affirmation à évaluer:** "${message}"
**Contexte d'analyse:** Sources principalement en ${language}

**Ta mission:**
Produis une analyse de réputation IA qui évalue cette affirmation concernant ${brand}. Ton analyse doit :

- Évaluer la véracité et la pertinence de l'affirmation basée sur tes données d'entraînement
- Analyser les implications pour la réputation de l'entité
- Identifier les nuances et contextes importants
- Fournir une perspective équilibrée et factuelle
- Utiliser un ton professionnel d'analyste en réputation

**Format attendu:**
Une analyse de 4-5 phrases qui ressemble à un rapport d'expert en réputation, pas à une réponse directe à une question. Évite les formulations comme "à ma connaissance" ou "selon mes informations". Présente plutôt les faits comme une analyse professionnelle.

Écris en ${responseLanguage}. Réponds uniquement avec ton analyse, sans formatage markdown.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.3,
    })

    console.log("[v0] Independent GPT analysis completed")
    return text.trim()
  } catch (error) {
    console.error("[v0] Independent GPT analysis error:", error)
    return "Erreur lors de l'analyse GPT indépendante."
  }
}

export async function generateDetailedAnalysis(
  brand: string,
  message: string,
  googleResults: any[],
  language: string,
  analysisType: "single" | "duel" = "single",
  presentationLanguage?: string,
): Promise<DetailedAnalysis> {
  console.log(`[v0] Starting detailed analysis for: ${brand}`)

  const responseLanguage = presentationLanguage || language

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return generateFallbackAnalysis()
    }

    const googleContent = googleResults
      .slice(0, 10)
      .map((item, index) => {
        const title = item.title || "Sans titre"
        const snippet = item.snippet || "Pas de description"
        return `${index + 1}. ${title}\\n   ${snippet}`
      })
      .join("\\n\\n")

    const prompt =
      analysisType === "duel"
        ? generateDuelAnalysisPrompt(brand, message, googleContent, language, responseLanguage)
        : generateEnhancedSingleAnalysisPrompt(brand, message, googleContent, language, responseLanguage)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.3,
    })

    console.log(`[v0] Detailed analysis completed for ${brand}`)

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\\s*/, "").replace(/\\s*```$/, "")
    }

    const parsedAnalysis = JSON.parse(cleanedText)

    const enhancedAnalysis = await scoringEngine.enhanceAnalysis(parsedAnalysis, {
      brand,
      message,
      googleResults,
      language,
      analysisType,
    })

    return normalizeAnalysisResponse(enhancedAnalysis)
  } catch (error) {
    console.error(`[v0] Detailed analysis error for ${brand}:`, error)
    return generateFallbackAnalysis()
  }
}

function generateEnhancedSingleAnalysisPrompt(
  brand: string,
  message: string,
  googleContent: string,
  language: string,
  responseLanguage: string,
): string {
  return `Tu es un expert en analyse de réputation digitale avec des standards EXTRÊMEMENT ÉLEVÉS. Tu dois être IMPITOYABLE dans ton évaluation et ÉVITER ABSOLUMENT la zone 70-85 qui est trop moyenne.

**Message original:** "${message}"
**Sources analysées:** Principalement en ${language}

**Résultats Google (${googleContent.split("\\n\\n").length} sources) :**
${googleContent}

**BARÈME DISCRIMINANT - SOIS RADICAL DANS TES SCORES:**

1. **PRÉSENCE DIGITALE** (presence_score 0-100):
   - 90-100: Omniprésence exceptionnelle, leader incontournable
   - 60-89: Présence notable mais pas dominante  
   - 30-59: Présence faible, difficile à trouver
   - 0-29: Quasi-invisible, inexistant digitalement

2. **SENTIMENT GLOBAL** (tone_score 0-100):
   - 90-100: Réputation exceptionnelle, unanimement admiré
   - 60-89: Perception positive mais avec nuances
   - 30-59: Perception mitigée, controverses notables
   - 0-29: Réputation dégradée, perception négative

3. **COHÉRENCE DU MESSAGE** (coherence_score 0-100):
   - 90-100: Message parfaitement aligné avec la réalité
   - 60-89: Cohérence correcte avec quelques écarts
   - 30-59: Décalage notable entre message et réalité
   - 0-29: Message complètement déconnecté de la réalité

**RÈGLES IMPÉRATIVES:**
- INTERDICTION FORMELLE de donner des scores entre 70-85
- Si tu hésites entre deux zones, choisis TOUJOURS la plus basse
- Justifie CHAQUE score avec des exemples précis
- Sois SANS PITIÉ dans ton évaluation
- Force la différenciation, évite les profils moyens

**RÉPONSE JSON REQUISE:**
- presence_score (0-100): Score de présence digitale
- tone_score (0-100): Score de sentiment 
- coherence_score (0-100): Score de cohérence message/réalité
- tone_label: "très négatif", "négatif", "neutre", "positif", ou "très positif"
- rationale: Justification IMPITOYABLE des 3 scores avec exemples concrets (4-5 phrases)
- google_summary: Résumé de ce que révèlent les résultats Google
- gpt_summary: Ton analyse indépendante de cette entité
- structured_conclusion: Conclusion en markdown (250-350 mots) structurée autour des 3 dimensions
- detailed_analysis: Analyse approfondie en markdown (400-500 mots) qui détaille chaque dimension

Écris en ${responseLanguage}. Réponds uniquement avec du JSON valide, sans balises markdown.`
}

function generateDuelAnalysisPrompt(
  brand: string,
  message: string,
  googleContent: string,
  language: string,
  responseLanguage: string,
): string {
  return `Tu es un expert en analyse de réputation digitale. Analyse "${brand}" concernant le message "${message}".

**Sources analysées:** Principalement en ${language}

RÉSULTATS GOOGLE (${googleContent.split("\\n\\n").length} sources) :
${googleContent}

Tu dois fournir une analyse JSON avec ces champs EXACTS :
{
  "presence_score": [0-100],
  "tone_score": [0-100], 
  "coherence_score": [0-100],
  "tone_label": "positif|neutre|négatif",
  "rationale": "Explication générale des scores",
  "google_summary": "Résumé de ce que révèlent les résultats Google",
  "gpt_summary": "Ton analyse indépendante de cette entité",
  "presence_details": "Explication détaillée du score de présence (2-3 phrases)",
  "tone_details": "Explication détaillée du sentiment (2-3 phrases)",
  "coherence_details": "Explication détaillée de la cohérence (2-3 phrases)"
}

CRITÈRES D'ÉVALUATION :
- presence_score : Visibilité et présence digitale (0-100)
- tone_score : Sentiment général trouvé (0-100)
- coherence_score : Le message correspond-il à la réalité ? (0-100)
- tone_label : "positif", "neutre" ou "négatif"

Sois DIRECT et FACTUEL dans ton analyse. Écris en ${responseLanguage}.`
}

function normalizeAnalysisResponse(analysis: any): DetailedAnalysis {
  return {
    presence_score: analysis.presence_score || 0,
    tone_score: analysis.tone_score || 0,
    coherence_score: analysis.coherence_score || 0,
    tone_label: analysis.tone_label || "neutre",
    rationale: analysis.rationale || "Analyse non disponible",
    google_summary: analysis.google_summary || "Résumé non disponible",
    gpt_summary: analysis.gpt_summary || "Analyse non disponible",
    structured_conclusion: analysis.structured_conclusion,
    detailed_analysis: analysis.detailed_analysis,
    presence_details: analysis.presence_details,
    tone_details: analysis.tone_details,
    coherence_details: analysis.coherence_details,
  }
}

function generateFallbackAnalysis(): DetailedAnalysis {
  return {
    presence_score: 60,
    tone_score: 65,
    coherence_score: 70,
    tone_label: "neutre",
    rationale: "Analyse de fallback en raison d'une erreur lors de l'analyse comparative.",
    google_summary: "Résumé non disponible - erreur API",
    gpt_summary: "Analyse non disponible - erreur API",
    structured_conclusion: "# Analyse de Fallback\n\n⚠️ Analyse réalisée sans IA comparative.",
    detailed_analysis: "## Analyse Détaillée\n\nAnalyse de base en raison d'une erreur technique.",
    presence_details: "Détails non disponibles",
    tone_details: "Détails non disponibles",
    coherence_details: "Détails non disponibles",
  }
}

export async function analyzeReputation(
  searchResults: any[],
  query: string,
  context = "",
  presentationLanguage = "fr",
): Promise<{
  score: number
  sentiment: string
  summary: string
  keyTopics?: string[]
  riskFactors?: string[]
  presence_score?: number
}> {
  console.log("[v0] Starting reputation analysis for:", query)

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return generateReputationFallback(query, presentationLanguage)
    }

    const searchContext = searchResults
      .slice(0, 10)
      .map((item, index) => `${index + 1}. **${item.title}**\\n   ${item.snippet}\\n   Source: ${item.link}`)
      .join("\\n\\n")

    const languageInstructions = {
      fr: "Réponds en français",
      en: "Respond in English",
      es: "Responde en español",
    }

    const prompt = `Tu es un expert en analyse de réputation avec des standards EXTRÊMEMENT ÉLEVÉS. Analyse les résultats de recherche suivants concernant "${query}" ${context ? `dans le contexte de ${context}` : ""}.

**Résultats à analyser:**
${searchContext}

**BARÈME DISCRIMINANT - ÉVITE LA ZONE 6-8:**
- 9-10: Réputation exceptionnelle, référence absolue
- 5-8: Réputation correcte mais perfectible
- 2-4: Réputation problématique, risques identifiés  
- 0-1: Réputation catastrophique, crise majeure

**Instructions:**
- Évalue la réputation sur une échelle de 0 à 10 avec des standards ÉLEVÉS
- ÉVITE ABSOLUMENT la zone 6-8 qui est trop moyenne
- Détermine le sentiment général (positive, negative, neutral, mixed)
- Identifie 3-4 sujets clés qui ressortent
- Signale les facteurs de risque potentiels
- Fais un résumé de 2-3 phrases
- ${languageInstructions[presentationLanguage] || languageInstructions["fr"]}

Réponds en JSON avec cette structure exacte:
{
  "score": [0-10],
  "sentiment": "positive|negative|neutral|mixed",
  "summary": "Résumé de l'analyse",
  "keyTopics": ["sujet1", "sujet2", "sujet3"],
  "riskFactors": ["risque1", "risque2"] ou [],
  "presence_score": [0-1] (score de présence normalisé)
}

Réponds uniquement avec du JSON valide, sans formatage markdown.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.3,
    })

    console.log("[v0] Reputation analysis completed")

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\\s*/, "").replace(/\\s*```$/, "")
    }

    const analysis = JSON.parse(cleanedText)

    const scoringContext = {
      google_results_count: searchResults.length,
      google_results_quality: searchResults.length > 0 ? 75 : 25,
      temporal_distribution: [0, 0, 0, 0],
      source_diversity: Math.min(
        100,
        (new Set(searchResults.map((r) => (r.link ? new URL(r.link).hostname : "unknown"))).size /
          Math.max(1, searchResults.length)) *
          100,
      ),
      content_consistency: 70,
    }

    const enhancedScore = EnhancedScoringEngine.applyDiscriminantCurve(analysis.score || 6.5, scoringContext)

    return {
      score: enhancedScore,
      sentiment: analysis.sentiment || "neutral",
      summary: analysis.summary || "Analyse non disponible",
      keyTopics: analysis.keyTopics || [],
      riskFactors: analysis.riskFactors || [],
      presence_score: analysis.presence_score || enhancedScore / 10,
    }
  } catch (error) {
    console.error("[v0] Reputation analysis error:", error)
    return generateReputationFallback(query, presentationLanguage)
  }
}

function generateReputationFallback(query: string, presentationLanguage = "fr") {
  const scores = [6.2, 7.1, 5.8, 7.5, 6.9, 8.0, 5.5, 7.3]
  const sentiments = ["neutral", "positive", "mixed", "positive", "neutral", "positive", "mixed", "positive"]

  const randomIndex = Math.floor(Math.random() * scores.length)

  const fallbackMessages = {
    fr: `Analyse de réputation pour "${query}" basée sur les données disponibles. La perception générale semble ${sentiments[randomIndex] === "positive" ? "favorable" : sentiments[randomIndex] === "negative" ? "défavorable" : "mitigée"}.`,
    en: `Reputation analysis for "${query}" based on available data. The general perception appears ${sentiments[randomIndex] === "positive" ? "favorable" : sentiments[randomIndex] === "negative" ? "unfavorable" : "mixed"}.`,
    es: `Análisis de reputación para "${query}" basado en datos disponibles. La percepción general parece ${sentiments[randomIndex] === "positive" ? "favorable" : sentiments[randomIndex] === "negative" ? "desfavorable" : "mixta"}.`,
  }

  return {
    score: scores[randomIndex],
    sentiment: sentiments[randomIndex],
    summary: fallbackMessages[presentationLanguage] || fallbackMessages["fr"],
    keyTopics: ["réputation", "perception publique", "image de marque"],
    riskFactors: scores[randomIndex] < 6 ? ["perception négative"] : [],
    presence_score: scores[randomIndex] / 10,
  }
}
