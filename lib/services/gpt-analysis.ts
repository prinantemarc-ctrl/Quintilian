import { CACHE_TTL, analysisCache } from "@/lib/cache"

export interface AnalysisScores {
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
}

export interface AdvancedMetrics {
  source_quality: {
    tier1_percentage: number // % sources Tier 1 (NYT, Wikipedia, etc.)
    tier2_percentage: number // % sources Tier 2 (médias régionaux)
    tier3_percentage: number // % sources Tier 3 (réseaux sociaux, blogs)
    dominant_tier: "tier1" | "tier2" | "tier3"
  }
  information_freshness: {
    recent_percentage: number // % sources < 6 mois
    old_percentage: number // % sources > 6 mois
    average_age_months: number
  }
  geographic_diversity: {
    local_percentage: number
    national_percentage: number
    international_percentage: number
    dominant_scope: "local" | "national" | "international"
  }
  coverage_type: {
    in_depth_percentage: number // Articles de fond
    brief_percentage: number // Brèves
    mention_percentage: number // Simples mentions
    dominant_type: "in_depth" | "brief" | "mention"
  }
  polarization: {
    neutral_percentage: number
    oriented_percentage: number
    bias_level: "neutral" | "slightly_biased" | "highly_biased"
  }
  risk_level: {
    score: number // 0-100
    category: "low" | "moderate" | "high" | "critical"
    main_threats: string[]
  }
  reputation_index: {
    score: number // 0-100
    trend: "improving" | "stable" | "declining"
    health_status: "excellent" | "good" | "fair" | "poor"
  }
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
  key_takeaway?: string
  risks?: string[]
  strengths?: string[]
  advanced_metrics?: AdvancedMetrics
}

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error("[v0] OPENAI_API_KEY is missing!")
} else {
  console.log("[v0] OPENAI_API_KEY found:", `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`)
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  options: {
    temperature?: number
    max_tokens?: number
    response_format?: { type: string }
  } = {},
) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set")
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 500,
      response_format: options.response_format,
    }),
    cache: "no-store", // Required for Next.js 15 API routes
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] OpenAI API error:", response.status, errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
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
        const searchContext = searchResults
          .slice(0, 10)
          .map((item) => `**${item.title}**\n   ${item.snippet}\n   Source: ${item.link}`)
          .join("\n\n")

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

        console.log("[v0] Calling OpenAI API for Google results analysis...")

        const text = await callOpenAI([{ role: "user", content: prompt }], {
          temperature: 0.3,
          max_tokens: 500,
        })

        console.log("[v0] OpenAI response length:", text.length)
        console.log("[v0] Google results analysis completed")
        return text.trim()
      } catch (error) {
        console.error("[v0] Google results analysis error:", error)
        console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
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
  console.log("[v0] Starting independent IA analysis") // Updated log message

  const responseLanguage = presentationLanguage || language

  const cacheKey = {
    brand,
    message,
    language,
    presentationLanguage: responseLanguage,
    type: "independent-gpt",
  }

  const { data: analysis, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
      try {
        const prompt = `Tu es un expert en analyse de réputation en ligne. Sans effectuer de recherches externes, analyse le contexte suivant et fournis une évaluation objective.

**Entité à analyser:** "${brand}"
**Contexte utilisateur:** "${message}"
**Langue du contexte:** ${language}

**Instructions:**
- Base ton analyse uniquement sur tes connaissances préalables et le contexte fourni
- Fournis une perspective neutre et équilibrée
- Identifie les forces et faiblesses potentielles de réputation
- Mentionne les risques ou opportunités éventuels
- Réponds en ${responseLanguage}

Réponds avec un paragraphe analytique de 4-5 phrases, sans formatage markdown.`

        console.log("[v0] Calling OpenAI API for independent GPT analysis...")

        const text = await callOpenAI([{ role: "user", content: prompt }], {
          temperature: 0.5,
          max_tokens: 500,
        })

        console.log("[v0] GPT analysis completed")
        return text.trim()
      } catch (error) {
        console.error("[v0] Independent GPT analysis error:", error)
        console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
        return "Erreur lors de l'analyse GPT indépendante."
      }
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached GPT analysis")
  }

  return analysis
}

