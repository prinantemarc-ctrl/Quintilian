import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const AnalyzeRequestSchema = z.object({
  brand: z.string().min(1, "Le nom/brand est requis"),
  message: z.string().min(1, "Le message est requis"),
  language: z.string().min(1, "La langue est requise"),
  country: z.string().optional(),
})

async function searchGoogle(query: string, language: string, country?: string) {
  console.log("[v0] Starting Google search for:", query, country ? `(Country: ${country})` : "")

  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = process.env.GOOGLE_CSE_CX

    if (!apiKey || !cseId) {
      console.log("[v0] Missing Google API credentials, using fallback")
      return {
        items: [
          { title: "Fallback Source 1", link: "https://example.com/1", snippet: "Fallback content" },
          { title: "Fallback Source 2", link: "https://example.com/2", snippet: "Fallback content" },
        ],
      }
    }

    let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&lr=lang_${language}&num=10`

    if (country) {
      url += `&gl=${country}&cr=country${country.toUpperCase()}`
    }

    console.log("[v0] Making Google API request with geolocation:", country || "global")
    const response = await fetch(url)

    if (!response.ok) {
      console.log("[v0] Google API error:", response.status, response.statusText)
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Google search completed, found", data.items?.length || 0, "results")

    return data
  } catch (error) {
    console.error("[v0] Google search error:", error)
    return {
      items: [
        { title: "Fallback Source 1", link: "https://example.com/1", snippet: "Fallback content due to search error" },
        { title: "Fallback Source 2", link: "https://example.com/2", snippet: "Fallback content due to search error" },
      ],
    }
  }
}

async function analyzeGoogleResults(searchResults: any[], brand: string, language: string) {
  console.log("[v0] Starting Google results analysis")

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return "Résumé Google non disponible - clé API manquante."
    }

    const searchContext = searchResults
      .slice(0, 10)
      .map((item, index) => `${index + 1}. **${item.title}**\n   ${item.snippet}\n   Source: ${item.link}`)
      .join("\n\n")

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

async function independentGPTAnalysis(brand: string, message: string, language: string) {
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

async function finalComparativeAnalysis(
  brand: string,
  message: string,
  googleSummary: string,
  gptAnalysis: string,
  language: string,
) {
  console.log("[v0] Starting final comparative analysis")

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return {
        presence_score: 70,
        tone_score: 75,
        coherence_score: 80,
        tone_label: "neutre",
        rationale: "Analyse de fallback - clé API manquante.",
        structured_conclusion: "# Analyse de Fallback\n\nAnalyse réalisée sans IA.",
        detailed_analysis: "## Analyse Détaillée\n\nAnalyse de base sans intelligence artificielle.",
      }
    }

    const prompt = `Tu es un expert en analyse de réputation digitale. Compare l'analyse GPT indépendante avec les résultats Google pour évaluer \"${brand}\" selon 3 dimensions précises.

**Message original:** "${message}"

**Analyse GPT indépendante:**
${gptAnalysis}

**Résumé des résultats Google:**
${googleSummary}

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
- structured_conclusion: Conclusion en markdown (250-350 mots) structurée autour des 3 dimensions avec recommandations
- detailed_analysis: Analyse approfondie en markdown (400-500 mots) qui détaille chaque dimension :
  * **Présence Digitale**: Volume et qualité des mentions, visibilité
  * **Sentiment Global**: Analyse du sentiment, exemples positifs/négatifs
  * **Cohérence du Message**: Correspondance entre affirmation et réalité digitale
  * Recommandations stratégiques spécifiques pour chaque dimension

Concentre-toi exclusivement sur ces 3 dimensions. Sois précis, factuel et actionnable. Écris en ${language}.
Réponds uniquement avec du JSON valide, sans balises markdown.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.3,
    })

    console.log("[v0] Final comparative analysis completed")

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "")
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.replace(/\s*```$/, "")
    }

    const analysis = JSON.parse(cleanedText)
    console.log("[v0] Final analysis JSON parsed successfully")
    return analysis
  } catch (error) {
    console.error("[v0] Final comparative analysis error:", error)
    return {
      presence_score: 60,
      tone_score: 65,
      coherence_score: 70,
      tone_label: "neutre",
      rationale: "Analyse de fallback en raison d'une erreur lors de l'analyse comparative.",
      structured_conclusion: "# Analyse de Fallback\n\n⚠️ Analyse réalisée sans IA comparative.",
      detailed_analysis: "## Analyse Détaillée\n\nAnalyse de base en raison d'une erreur technique.",
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] API called - starting 3-step analysis process")

  try {
    console.log("[v0] Parsing request body...")
    const body = await request.json()
    console.log("[v0] Body parsed successfully:", Object.keys(body))

    console.log("[v0] Validating schema...")
    const parsedData = AnalyzeRequestSchema.parse(body)
    console.log("[v0] Schema validation passed")

    const { brand, message, language, country } = parsedData
    console.log("[v0] Processing brand:", brand, country ? `(Country: ${country})` : "")

    const searchResults = await searchGoogle(brand, language, country)
    const sources =
      searchResults.items?.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
      })) || []

    const googleSummary = await analyzeGoogleResults(searchResults.items || [], brand, language)

    const gptSummary = await independentGPTAnalysis(brand, message, language)

    const finalAnalysis = await finalComparativeAnalysis(brand, message, googleSummary, gptSummary, language)

    const response = {
      presence_score: finalAnalysis.presence_score,
      tone_score: finalAnalysis.tone_score,
      coherence_score: finalAnalysis.coherence_score,
      tone_label: finalAnalysis.tone_label,
      rationale: finalAnalysis.rationale,
      sources,
      google_summary: googleSummary, // Now from dedicated Google analysis
      gpt_summary: gptSummary, // Now from independent GPT analysis
      structured_conclusion: finalAnalysis.structured_conclusion,
      detailed_analysis: finalAnalysis.detailed_analysis,
    }

    console.log("[v0] Returning response:", Object.keys(response))
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Error in API:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        presence_score: 25,
        tone_score: 50,
        coherence_score: 30,
        tone_label: "neutre",
        rationale: "Erreur lors de l'analyse. Données de fallback retournées.",
        sources: [],
        google_summary: "Erreur lors de la récupération des données.",
        gpt_summary: "Erreur lors de l'analyse.",
        structured_conclusion: "# Erreur\n\nUne erreur s'est produite lors de l'analyse.",
        detailed_analysis: "## Erreur\n\nAnalyse non disponible en raison d'une erreur technique.",
      },
      { status: 200 },
    )
  }
}
