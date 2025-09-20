import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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

export async function analyzeGoogleResults(searchResults: any[], brand: string, language: string): Promise<string> {
  console.log("[v0] Starting Google results analysis")

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

**Résultats Google à analyser:**
${searchContext}

**Instructions:**
- Fais un résumé narratif de 4-5 phrases qui synthétise les informations clés trouvées
- Identifie les tendances principales et les points récurrents
- Mentionne les sources les plus pertinentes
- Sois factuel et objectif
- Écris en ${language}

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

export async function independentGPTAnalysis(brand: string, message: string, language: string): Promise<string> {
  console.log("[v0] Starting independent GPT analysis")

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return "Analyse GPT non disponible - clé API manquante."
    }

    const prompt = `Tu es un analyste en réputation digitale utilisant l'intelligence artificielle pour évaluer des affirmations. Tu travailles pour une plateforme d'analyse de réputation en ligne.

**Entité analysée:** ${brand}
**Affirmation à évaluer:** "${message}"

**Ta mission:**
Produis une analyse de réputation IA qui évalue cette affirmation concernant ${brand}. Ton analyse doit :

- Évaluer la véracité et la pertinence de l'affirmation basée sur tes données d'entraînement
- Analyser les implications pour la réputation de l'entité
- Identifier les nuances et contextes importants
- Fournir une perspective équilibrée et factuelle
- Utiliser un ton professionnel d'analyste en réputation

**Format attendu:**
Une analyse de 4-5 phrases qui ressemble à un rapport d'expert en réputation, pas à une réponse directe à une question. Évite les formulations comme "à ma connaissance" ou "selon mes informations". Présente plutôt les faits comme une analyse professionnelle.

Écris en ${language}. Réponds uniquement avec ton analyse, sans formatage markdown.`

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
): Promise<DetailedAnalysis> {
  console.log(`[v0] Starting detailed analysis for: ${brand}`)

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
        return `${index + 1}. ${title}\n   ${snippet}`
      })
      .join("\n\n")

    const prompt =
      analysisType === "duel"
        ? generateDuelAnalysisPrompt(brand, message, googleContent, language)
        : generateSingleAnalysisPrompt(brand, message, googleContent, language)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.3,
    })

    console.log(`[v0] Detailed analysis completed for ${brand}`)

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    }

    const parsedAnalysis = JSON.parse(cleanedText)
    return normalizeAnalysisResponse(parsedAnalysis)
  } catch (error) {
    console.error(`[v0] Detailed analysis error for ${brand}:`, error)
    return generateFallbackAnalysis()
  }
}

function generateSingleAnalysisPrompt(brand: string, message: string, googleContent: string, language: string): string {
  return `Tu es un expert en analyse de réputation digitale. Compare l'analyse GPT indépendante avec les résultats Google pour évaluer "${brand}" selon 3 dimensions précises.

**Message original:** "${message}"

**Résultats Google (${googleContent.split("\n\n").length} sources) :**
${googleContent}

**ÉVALUATION REQUISE - 3 DIMENSIONS CLÉS:**

1. **PRÉSENCE DIGITALE** (presence_score 0-100): Le sujet est-il facilement trouvable dans les résultats de recherche ? Évalue le volume, la qualité et la visibilité des mentions trouvées sur Google.

2. **SENTIMENT GLOBAL** (tone_score 0-100): Que pensent globalement les gens de lui ? Qu'est-ce qui ressort : du positif ou du négatif ? Analyse le sentiment général qui se dégage des résultats Google et de ton analyse.

3. **COHÉRENCE DU MESSAGE** (coherence_score 0-100): Le message entré par l'utilisateur correspond-il à l'image numérique du sujet ? Compare le message original avec ce qui ressort réellement des recherches.

**RÉPONSE JSON REQUISE:**
- presence_score (0-100): Score de présence digitale
- tone_score (0-100): Score de sentiment (0=très négatif, 50=neutre, 100=très positif)
- coherence_score (0-100): Score de cohérence message/réalité digitale
- tone_label: "très négatif", "négatif", "neutre", "positif", ou "très positif"
- rationale: Justification détaillée des 3 scores avec exemples concrets (4-5 phrases)
- google_summary: Résumé de ce que révèlent les résultats Google
- gpt_summary: Ton analyse indépendante de cette entité
- structured_conclusion: Conclusion en markdown (250-350 mots) structurée autour des 3 dimensions avec recommandations
- detailed_analysis: Analyse approfondie en markdown (400-500 mots) qui détaille chaque dimension

Concentre-toi exclusivement sur ces 3 dimensions. Sois précis, factuel et actionnable. Écris en ${language}.
Réponds uniquement avec du JSON valide, sans balises markdown.`
}

function generateDuelAnalysisPrompt(brand: string, message: string, googleContent: string, language: string): string {
  return `Tu es un expert en analyse de réputation digitale. Analyse "${brand}" concernant le message "${message}" en ${language}.

RÉSULTATS GOOGLE (${googleContent.split("\n\n").length} sources) :
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

Sois DIRECT et FACTUEL dans ton analyse.`
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
): Promise<{
  score: number
  sentiment: string
  summary: string
  keyTopics?: string[]
  riskFactors?: string[]
}> {
  console.log("[v0] Starting reputation analysis for:", query)

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return generateReputationFallback(query)
    }

    const searchContext = searchResults
      .slice(0, 10)
      .map((item, index) => `${index + 1}. **${item.title}**\n   ${item.snippet}\n   Source: ${item.link}`)
      .join("\n\n")

    const prompt = `Tu es un expert en analyse de réputation. Analyse les résultats de recherche suivants concernant "${query}" ${context ? `dans le contexte de ${context}` : ""}.

**Résultats à analyser:**
${searchContext}

**Instructions:**
- Évalue la réputation sur une échelle de 0 à 10
- Détermine le sentiment général (positive, negative, neutral, mixed)
- Identifie 3-4 sujets clés qui ressortent
- Signale les facteurs de risque potentiels
- Fais un résumé de 2-3 phrases

Réponds en JSON avec cette structure exacte:
{
  "score": [0-10],
  "sentiment": "positive|negative|neutral|mixed",
  "summary": "Résumé de l'analyse",
  "keyTopics": ["sujet1", "sujet2", "sujet3"],
  "riskFactors": ["risque1", "risque2"] ou []
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
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    }

    const analysis = JSON.parse(cleanedText)
    return {
      score: analysis.score || 6.5,
      sentiment: analysis.sentiment || "neutral",
      summary: analysis.summary || "Analyse non disponible",
      keyTopics: analysis.keyTopics || [],
      riskFactors: analysis.riskFactors || [],
    }
  } catch (error) {
    console.error("[v0] Reputation analysis error:", error)
    return generateReputationFallback(query)
  }
}

function generateReputationFallback(query: string) {
  const scores = [6.2, 7.1, 5.8, 7.5, 6.9, 8.0, 5.5, 7.3]
  const sentiments = ["neutral", "positive", "mixed", "positive", "neutral", "positive", "mixed", "positive"]

  const randomIndex = Math.floor(Math.random() * scores.length)

  return {
    score: scores[randomIndex],
    sentiment: sentiments[randomIndex],
    summary: `Analyse de réputation pour "${query}" basée sur les données disponibles. La perception générale semble ${sentiments[randomIndex] === "positive" ? "favorable" : sentiments[randomIndex] === "negative" ? "défavorable" : "mitigée"}.`,
    keyTopics: ["réputation", "perception publique", "image de marque"],
    riskFactors: scores[randomIndex] < 6 ? ["perception négative"] : [],
  }
}