export const independentAIAnalysis = independentGPTAnalysis

export async function generateDetailedAnalysis(
  brand: string,
  message: string,
  googleResults: any[],
  language: string,
  analysisType: "single" | "duel" = "single",
  presentationLanguage?: string,
  hasMessage = true,
): Promise<
  DetailedAnalysis & {
    key_takeaway?: string
    risks?: string[]
    strengths?: string[]
    advanced_metrics?: AdvancedMetrics
  }
> {
  console.log(`[v0] Starting detailed analysis generation for: ${brand}`)

  const responseLanguage = presentationLanguage || language

  const cacheKey = {
    brand,
    message,
    googleResults: googleResults.slice(0, 10).map((r) => ({ title: r.title, link: r.link })),
    language,
    analysisType,
    presentationLanguage: responseLanguage,
    hasMessage,
    type: "detailed-analysis-v5", // Updated cache version for new metrics
  }

  const { data: analysisResult, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
      try {
        console.log("[v0] Google results count:", googleResults.length)
        if (googleResults.length > 0) {
          console.log("[v0] First Google result:", googleResults[0].title)
        }

        const googleContent = googleResults
          .slice(0, 10)
          .map((item) => {
            const title = item.title || "Sans titre"
            const snippet = item.snippet || "Pas de description"
            return `**${title}**\n   ${snippet}\n   ${item.link}`
          })
          .join("\n\n")

        let prompt: string

        const metricsSection = `
**MÉTRIQUES AVANCÉES À CALCULER (advanced_metrics):**

1. **source_quality**: Analyse la qualité des sources crawlées:
   - tier1_percentage: % de sources haute autorité (Wikipedia, NYT, Le Monde, Forbes, sites .edu/.gov)
   - tier2_percentage: % médias régionaux, presse spécialisée, blogs reconnus
   - tier3_percentage: % réseaux sociaux, annuaires, sites de faible autorité
   - dominant_tier: "tier1"|"tier2"|"tier3" (la catégorie majoritaire)

2. **information_freshness**: Fraîcheur des informations:
   - recent_percentage: % de sources datant de moins de 6 mois
   - old_percentage: % de sources de plus de 6 mois
   - average_age_months: âge moyen estimé en mois

3. **geographic_diversity**: Distribution géographique:
   - local_percentage: % sources locales/régionales
   - national_percentage: % sources nationales
   - international_percentage: % sources internationales
   - dominant_scope: "local"|"national"|"international"

4. **coverage_type**: Type de couverture médiatique:
   - in_depth_percentage: % articles de fond (>500 mots estimés)
   - brief_percentage: % brèves (100-500 mots estimés)
   - mention_percentage: % simples mentions (<100 mots estimés)
   - dominant_type: "in_depth"|"brief"|"mention"

5. **polarization**: Orientation politique/éditoriale:
   - neutral_percentage: % sources neutres/objectives
   - oriented_percentage: % sources orientées politiquement
   - bias_level: "neutral"|"slightly_biased"|"highly_biased"

6. **risk_level**: Niveau de risque réputationnel:
   - score: 0-100 (0=aucun risque, 100=risque critique)
   - category: "low"|"moderate"|"high"|"critical"
   - main_threats: array de 2-3 menaces principales identifiées

7. **reputation_index**: Indice de réputation global:
   - score: 0-100 (santé globale de la réputation)
   - trend: "improving"|"stable"|"declining" (tendance)
   - health_status: "excellent"|"good"|"fair"|"poor"
`

        if (hasMessage) {
          prompt = `Tu es un analyste OSINT opérationnel spécialisé en intelligence digitale. Target: "${brand}". Langue de sortie: ${responseLanguage}.

**INTEL SOURCES (en ${language}):**
${googleContent}

**HYPOTHÈSE À VÉRIFIER:** "${message}"

**⚠️ PROTOCOLE: Ne référence JAMAIS les sources par numéro. Utilise: "selon les renseignements recueillis", "l'analyse OSINT révèle", "les traces numériques montrent", "selon les données crawlées", "les sources ouvertes indiquent".**

**VECTEURS D'ANALYSE:**

1. **EMPREINTE NUMÉRIQUE (score/100)**: Visibilité cross-platform, diversité des vecteurs d'exposition, autorité des domaines indexés
2. **SENTIMENT GLOBAL (score/100)**: Polarisation de l'opinion (hostile=0, neutre=50, favorable=100)
3. **ALIGNEMENT INTEL (score/100)**: Corrélation entre hypothèse et data crawlée
${metricsSection}

**RAPPORT EXÉCUTIF (structured_conclusion) - 3-4 sections markdown, 150+ mots/section:**

## Empreinte Numérique
Mapping détaillé de la présence: vecteurs identifiés (encyclopédies en ligne, médias mainstream/alternatifs, plateformes officielles, réseaux sociaux, forums), autorité PageRank des domaines, distribution géographique, timestamps de publication. Identification des canaux dominants et zones aveugles. Langage opérationnel, pas de numérotation de sources.

## Polarisation du Sentiment
Analyse comportementale approfondie avec cas d'usage concrets (pas de "source X"): distribution hostile/neutre/favorable avec patterns extraits du crawl, triggers émotionnels identifiés, analyse des narratives, évolution temporelle, divergences entre communication officielle et perception communautaire.

## Risques et Atouts Stratégiques
Atouts: Leviers réputationnels (leadership sectoriel, expertise reconnue, capital communautaire, achievements documentés, couverture médiatique positive)
Risques: Menaces réputationnelles (controverses actives, critiques récurrentes, compétition agressive, vulnérabilités de communication)

**ANALYSE TERRAIN (detailed_analysis) - 3 sections obligatoires, 200+ mots/section:**

## Analyse OSINT des Résultats Crawlés
Dissection méthodique des traces web de manière FLUIDE et PROFESSIONNELLE:
- **Classification**: Typologie (Wikipédia, médias tier-1/tier-2, presse spécialisée, sites officiels, social platforms, underground forums)
- **Trustrank**: Crédibilité des domaines (mentionne "sources haute autorité", "médias vérifiés", "plateformes tier-1")
- **Freshness**: Fraîcheur temporelle des traces
- **Sémantique**: Keywords dominants, clusters thématiques
- **Narratives**: Storytelling détecté, convergences/contradictions
- **Anomalies**: Patterns suspects, contradictions, data gaps
- **Géolocalisation**: Distribution géo et linguistique des sources
**PROTOCOLE: Nomme les sources par type (ex: "Wikipédia révèle", "les médias sportifs couvrent"), JAMAIS par index numérique.**

## Projection IA Générative
Perception algorithmique par les LLMs (ChatGPT, Claude, Gemini, Perplexity):
- Knowledge base des IA
- Sources primaires exploitées par les modèles
- Biais de représentation potentiels
- Risques de hallucination/désinformation
- Opportunités d'optimisation SEO-IA
- Recommandations actionnables

## Vue Stratégique OSINT Complète
Synthèse globale avec méthodologie renseignement open source:
- Cartographie exhaustive de la surface d'attaque digitale
- Forces structurelles et avantages tactiques
- Vulnérabilités systémiques et vecteurs d'attaque
- Benchmarking contextuel si applicable
- Détection de signaux faibles et tendances émergentes
- Forecast réputationnel
- Recommandations stratégiques opérationnelles

**OUTPUT JSON:**
{
  "presence_score": <0-100>,
  "tone_score": <0-100>,
  "coherence_score": <0-100>,
  "tone_label": "<positif|neutre|négatif>",
  "rationale": "<synthèse analytique 4-5 phrases, langage renseignement>",
  "google_summary": "<rapport factuel avec données concrètes, SANS numéros (100+ mots)>",
  "gpt_summary": "<analyse contextuelle intel, SANS numéros (100+ mots)>",
  "structured_conclusion": "<markdown ##, MINIMUM 450 mots, SANS numéros>",
  "detailed_analysis": "<markdown 3 sections, MINIMUM 600 mots, SANS numéros>",
  "advanced_metrics": {
    "source_quality": { "tier1_percentage": <0-100>, "tier2_percentage": <0-100>, "tier3_percentage": <0-100>, "dominant_tier": "<tier1|tier2|tier3>" },
    "information_freshness": { "recent_percentage": <0-100>, "old_percentage": <0-100>, "average_age_months": <number> },
    "geographic_diversity": { "local_percentage": <0-100>, "national_percentage": <0-100>, "international_percentage": <0-100>, "dominant_scope": "<local|national|international>" },
    "coverage_type": { "in_depth_percentage": <0-100>, "brief_percentage": <0-100>, "mention_percentage": <0-100>, "dominant_type": "<in_depth|brief|mention>" },
    "polarization": { "neutral_percentage": <0-100>, "oriented_percentage": <0-100>, "bias_level": "<neutral|slightly_biased|highly_biased>" },
    "risk_level": { "score": <0-100>, "category": "<low|moderate|high|critical>", "main_threats": ["<threat1>", "<threat2>"] },
    "reputation_index": { "score": <0-100>, "trend": "<improving|stable|declining>", "health_status": "<excellent|good|fair|poor>" }
  }
}

**RÈGLES D'ENGAGEMENT:**
- INTERDIT: "(source 1)", "(sources 2, 5)", numérotation quelconque
- OBLIGATOIRE: Langage OSINT/renseignement underground pro - "traces", "vecteurs", "intel", "crawl", "surface d'attaque", "signaux"
- Style: Analyste stratégique, pas académique
- Précision, données factuelles, approche terrain
- MINIMUM 750 mots detailed_analysis, 450 structured_conclusion
- CALCULER les métriques avancées avec précision

Réponds UNIQUEMENT avec le JSON, sans backticks.`
        } else {
          prompt = `Tu es un analyste OSINT opérationnel en intelligence digitale. Mission: profiling de "${brand}". Output en ${responseLanguage}.

**DONNÉES CRAWLÉES (en ${language}):**
${googleContent}

**⚠️ PROTOCOLE: Jamais de numéros de sources. Utilise: "les renseignements collectés", "l'OSINT révèle", "selon les traces crawlées", "les données ouvertes montrent", "les plateformes indexées indiquent".**

**VECTEURS D'ANALYSE (SANS hypothèse à vérifier):**

1. **EMPREINTE DIGITALE (score/100)**: Présence cross-platform, diversité des vecteurs, autorité domain, couverture médiatique
2. **POLARISATION GLOBALE (score/100)**: Sentiment agrégé (hostile=0, neutre=50, favorable=100)
3. **PAS DE SCORE D'ALIGNEMENT** (pas d'hypothèse à checker)
${metricsSection}

**ÉLÉMENTS TACTIQUES:**
- **key_takeaway**: UNE phrase percutante résumant l'essentiel (max 20 mots)
- **risks**: 3 menaces réputationnelles factuelles (courts, précis)
- **strengths**: 3 atouts stratégiques factuels (courts, précis)

**RAPPORT EXÉCUTIF (structured_conclusion) - 3 sections markdown, 150+ mots/section:**

## Empreinte Digitale
Audit approfondi de la visibilité: typologie des traces (encyclopédies type Wikipédia, médias mainstream/alternatifs, plateformes officielles, réseaux sociaux, forums), autorité des domaines, couverture géographique, freshness temporelle. Analyse des vecteurs dominants et blind spots. **Langage opérationnel, pas de numéros.**

## Polarisation du Sentiment
Analyse comportementale avec cas concrets (jamais "source X"): distribution hostile/neutre/favorable, triggers émotionnels, narratives détectées, controverses vs consensus, comparaison communication officielle vs perception communautaire.

## Briefing Stratégique
Synthèse consolidée: identité et positionnement, atouts (leadership, expertise, notoriété), vulnérabilités (controverses, critiques, failles), recommandations, forecast. **Nomme les sources par type, jamais par index.**

**ANALYSE TERRAIN (detailed_analysis) - 3 sections obligatoires, 250+ mots/section:**

## Analyse OSINT des Sources Crawlées
Approche méthodique renseignement sur les résultats, langage NATUREL:
- **Classification**: Catégorisation (Wikipédia, médias tier-1/2, presse spécialisée, plateformes officielles, social media, underground)
- **Trustrank**: Fiabilité des domaines (utilise "sources haute autorité", "plateformes vérifiées")
- **Freshness**: Récence des traces
- **Sémantique**: Keywords, clusters thématiques
- **Storytelling**: Narratives, convergences/divergences
- **Anomalies**: Patterns suspects, contradictions, gaps
- **Distribution**: Géographique, linguistique, segmentation audience
**Réfère aux sources par nature (ex: "Wikipédia documente", "les médias rapportent"), JAMAIS par numéro.**

## Projection IA Générative
Perception de la target par les LLMs (ChatGPT, Claude, Gemini, Perplexity):
- Synthèse knowledge base IA
- Sources primaires LLM
- Biais de représentation potentiels
- Risques informationnels (hallucinations)
- Optimisations possibles
- Actions recommandées

## Vue Stratégique Complète OSINT
Synthèse globale avec méthodologie renseignement rigoureuse:
- Cartographie complète surface digitale
- Forces structurelles et avantages compétitifs
- Vulnérabilités et vecteurs d'attaque
- Benchmarking contextuel si pertinent
- Signaux faibles et tendances émergentes
- Forecast trajectoire
- Recommandations stratégiques actionnables

**OUTPUT JSON:**
{
  "presence_score": <0-100>,
  "tone_score": <0-100>,
  "coherence_score": null,
  "tone_label": "<positif|neutre|négatif>",
  "rationale": "<synthèse narrative PRÉCISE, langage renseignement, 4-5 phrases>",
  "google_summary": "<rapport factuel avec NOMS, FAITS, DATES, SANS numéros (150+ mots)>",
  "gpt_summary": "<analyse contextuelle approfondie, SANS numéros (150+ mots)>",
  "structured_conclusion": "<markdown ##, MINIMUM 450 mots, SANS numéros>",
  "detailed_analysis": "<markdown 3 sections complètes, MINIMUM 750 mots, SANS numéros>",
  "key_takeaway": "<phrase percutante (15-20 mots max)>",
  "risks": ["<risque 1>", "<risque 2>", "<risque 3>"],
  "strengths": ["<force 1>", "<force 2>", "<force 3>"],
  "advanced_metrics": {
    "source_quality": { "tier1_percentage": <0-100>, "tier2_percentage": <0-100>, "tier3_percentage": <0-100>, "dominant_tier": "<tier1|tier2|tier3>" },
    "information_freshness": { "recent_percentage": <0-100>, "old_percentage": <0-100>, "average_age_months": <number> },
    "geographic_diversity": { "local_percentage": <0-100>, "national_percentage": <0-100>, "international_percentage": <0-100>, "dominant_scope": "<local|national|international>" },
    "coverage_type": { "in_depth_percentage": <0-100>, "brief_percentage": <0-100>, "mention_percentage": <0-100>, "dominant_type": "<in_depth|brief|mention>" },
    "polarization": { "neutral_percentage": <0-100>, "oriented_percentage": <0-100>, "bias_level": "<neutral|slightly_biased|highly_biased>" },
    "risk_level": { "score": <0-100>, "category": "<low|moderate|high|critical>", "main_threats": ["<threat1>", "<threat2>"] },
    "reputation_index": { "score": <0-100>, "trend": "<improving|stable|declining>", "health_status": "<excellent|good|fair|poor>" }
  }
}

**RÈGLES D'ENGAGEMENT:**
- INTERDIT: "(source 1)", "(sources 2, 5, 9)", numérotation
- OBLIGATOIRE: Langage OSINT/underground pro - "traces", "vecteurs", "intel", "crawl", "surface d'attaque", "signaux"
- Style: Analyste renseignement, pas académique
- Précision, données factuelles, approche terrain
- MINIMUM 750 mots detailed_analysis, 450 structured_conclusion
- CALCULER les métriques avancées avec précision

JSON pur sans backticks`
        }

        console.log("[v0] Calling OpenAI API for detailed analysis...")
        console.log("[v0] Prompt length:", prompt.length)

        const text = await callOpenAI([{ role: "user", content: prompt }], {
          temperature: 0.3,
          max_tokens: 4500, // Increased for advanced metrics
          response_format: { type: "json_object" },
        })

        let cleanedText = text.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\n?/, "").replace(/\n?```$/, "")
        }

        const parsed = JSON.parse(cleanedText)

        console.log("[v0] Parsed advanced_metrics:", JSON.stringify(parsed.advanced_metrics, null, 2))
        console.log("[v0] Detailed analysis completed")

        return {
          presence_score: parsed.presence_score || 50,
          tone_score: parsed.tone_score || 50,
          coherence_score: hasMessage ? parsed.coherence_score || 50 : null,
          tone_label: parsed.tone_label || "neutre",
          rationale: parsed.rationale || "Analyse complète disponible.",
          google_summary: parsed.google_summary || "",
          gpt_summary: parsed.gpt_summary || "",
          structured_conclusion: parsed.structured_conclusion,
          detailed_analysis: parsed.detailed_analysis,
          presence_details: parsed.presence_details,
          tone_details: parsed.tone_details,
          coherence_details: parsed.coherence_details,
          key_takeaway: !hasMessage ? parsed.key_takeaway : undefined,
          risks: !hasMessage ? parsed.risks : undefined,
          strengths: !hasMessage ? parsed.strengths : undefined,
          advanced_metrics: parsed.advanced_metrics,
        }
      } catch (error) {
        console.error("[v0] Detailed analysis error:", error)
        console.log("[v0] Falling back to mock data due to error")
        return generateFallbackAnalysis()
      }
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached detailed analysis")
  }

  return analysisResult
}

export async function detectHomonyms(
  brand: string,
  searchResults: any[],
  language: string,
  presentationLanguage?: string,
): Promise<{
  requires_identity_selection: boolean
  identified_entities?: any[]
  message?: string
}> {
  const responseLanguage = presentationLanguage || language

  const cacheKey = {
    brand,
    searchResults: searchResults.slice(0, 8).map((r) => ({ title: r.title, snippet: r.snippet })),
    language,
    presentationLanguage: responseLanguage,
    type: "homonym-detection-v3", // Updated cache version
  }

  const { data: result, fromCache } = await analysisCache.getOrSet(
    cacheKey,
    async () => {
      try {
        if (!Array.isArray(searchResults) || searchResults.length < 3) {
          console.log("[v0] Not enough search results for disambiguation")
          return { requires_identity_selection: false }
        }

        const searchContext = searchResults
          .slice(0, 8)
          .map((item) => `**${item.title}**\n   ${item.snippet || ""}`)
          .join("\n\n")

        const prompt = `Tu es un expert en désambiguïsation d'entités. Analyse les résultats de recherche suivants pour "${brand}".

**Résultats de recherche:**
${searchContext}

**Mission:**
1. Identifie SI "${brand}" semble être un NOM DE PERSONNE (prénom + nom)
2. Si c'est une personne, propose TOUJOURS 2-3 options de confirmation même s'il semble y avoir une seule entité claire
3. Si ce n'est PAS une personne (entreprise, produit, lieu), vérifie l'homonymie

**Pour les NOMS DE PERSONNES - Réponds TOUJOURS:**
{
  "requires_identity_selection": true,
  "identified_entities": [
    {
      "id": "entity-1",
      "name": "Nom complet détecté dans les résultats",
      "description": "Description précise basée sur les résultats (profession, activité principale, contexte)",
      "type": "person",
      "context": "Information supplémentaire (période, lieu, secteur)",
      "confidence": 0.95
    },
    {
      "id": "entity-other",
      "name": "${brand} (Autre personne ou homonyme)",
      "description": "Une autre personne portant ce nom",
      "type": "person",
      "context": "Contexte différent",
      "confidence": 0.30
    }
  ],
  "message": "Veuillez confirmer l'identité de '${brand}' pour une analyse précise"
}

**Pour les ENTITÉS NON-PERSONNES avec homonymie détectée:**
{
  "requires_identity_selection": true,
  "identified_entities": [...], // 2-5 entités distinctes
  "message": "Plusieurs entités distinctes identifiées"
}

**Pour les ENTITÉS NON-PERSONNES sans ambiguïté:**
{
  "requires_identity_selection": false,
  "identified_entity": {
    "name": "Nom identifié",
    "description": "Description",
    "confidence": 0.95
  }
}

**RÈGLE ABSOLUE: Si "${brand}" ressemble à un nom de personne (2+ mots dont au moins un prénom potentiel), retourne TOUJOURS requires_identity_selection: true**

Réponds en ${responseLanguage}. NE RETOURNE QUE LE JSON, sans backticks.`

        console.log("[v0] Calling OpenAI for homonym detection...")

        const text = await callOpenAI([{ role: "user", content: prompt }], {
          temperature: 0.2,
          max_tokens: 1500,
        })

        let cleanedText = text.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\n?/, "").replace(/\n?```$/, "")
        }

        const parsed = JSON.parse(cleanedText)

        console.log(
          "[v0] Homonym detection result:",
          parsed.requires_identity_selection ? "CONFIRMATION REQUIRED" : "SINGLE ENTITY",
        )

        return parsed
      } catch (error) {
        console.error("[v0] Homonym detection error:", error)
        return { requires_identity_selection: false }
      }
    },
    { ttl: CACHE_TTL.GPT_ANALYSIS },
  )

  if (fromCache) {
    console.log("[v0] Using cached homonym detection")
  }

  return result
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
    key_takeaway: analysis.key_takeaway,
    risks: analysis.risks,
    strengths: analysis.strengths,
    advanced_metrics: analysis.advanced_metrics,
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
    key_takeaway: "⚠️ Détails non disponibles - erreur technique",
    risks: ["⚠️ Risque non identifié", "⚠️ Risque non identifié", "⚠️ Risque non identifié"],
    strengths: ["⚠️ Force non identifiée", "⚠️ Force non identifiée", "⚠️ Force non identifiée"],
    advanced_metrics: {
      source_quality: {
        tier1_percentage: 0,
        tier2_percentage: 0,
        tier3_percentage: 0,
        dominant_tier: "tier3",
      },
      information_freshness: {
        recent_percentage: 0,
        old_percentage: 0,
        average_age_months: 0,
      },
      geographic_diversity: {
        local_percentage: 0,
        national_percentage: 0,
        international_percentage: 0,
        dominant_scope: "local",
      },
      coverage_type: {
        in_depth_percentage: 0,
        brief_percentage: 0,
        mention_percentage: 0,
        dominant_type: "mention",
      },
      polarization: {
        neutral_percentage: 0,
        oriented_percentage: 0,
        bias_level: "neutral",
      },
      risk_level: {
        score: 0,
        category: "low",
        main_threats: [],
      },
      reputation_index: {
        score: 0,
        trend: "stable",
        health_status: "fair",
      },
    },
  }
}
