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

  const responseLanguage = "en"

  const cacheKey = {
    brand,
    message,
    googleResults: googleResults.slice(0, 10).map((r) => ({ title: r.title, link: r.link })),
    language,
    analysisType,
    presentationLanguage: responseLanguage,
    hasMessage,
    type: "detailed-analysis-v7-english-forced", // Force cache invalidation
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
            const title = item.title || "No title"
            const snippet = item.snippet || "No description"
            return `**${title}**\n   ${snippet}\n   ${item.link}`
          })
          .join("\n\n")

        let prompt: string

        const metricsSection = `
**ADVANCED METRICS TO CALCULATE (advanced_metrics):**

1. **source_quality**: Analyze quality of crawled sources:
   - tier1_percentage: % high authority sources (Wikipedia, NYT, Forbes, .edu/.gov sites)
   - tier2_percentage: % regional media, specialized press, recognized blogs
   - tier3_percentage: % social networks, directories, low authority sites
   - dominant_tier: "tier1"|"tier2"|"tier3" (majority category)

2. **information_freshness**: Information freshness:
   - recent_percentage: % sources less than 6 months old
   - old_percentage: % sources older than 6 months
   - average_age_months: average estimated age in months

3. **geographic_diversity**: Geographic distribution:
   - local_percentage: % local/regional sources
   - national_percentage: % national sources
   - international_percentage: % international sources
   - dominant_scope: "local"|"national"|"international"

4. **coverage_type**: Type of media coverage:
   - in_depth_percentage: % in-depth articles (>500 estimated words)
   - brief_percentage: % brief articles (100-500 estimated words)
   - mention_percentage: % simple mentions (<100 estimated words)
   - dominant_type: "in_depth"|"brief"|"mention"

5. **polarization**: Political/editorial orientation:
   - neutral_percentage: % neutral/objective sources
   - oriented_percentage: % politically oriented sources
   - bias_level: "neutral"|"slightly_biased"|"highly_biased"

6. **risk_level**: Reputational risk level:
   - score: 0-100 (0=no risk, 100=critical risk)
   - category: "low"|"moderate"|"high"|"critical"
   - main_threats: array of 2-3 main identified threats

7. **reputation_index**: Global reputation index:
   - score: 0-100 (overall reputation health)
   - trend: "improving"|"stable"|"declining" (trend)
   - health_status: "excellent"|"good"|"fair"|"poor"
`

        if (hasMessage) {
          prompt = `You are an operational OSINT analyst specialized in digital intelligence. Target: "${brand}". Output language: ENGLISH.

**INTEL SOURCES (in ${language}):**
${googleContent}

**HYPOTHESIS TO VERIFY:** "${message}"

**⚠️ PROTOCOL: NEVER reference sources by number. Use: "according to intelligence gathered", "OSINT analysis reveals", "digital traces show", "according to crawled data", "open sources indicate".**

**ANALYSIS VECTORS:**

1. **DIGITAL FOOTPRINT (score/100)**: Cross-platform visibility, diversity of exposure vectors, indexed domain authority
2. **GLOBAL SENTIMENT (score/100)**: Opinion polarization (hostile=0, neutral=50, favorable=100)
3. **INTEL ALIGNMENT (score/100)**: Correlation between hypothesis and crawled data
${metricsSection}

**EXECUTIVE REPORT (structured_conclusion) - 3-4 markdown sections, 150+ words/section:**

## Digital Footprint
Detailed presence mapping: identified vectors (online encyclopedias, mainstream/alternative media, official platforms, social networks, forums), domain PageRank authority, geographic distribution, publication timestamps. Identification of dominant channels and blind spots. Operational language, no source numbering.

## Sentiment Polarization
In-depth behavioral analysis with concrete use cases (no "source X"): hostile/neutral/favorable distribution with patterns extracted from crawl, identified emotional triggers, narrative analysis, temporal evolution, divergences between official communication and community perception.

## Strategic Risks and Assets
Assets: Reputational levers (sector leadership, recognized expertise, community capital, documented achievements, positive media coverage)
Risks: Reputational threats (active controversies, recurring criticism, aggressive competition, communication vulnerabilities)

**FIELD ANALYSIS (detailed_analysis) - 3 mandatory sections, 200+ words/section:**

## OSINT Analysis of Crawled Results
Methodical dissection of web traces in a FLUID and PROFESSIONAL manner:
- **Classification**: Typology (Wikipedia, tier-1/tier-2 media, specialized press, official sites, social platforms, underground forums)
- **Trustrank**: Domain credibility (mention "high authority sources", "verified media", "tier-1 platforms")
- **Freshness**: Temporal freshness of traces
- **Semantics**: Dominant keywords, thematic clusters
- **Narratives**: Detected storytelling, convergences/contradictions
- **Anomalies**: Suspicious patterns, contradictions, data gaps
- **Geolocation**: Geographic and linguistic distribution of sources
**PROTOCOL: Name sources by type (e.g., "Wikipedia reveals", "sports media cover"), NEVER by numeric index.**

## Generative AI Projection
Algorithmic perception by LLMs (ChatGPT, Claude, Gemini, Perplexity):
- AI knowledge base
- Primary sources exploited by models
- Potential representation biases
- Hallucination/misinformation risks
- SEO-AI optimization opportunities
- Actionable recommendations

## Complete OSINT Strategic View
Global synthesis with open source intelligence methodology:
- Exhaustive mapping of digital attack surface
- Structural strengths and tactical advantages
- Systemic vulnerabilities and attack vectors
- Contextual benchmarking if applicable
- Detection of weak signals and emerging trends
- Reputational forecast
- Operational strategic recommendations

**JSON OUTPUT - ALL TEXT MUST BE IN ENGLISH:**
{
  "presence_score": <0-100>,
  "tone_score": <0-100>,
  "coherence_score": <0-100>,
  "tone_label": "<positive|neutral|negative>",
  "rationale": "<analytical synthesis 4-5 sentences, intelligence language, IN ENGLISH>",
  "google_summary": "<factual report with concrete data, NO numbers (100+ words), IN ENGLISH>",
  "gpt_summary": "<contextual intel analysis, NO numbers (100+ words), IN ENGLISH>",
  "structured_conclusion": "<markdown ##, MINIMUM 450 words, NO numbers, IN ENGLISH>",
  "detailed_analysis": "<markdown 3 sections, MINIMUM 600 words, NO numbers, IN ENGLISH>",
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

**RULES OF ENGAGEMENT:**
- FORBIDDEN: "(source 1)", "(sources 2, 5)", any numbering
- MANDATORY: OSINT/underground pro language - "traces", "vectors", "intel", "crawl", "attack surface", "signals"
- Style: Strategic analyst, not academic
- Precision, factual data, field approach
- MINIMUM 750 words detailed_analysis, 450 structured_conclusion
- CALCULATE advanced metrics accurately
- **ALL OUTPUT TEXT MUST BE IN ENGLISH**

Respond ONLY with JSON, no backticks.`
        } else {
          prompt = `You are an operational OSINT analyst in digital intelligence. Mission: profiling "${brand}". Output in ENGLISH.

**CRAWLED DATA (in ${language}):**
${googleContent}

**⚠️ PROTOCOL: Never use source numbers. Use: "intelligence collected", "OSINT reveals", "according to crawled traces", "open data shows", "indexed platforms indicate".**

**ANALYSIS VECTORS (WITHOUT hypothesis to verify):**

1. **DIGITAL FOOTPRINT (score/100)**: Cross-platform presence, vector diversity, domain authority, media coverage
2. **GLOBAL POLARIZATION (score/100)**: Aggregated sentiment (hostile=0, neutral=50, favorable=100)
3. **NO ALIGNMENT SCORE** (no hypothesis to check)
${metricsSection}

**TACTICAL ELEMENTS:**
- **key_takeaway**: ONE impactful sentence summarizing the essence (max 20 words)
- **risks**: 3 factual reputational threats (short, precise)
- **strengths**: 3 factual strategic assets (short, precise)

**EXECUTIVE REPORT (structured_conclusion) - 3 markdown sections, 150+ words/section:**

## Digital Footprint
In-depth visibility audit: trace typology (encyclopedias like Wikipedia, mainstream/alternative media, official platforms, social networks, forums), domain authority, geographic coverage, temporal freshness. Analysis of dominant vectors and blind spots. **Operational language, no numbers.**

## Sentiment Polarization
Behavioral analysis with concrete cases (never "source X"): hostile/neutral/favorable distribution, emotional triggers, detected narratives, controversies vs consensus, comparison official communication vs community perception.

## Strategic Briefing
Consolidated synthesis: identity and positioning, assets (leadership, expertise, notoriety), vulnerabilities (controversies, criticism, flaws), recommendations, forecast. **Name sources by type, never by index.**

**FIELD ANALYSIS (detailed_analysis) - 3 mandatory sections, 250+ words/section:**

## OSINT Analysis of Crawled Sources
Methodical intelligence approach on results, NATURAL language:
- **Classification**: Categorization (Wikipedia, tier-1/2 media, specialized press, official platforms, social media, underground)
- **Trustrank**: Domain reliability (use "high authority sources", "verified platforms")
- **Freshness**: Trace recency
- **Semantics**: Keywords, thematic clusters
- **Storytelling**: Narratives, convergences/divergences
- **Anomalies**: Suspicious patterns, contradictions, gaps
- **Distribution**: Geographic, linguistic, audience segmentation
**Refer to sources by nature (e.g., "Wikipedia documents", "media report"), NEVER by number.**

## Generative AI Projection
Target perception by LLMs (ChatGPT, Claude, Gemini, Perplexity):
- AI knowledge base synthesis
- LLM primary sources
- Potential representation biases
- Information risks (hallucinations)
- Possible optimizations
- Recommended actions

## Complete OSINT Strategic View
Global synthesis with rigorous intelligence methodology:
- Complete digital surface mapping
- Structural strengths and competitive advantages
- Vulnerabilities and attack vectors
- Contextual benchmarking if relevant
- Weak signals and emerging trends
- Trajectory forecast
- Actionable strategic recommendations

**JSON OUTPUT - ALL TEXT MUST BE IN ENGLISH:**
{
  "presence_score": <0-100>,
  "tone_score": <0-100>,
  "coherence_score": null,
  "tone_label": "<positive|neutral|negative>",
  "rationale": "<PRECISE narrative synthesis, intelligence language, 4-5 sentences, IN ENGLISH>",
  "google_summary": "<factual report with NAMES, FACTS, DATES, NO numbers (150+ words), IN ENGLISH>",
  "gpt_summary": "<in-depth contextual analysis, NO numbers (150+ words), IN ENGLISH>",
  "structured_conclusion": "<markdown ##, MINIMUM 450 words, NO numbers, IN ENGLISH>",
  "detailed_analysis": "<markdown 3 complete sections, MINIMUM 750 words, NO numbers, IN ENGLISH>",
  "key_takeaway": "<impactful sentence (15-20 words max), IN ENGLISH>",
  "risks": ["<risk 1 IN ENGLISH>", "<risk 2 IN ENGLISH>", "<risk 3 IN ENGLISH>"],
  "strengths": ["<strength 1 IN ENGLISH>", "<strength 2 IN ENGLISH>", "<strength 3 IN ENGLISH>"],
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

**RULES OF ENGAGEMENT:**
- FORBIDDEN: "(source 1)", "(sources 2, 5, 9)", numbering
- MANDATORY: OSINT/underground pro language - "traces", "vectors", "intel", "crawl", "attack surface", "signals"
- Style: Intelligence analyst, not academic
- Precision, factual data, field approach
- MINIMUM 750 words detailed_analysis, 450 structured_conclusion
- CALCULATE advanced metrics accurately
- **ALL OUTPUT TEXT MUST BE IN ENGLISH**

Pure JSON without backticks`
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
          tone_label: parsed.tone_label || "neutral",
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
    tone_label: analysis.tone_label || "neutral",
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
    tone_label: "neutral",
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
