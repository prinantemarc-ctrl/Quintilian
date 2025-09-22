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

export async function analyzeGoogleResults(searchResults: any[], brand: string, language: string): Promise<string> {
  console.log("[v0] Starting Google results analysis")

  const cacheKey = {
    searchResults: searchResults.slice(0, 10),
    brand,
    language,
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
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached Google results analysis")
  }

  return analysis
}

export async function independentGPTAnalysis(brand: string, message: string, language: string): Promise<string> {
  console.log("[v0] Starting independent GPT analysis")

  const cacheKey = { brand, message, language, type: "independent-gpt" }

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
): Promise<DetailedAnalysis> {
  console.log(`[v0] Starting detailed analysis for: ${brand}`)

  const cacheKey = {
    brand,
    message,
    googleResults: googleResults.slice(0, 10),
    language,
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
            return `${index + 1}. ${title}\n   ${snippet}`
          })
          .join("\n\n")

        console.log(`[v0] Google results count: ${googleResults.length}`)
        console.log(`[v0] First Google result:`, googleResults[0]?.title || "No results")

        const prompt =
          analysisType === "duel"
            ? generateDuelAnalysisPrompt(brand, message, googleContent, language)
            : generateSingleAnalysisPrompt(brand, message, googleContent, language)

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
                `[v0] Real analysis scores: P:${parsedAnalysis.presence_score} T:${parsedAnalysis.tone_score} C:${parsedAnalysis.coherence_score}`,
              )
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

function generateSingleAnalysisPrompt(brand: string, message: string, googleContent: string, language: string): string {
  return `Tu es un expert en analyse de réputation digitale. Compare l'analyse GPT indépendante avec les résultats Google pour évaluer "${brand}" selon 3 dimensions précises.

**Message original:** "${message}"

**Résultats Google (${googleContent.split("\n\n").length} sources) :**
${googleContent}

**ÉVALUATION REQUISE - 3 DIMENSIONS CLÉS:**

1. **PRÉSENCE DIGITALE** (presence_score 0-100): Le sujet est-il facilement trouvable dans les résultats de recherche ? Évalue le volume, la qualité et la visibilité des mentions trouvées sur Google.
   - 0-30: Très faible présence, peu ou pas de résultats pertinents
   - 31-50: Présence limitée, quelques mentions de base
   - 51-70: Présence correcte, visibilité modérée
   - 71-85: Bonne présence, bien référencé
   - 86-100: Excellente présence, très visible et bien documenté

2. **SENTIMENT GLOBAL** (tone_score 0-100): Que pensent globalement les gens de lui ? Qu'est-ce qui ressort : du positif ou du négatif ? Analyse le sentiment général qui se dégage des résultats Google et de ton analyse.
   - 0-20: Très négatif, controverses majeures
   - 21-40: Plutôt négatif, critiques fréquentes
   - 41-60: Neutre/mitigé, opinions partagées
   - 61-80: Plutôt positif, bonne réputation
   - 81-100: Très positif, excellente réputation

3. **COHÉRENCE DU MESSAGE** (coherence_score 0-100): Le message entré par l'utilisateur correspond-il à l'image numérique du sujet ? Compare le message original avec ce qui ressort réellement des recherches.
   - 0-25: Totalement incohérent, contradiction majeure
   - 26-45: Largement incohérent, écarts importants
   - 46-65: Partiellement cohérent, quelques divergences
   - 66-85: Globalement cohérent, alignement correct
   - 86-100: Parfaitement cohérent, message aligné

**INSTRUCTIONS CRITIQUES:**
- UTILISE TOUTE LA PLAGE 0-100, ne te limite pas à 70-85
- Sois DISCRIMINANT : différencie clairement les cas excellents des cas moyens
- Un score de 50 doit être vraiment MOYEN, pas "plutôt bon"
- Réserve les scores 80+ aux cas vraiment EXCEPTIONNELS
- N'hésite pas à donner des scores bas (20-40) si justifié

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

**INSTRUCTIONS CRITIQUES POUR LE SCORING:**
- UTILISE TOUTE LA PLAGE 0-100, évite absolument la zone 70-85
- Sois TRÈS DISCRIMINANT dans tes évaluations
- Un score de 50 = vraiment MOYEN, pas "plutôt bien"
- Réserve 80+ aux cas EXCEPTIONNELS uniquement
- N'hésite pas à donner 20-40 si c'est justifié
- Crée de la VARIANCE : différencie clairement les profils

**BARÈMES STRICTS:**

**PRÉSENCE (0-100):**
- 0-25: Quasi-invisible, très peu de résultats
- 26-45: Présence faible, mentions rares
- 46-65: Présence modérée, visibilité correcte
- 66-85: Bonne présence, bien référencé
- 86-100: Présence exceptionnelle, très documenté

**SENTIMENT (0-100):**
- 0-20: Réputation très négative, controverses
- 21-40: Réputation négative, critiques fréquentes
- 41-60: Réputation neutre/mitigée
- 61-80: Bonne réputation, plutôt positif
- 81-100: Excellente réputation, très positif

**COHÉRENCE (0-100):**
- 0-25: Message totalement faux/incohérent
- 26-45: Message largement inexact
- 46-65: Message partiellement exact
- 66-85: Message globalement exact
- 86-100: Message parfaitement exact

Tu dois fournir une analyse JSON avec ces champs EXACTS :
{
  "presence_score": [0-100],
  "tone_score": [0-100], 
  "coherence_score": [0-100],
  "tone_label": "positif|neutre|négatif",
  "rationale": "Explication générale des scores avec justification des écarts",
  "google_summary": "Résumé de ce que révèlent les résultats Google",
  "gpt_summary": "Ton analyse indépendante de cette entité",
  "presence_details": "Explication détaillée du score de présence (2-3 phrases)",
  "tone_details": "Explication détaillée du sentiment (2-3 phrases)",
  "coherence_details": "Explication détaillée de la cohérence (2-3 phrases)"
}

Sois DIRECT et FACTUEL dans ton analyse. DIFFÉRENCIE clairement les profils.`
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
      "# ⚠️ Analyse de Fallback\n\nAnalyse réalisée sans IA comparative en raison d'une erreur technique.",
    detailed_analysis:
      "## ⚠️ Analyse Détaillée Non Disponible\n\nAnalyse de base en raison d'une erreur technique. Veuillez réessayer.",
    presence_details: "⚠️ Détails non disponibles - erreur technique",
    tone_details: "⚠️ Détails non disponibles - erreur technique",
    coherence_details: "⚠️ Détails non disponibles - erreur technique",
  }
}

