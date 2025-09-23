import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { CACHE_TTL, analysisCache } from "@/lib/cache"

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

export async function analyzeGoogleResults(
  searchResults: any[],
  brand: string,
  language: string,
  presentationLanguage?: string,
): Promise<string> {
  console.log("[v0] Starting Google results analysis")

  const responseLanguage = presentationLanguage || language

  const cacheKey = {
    searchResults: searchResults.slice(0, 10),
    brand,
    language,
    presentationLanguage: responseLanguage,
    type: "google-analysis",
  }

  const { data: analysis, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
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

**Résultats Google à analyser (en ${language}):**
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
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached Google results analysis")
  }

  return analysis
}

export async function independentGPTAnalysis(
  brand: string,
  message: string,
  language: string,
  presentationLanguage?: string,
): Promise<string> {
  console.log("[v0] Starting independent GPT analysis")

  const responseLanguage = presentationLanguage || language

  const cacheKey = { brand, message, language, presentationLanguage: responseLanguage, type: "independent-gpt" }

  const { data: analysis, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
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
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached independent GPT analysis")
  }

  return analysis
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

  const cacheKey = {
    brand,
    message,
    googleResults: googleResults.slice(0, 10),
    language,
    presentationLanguage: responseLanguage,
    analysisType,
  }

  const { data: analysis, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
      try {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          console.error("[v0] CRITICAL: No OpenAI API key found - this will cause mock data!")
          console.error("[v0] Please check OPENAI_API_KEY environment variable")
          return generateFallbackAnalysis()
        }

        console.log("[v0] OpenAI API key found, proceeding with real analysis")

        const googleContent = googleResults
          .slice(0, 10)
          .map((item, index) => {
            const title = item.title || "Sans titre"
            const snippet = item.snippet || "Pas de description"
            return `${index + 1}. ${title}\\n   ${snippet}`
          })
          .join("\\n\\n")

        console.log(`[v0] Google results count: ${googleResults.length}`)
        console.log(`[v0] First Google result:`, googleResults[0]?.title || "No results")

        const prompt =
          analysisType === "duel"
            ? generateDuelAnalysisPrompt(brand, message, googleContent, language, responseLanguage)
            : generateSingleAnalysisPrompt(brand, message, googleContent, language, responseLanguage)

        console.log("[v0] Calling OpenAI for detailed analysis")

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000)

        try {
          const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            prompt: prompt,
            temperature: 0.3,
            maxTokens: 2000,
            abortSignal: controller.signal,
          })

          clearTimeout(timeoutId)
          console.log(`[v0] Detailed analysis completed for ${brand}`)
          console.log("[v0] Raw OpenAI response length:", text.length)

          let cleanedText = text.trim()
          if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
          }

          if (!isValidJsonStructure(cleanedText)) {
            console.error("[v0] JSON appears to be truncated or malformed")
            console.error("[v0] Text length:", cleanedText.length)
            console.error("[v0] First 500 chars:", cleanedText.substring(0, 500))
            console.error("[v0] Last 500 chars:", cleanedText.substring(cleanedText.length - 500))

            const partialAnalysis = extractPartialJsonData(cleanedText)
            if (partialAnalysis) {
              console.log("[v0] Using partial analysis data")
              return normalizeAnalysisResponse(partialAnalysis)
            }

            console.error("[v0] Falling back to mock data due to JSON validation failure")
            return generateFallbackAnalysis()
          }

          let parsedAnalysis
          try {
            parsedAnalysis = JSON.parse(cleanedText)
            console.log("[v0] Successfully parsed JSON response")

            if (parsedAnalysis.presence_score && parsedAnalysis.tone_score && parsedAnalysis.coherence_score) {
              console.log(
                `[v0] Analysis scores: P:${parsedAnalysis.presence_score} T:${parsedAnalysis.tone_score} C:${parsedAnalysis.coherence_score}`,
              )

              return normalizeAnalysisResponse(parsedAnalysis)
            } else {
              console.error("[v0] Missing required scores in parsed analysis")
            }
          } catch (parseError) {
            console.error("[v0] JSON parsing failed:", parseError)
            console.error("[v0] Raw text that failed to parse (first 1000 chars):", cleanedText.substring(0, 1000))

            const partialAnalysis = extractPartialJsonData(cleanedText)
            if (partialAnalysis) {
              console.log("[v0] Using partial analysis data after parse error")
              return normalizeAnalysisResponse(partialAnalysis)
            }

            console.error("[v0] Falling back to mock data due to JSON parse error")
            return generateFallbackAnalysis()
          }

          return normalizeAnalysisResponse(parsedAnalysis)
        } catch (openaiError) {
          clearTimeout(timeoutId)
          console.error("[v0] OpenAI API call failed:", openaiError)
          console.error("[v0] Error details:", {
            message: openaiError.message,
            name: openaiError.name,
            stack: openaiError.stack?.substring(0, 500),
          })
          console.error("[v0] Falling back to mock data due to OpenAI API error")
          return generateFallbackAnalysis()
        }
      } catch (error) {
        console.error(`[v0] Detailed analysis error for ${brand}:`, error)
        console.error("[v0] Falling back to mock data due to general error")
        return generateFallbackAnalysis()
      }
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log(`[v0] Using cached detailed analysis for ${brand}`)
  }

  return analysis
}

export async function generateDuelAnalyses(
  brand1: string,
  brand2: string,
  message: string,
  googleResults1: any[],
  googleResults2: any[],
  language: string,
  presentationLanguage?: string,
): Promise<[DetailedAnalysis, DetailedAnalysis]> {
  console.log(`[v0] Starting duel analyses for: ${brand1} vs ${brand2}`)

  // Generate both analyses independently
  const [analysis1, analysis2] = await Promise.all([
    generateDetailedAnalysis(brand1, message, googleResults1, language, "duel", presentationLanguage),
    generateDetailedAnalysis(brand2, message, googleResults2, language, "duel", presentationLanguage),
  ])

  const scores1 = [analysis1.presence_score, analysis1.tone_score, analysis1.coherence_score]
  const scores2 = [analysis2.presence_score, analysis2.tone_score, analysis2.coherence_score]

  const avg1 = scores1.reduce((a, b) => a + b) / 3
  const avg2 = scores2.reduce((a, b) => a + b) / 3

  // If scores are too similar (within 2 points), add small random differentiation
  if (Math.abs(avg1 - avg2) <= 2) {
    console.log("[v0] Applying small differentiation to avoid tie")
    const adjustment = Math.random() > 0.5 ? 3 : -3
    analysis1.coherence_score = Math.max(0, Math.min(100, analysis1.coherence_score + adjustment))
  }

  console.log(
    `[v0] Final duel scores: ${brand1} (${Math.round((analysis1.presence_score + analysis1.tone_score + analysis1.coherence_score) / 3)}) vs ${brand2} (${Math.round((analysis2.presence_score + analysis2.tone_score + analysis2.coherence_score) / 3)})`,
  )

  return [analysis1, analysis2]
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
  const randomVariance = () => Math.floor(Math.random() * 60) + 20

  console.error("[v0] GENERATING FALLBACK/MOCK DATA - This should not happen in production!")

  return {
    presence_score: randomVariance(),
    tone_score: randomVariance(),
    coherence_score: randomVariance(),
    tone_label: "neutre",
    rationale:
      "⚠️ DONNÉES DE FALLBACK - Analyse réalisée sans IA comparative en raison d'une erreur technique. Veuillez réessayer.",
    google_summary: "⚠️ Résumé non disponible - erreur API ou clé manquante",
    gpt_summary: "⚠️ Analyse non disponible - erreur API ou clé manquante",
    structured_conclusion:
      "# ⚠️ Analyse de Fallback\\n\\nAnalyse réalisée sans IA comparative en raison d'une erreur technique.",
    detailed_analysis:
      "## ⚠️ Analyse Détaillée Non Disponible\\n\\nAnalyse de base en raison d'une erreur technique. Veuillez réessayer.",
    presence_details: "⚠️ Détails non disponibles - erreur technique",
    tone_details: "⚠️ Détails non disponibles - erreur technique",
    coherence_details: "⚠️ Détails non disponibles - erreur technique",
  }
}

function isValidJsonStructure(text: string): boolean {
  try {
    const trimmed = text.trim()
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return false
    }

    let braceCount = 0
    for (const char of trimmed) {
      if (char === "{") braceCount++
      if (char === "}") braceCount--
    }

    return braceCount === 0
  } catch {
    return false
  }
}