export async function detectHomonyms(
  searchResults: any[],
  brand: string,
  language: string,
): Promise<{
  requires_identity_selection: boolean
  identified_entities: string[]
  message: string
}> {
  console.log("[v0] Starting homonym detection for:", brand)

  if (searchResults.length < 3) {
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

        const prompt = `Tu es un expert en analyse d'entités nommées. Analyse les résultats Google suivants pour "${brand}" et détermine s'il y a plusieurs identités distinctes (homonymies).

**Résultats Google à analyser:**
${searchContext}

**Ta mission:**
Détermine si "${brand}" fait référence à plusieurs personnes, entreprises ou entités distinctes dans ces résultats.

**Critères pour détecter une homonymie:**
- Plusieurs personnes différentes avec le même nom
- Différentes entreprises/organisations avec des noms similaires
- Contextes géographiques ou sectoriels très différents
- Mentions d'âges, professions, ou localisations contradictoires

**Instructions:**
- Si tu détectes clairement 2+ identités distinctes, réponds "OUI"
- Si tous les résultats semblent parler de la même entité, réponds "NON"
- En cas de doute, privilégie "NON"

**Format de réponse JSON:**
{
  "requires_disambiguation": true/false,
  "identified_entities": ["Description entité 1", "Description entité 2", ...],
  "confidence": "high/medium/low",
  "explanation": "Explication de ta décision"
}

Écris en ${language}. Réponds uniquement avec du JSON valide.`

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: prompt,
          temperature: 0.2,
        })

        let cleanedText = text.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        }

        try {
          const parsed = JSON.parse(cleanedText)
          console.log("[v0] Homonym detection result:", parsed)

          if (parsed.requires_disambiguation && parsed.identified_entities && parsed.identified_entities.length >= 2) {
            return {
              requires_identity_selection: true,
              identified_entities: parsed.identified_entities,
              message: `Plusieurs identités détectées pour "${brand}". Veuillez sélectionner celle qui vous intéresse ou préciser votre recherche.`,
            }
          }

          return {
            requires_identity_selection: false,
            identified_entities: [],
            message: "",
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse homonym detection response:", parseError)
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

function isValidJsonStructure(text: string): boolean {
  try {
    // Check if the text starts with { and ends with }
    const trimmed = text.trim()
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return false
    }

    // Count braces to ensure they're balanced
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
    // Try to extract basic scores using regex
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