function extractPartialJsonData(text: string): Partial<DetailedAnalysis> | null {
  try {
    const presenceMatch = text.match(/"presence_score":\s*(\d+)/)
    const toneMatch = text.match(/"tone_score":\s*(\d+)/)
    const coherenceMatch = text.match(/"coherence_score":\s*(\d+)/)
    const toneLabelMatch = text.match(/"tone_label":\s*"([^"]+)"/)
    const rationaleMatch = text.match(/"rationale":\s*"([^"]+)"/)

    if (presenceMatch && toneMatch && coherenceMatch) {
      return {
        presence_score: Number.parseInt(presenceMatch[1]),
        tone_score: Number.parseInt(toneMatch[1]),
        coherence_score: Number.parseInt(coherenceMatch[1]),
        tone_label: toneLabelMatch?.[1] || "neutre",
        rationale: rationaleMatch?.[1] || "Analyse partielle récupérée après erreur de parsing JSON.",
        google_summary: "Résumé non disponible - erreur de parsing",
        gpt_summary: "Analyse non disponible - erreur de parsing",
      }
    }
  } catch (error) {
    console.error("[v0] Failed to extract partial JSON data:", error)
  }

  return null
}

function generateSingleAnalysisPrompt(
  brand: string,
  message: string,
  googleContent: string,
  language: string,
  responseLanguage: string,
): string {
  return `Tu es un expert en analyse de réputation digitale. Analyse l'affirmation suivante concernant "${brand}" en utilisant les résultats Google fournis.

**Message original:** "${message}"
**Sources analysées:** Principalement en ${language}

**Résultats Google (${googleContent.split("\\n\\n").length} sources) :**
${googleContent}

**Instructions de scoring:**
- **Présence digitale (0-100)** : Quantité et qualité des mentions trouvées
- **Sentiment (0-100)** : Tonalité générale des mentions (0=très négatif, 50=neutre, 100=très positif)
- **Cohérence (0-100)** : Exactitude de l'affirmation par rapport aux sources (0=faux, 100=exact)

**Réponse JSON requise:**
{
  "presence_score": [0-100],
  "tone_score": [0-100], 
  "coherence_score": [0-100],
  "tone_label": "très négatif|négatif|neutre|positif|très positif",
  "rationale": "Justification détaillée des 3 scores",
  "google_summary": "Résumé factuel des résultats Google",
  "gpt_summary": "Ton analyse indépendante",
  "structured_conclusion": "Conclusion markdown 250-350 mots",
  "detailed_analysis": "Analyse approfondie markdown 400-500 mots"
}

Écris en ${responseLanguage}.`
}

function generateDuelAnalysisPrompt(
  brand: string,
  message: string,
  googleContent: string,
  language: string,
  responseLanguage: string,
): string {
  return `Tu es un expert en analyse de réputation digitale. Analyse l'affirmation suivante concernant "${brand}" dans le contexte d'un duel comparatif.

**Message:** "${message}"
**Entité:** ${brand}
**Sources:** ${language}

**RÉSULTATS GOOGLE:**
${googleContent}

**Instructions de scoring pour duel:**
- Sois précis et discriminant dans tes scores
- Évite les scores trop similaires entre candidats
- Justifie chaque score avec des exemples concrets

**Barèmes:**
- **Présence (0-100)** : Visibilité et quantité de mentions
- **Sentiment (0-100)** : Tonalité des mentions
- **Cohérence (0-100)** : Exactitude de l'affirmation

**JSON requis:**
{
  "presence_score": [0-100],
  "tone_score": [0-100],
  "coherence_score": [0-100],
  "tone_label": "positif|neutre|négatif",
  "rationale": "Justification des scores",
  "google_summary": "Résumé factuel Google",
  "gpt_summary": "Analyse indépendante",
  "presence_details": "Justification du score présence",
  "tone_details": "Justification du sentiment", 
  "coherence_details": "Justification de la cohérence"
}

Écris en ${responseLanguage}.`
}

export async function detectHomonyms(
  searchResults: any[],
  brand: string,
  language: string,
  presentationLanguage?: string,
  countries?: string[],
): Promise<{
  requires_identity_selection: boolean
  identified_entities: string[]
  message: string
}> {
  console.log("[v0] Starting homonym detection for:", brand)

  const responseLanguage = presentationLanguage || language

  if (searchResults.length < 1) {
    console.log("[v0] Not enough search results for homonym detection")
    return {
      requires_identity_selection: false,
      identified_entities: [],
      message: "",
    }
  }

  const cacheKey = {
    searchResults: searchResults.slice(0, 10),
    brand,
    language,
    presentationLanguage: responseLanguage,
    countries: countries?.sort() || [],
    type: "homonym-detection",
  }

  const { data: detection, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
      try {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          return {
            requires_identity_selection: false,
            identified_entities: [],
            message: "",
          }
        }

        const searchContext = searchResults
          .slice(0, 10)
          .map((item, index) => `${index + 1}. **${item.title}**\n   ${item.snippet}\n   Source: ${item.link}`)
          .join("\n\n")

        const prompt = `Tu es un expert en analyse d'entités nommées multilingue. Analyse les résultats Google suivants pour "${brand}" et détermine s'il y a plusieurs identités distinctes (homonymies).

**Résultats Google à analyser (sources multilingues):**
${searchContext}

**IMPORTANT:** Ces résultats proviennent de recherches dans plusieurs pays/langues. Tu dois identifier les entités distinctes quelle que soit la langue des résultats.

**Ta mission:**
Détermine si "${brand}" fait référence à plusieurs personnes, entreprises ou entités distinctes dans ces résultats.

**Critères pour détecter une homonymie:**
- Plusieurs personnes différentes avec le même nom
- Différentes entreprises/organisations avec des noms similaires
- Contextes géographiques ou sectoriels très différents
- Mentions d'âges, professions, ou localisations contradictoires
- Entités dans différentes langues/pays qui sont distinctes

**Instructions:**
- Si tu détectes clairement 2+ identités distinctes, réponds "OUI"
- Si tous les résultats semblent parler de la même entité, réponds "NON"
- En cas de doute, privilégie "NON"
- Identifie les entités dans TOUTES les langues présentes dans les résultats
- Décris chaque entité de manière claire et distinctive

**Format de réponse JSON:**
{
  "requires_disambiguation": true/false,
  "identified_entities": ["Description entité 1", "Description entité 2", ...],
  "confidence": "high/medium/low",
  "explanation": "Explication de ta décision"
}

Écris en ${responseLanguage}. Réponds uniquement avec du JSON valide.`

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: prompt,
          temperature: 0.2,
        })

        let cleanedText = text.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        }
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
        }

        try {
          const parsed = JSON.parse(cleanedText)
          console.log("[v0] Homonym detection result:", parsed)

          if (parsed.requires_disambiguation && parsed.identified_entities && parsed.identified_entities.length >= 2) {
            const message =
              responseLanguage === "en"
                ? `Multiple identities detected for "${brand}". Please select the one you're interested in or refine your search.`
                : responseLanguage === "es"
                  ? `Múltiples identidades detectadas para "${brand}". Por favor selecciona la que te interesa o refina tu búsqueda.`
                  : `Plusieurs identités détectées pour "${brand}". Veuillez sélectionner celle qui vous intéresse ou préciser votre recherche.`

            return {
              requires_identity_selection: true,
              identified_entities: parsed.identified_entities,
              message,
            }
          }

          return {
            requires_identity_selection: false,
            identified_entities: [],
            message: "",
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse homonym detection response:", parseError)
          console.error("[v0] Cleaned text that failed to parse:", cleanedText.substring(0, 500))
          return {
            requires_identity_selection: false,
            identified_entities: [],
            message: "",
          }
        }
      } catch (error) {
        console.error("[v0] Homonym detection error:", error)
        return {
          requires_identity_selection: false,
          identified_entities: [],
          message: "",
        }
      }
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached homonym detection")
  }

  return detection
}

export function forceDuelDifferentiation(
  analysis1: DetailedAnalysis,
  analysis2: DetailedAnalysis,
): [DetailedAnalysis, DetailedAnalysis] {
  const scores1 = [analysis1.presence_score, analysis1.tone_score, analysis1.coherence_score]
  const scores2 = [analysis2.presence_score, analysis2.tone_score, analysis2.coherence_score]

  const avg1 = scores1.reduce((a, b) => a + b) / 3
  const avg2 = scores2.reduce((a, b) => a + b) / 3

  // If scores are too similar (within 3 points), force differentiation
  if (Math.abs(avg1 - avg2) <= 3) {
    console.log("[v0] Forcing duel differentiation - scores too similar")

    // Apply small but decisive adjustments (3-5 points difference)
    const adjustment = Math.floor(Math.random() * 3) + 3 // 3-5 points

    // Randomly choose which one gets boosted
    if (Math.random() > 0.5) {
      analysis1.presence_score = Math.min(100, analysis1.presence_score + adjustment)
      analysis2.tone_score = Math.max(0, analysis2.tone_score - adjustment)
    } else {
      analysis2.presence_score = Math.min(100, analysis2.presence_score + adjustment)
      analysis1.tone_score = Math.max(0, analysis1.tone_score - adjustment)
    }

    console.log(`[v0] Applied differentiation: ±${adjustment} points`)
  }

  return [analysis1, analysis2]
}
