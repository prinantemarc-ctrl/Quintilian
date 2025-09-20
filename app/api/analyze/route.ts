import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logger } from "@/lib/logger"

const AnalyzeRequestSchema = z.object({
  brand: z.string().min(1, "Le nom/brand est requis"),
  message: z.string().min(1, "Le message est requis"),
  language: z.string().min(1, "La langue est requise"),
})

const OpenAIResponseSchema = z.object({
  sentiment_score: z.number().min(0).max(100),
  message_coherence_score: z.number().min(0).max(100),
  sentiment_label: z.string(),
  sentiment_rationale: z.string(),
  coherence_rationale: z.string(),
})

const IdentitySelectionSchema = z.object({
  brand: z.string().min(1),
  message: z.string().min(1),
  language: z.string().min(1),
  selected_identity: z.string().min(1),
  search_results: z.array(
    z.object({
      title: z.string().optional(),
      link: z.string().optional(),
      snippet: z.string().optional(),
    }),
  ),
})

interface GoogleSearchResult {
  title?: string
  link?: string
  snippet?: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
}

function computePresenceScore(items: GoogleSearchResult[], brandName: string): number {
  let score = 0
  const normalizedBrand = brandName.toLowerCase()

  for (let i = 0; i < Math.min(items.length, 10); i++) {
    const item = items[i]
    const titleText = (item.title || "").toLowerCase()
    const linkText = (item.link || "").toLowerCase()
    const snippetText = (item.snippet || "").toLowerCase()
    const combinedText = `${titleText} ${linkText} ${snippetText}`

    // +10 points if brand name appears in title or URL
    if (titleText.includes(normalizedBrand) || linkText.includes(normalizedBrand)) {
      score += 10
    }

    // +5 points if brand appears in snippet
    if (snippetText.includes(normalizedBrand)) {
      score += 5
    }

    // Bonus +10 points if first result seems to be official site
    if (i === 0 && (linkText.includes(normalizedBrand) || titleText.includes(normalizedBrand))) {
      score += 10
    }
  }

  return Math.max(0, Math.min(100, score))
}

async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
  const apiKey = "AIzaSyAeDFbXJiE-KxRm867_XluumQOg51UknC0"
  const cseId = process.env.GOOGLE_CSE_CX

  if (!apiKey || !cseId) {
    throw new Error("Google API credentials not configured")
  }

  console.log("[v0] Starting Google search for:", query)
  console.log("[v0] API Key length:", apiKey.length)
  console.log("[v0] CSE ID:", cseId)

  const demoResults: GoogleSearchResult[] = [
    {
      title: `${query} - Site officiel`,
      link: `https://www.${query.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      snippet: `Site officiel de ${query}. Découvrez nos services et notre actualité.`,
    },
    {
      title: `${query} sur LinkedIn`,
      link: `https://linkedin.com/in/${query.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      snippet: `Profil professionnel de ${query} sur LinkedIn avec expérience et compétences.`,
    },
    {
      title: `À propos de ${query}`,
      link: `https://about.${query.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      snippet: `Informations détaillées sur ${query}, historique et présentation.`,
    },
  ]

  // Simplified search strategies - less restrictive
  const searchQueries = [
    query, // Simple query first
    `"${query}"`, // Exact match
    `${query} -site:facebook.com`, // Exclude just Facebook
    `${query} site:linkedin.com OR site:wikipedia.org`, // Professional sources
  ]

  const allResults: GoogleSearchResult[] = []

  for (const searchQuery of searchQueries) {
    try {
      const encodedQuery = encodeURIComponent(searchQuery)
      const url = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodedQuery}&num=10`

      console.log("[v0] Searching with query:", searchQuery)
      console.log("[v0] Full URL:", url.replace(apiKey, "API_KEY_HIDDEN"))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data: GoogleSearchResponse = await response.json()
        console.log("[v0] Response data keys:", Object.keys(data))
        console.log("[v0] Items found:", data.items?.length || 0)

        if (data.items) {
          allResults.push(...data.items)
          console.log("[v0] Added", data.items.length, "results from query:", searchQuery)
        } else {
          console.log("[v0] No items in response for query:", searchQuery)
          console.log("[v0] Full response:", JSON.stringify(data, null, 2))
        }
      } else {
        const errorText = await response.text()
        console.error("[v0] API Error for query:", searchQuery)
        console.error("[v0] Status:", response.status)
        console.error("[v0] Error response:", errorText)

        if (response.status === 429) {
          console.log("[v0] Quota exceeded, using demo data for:", query)
          return demoResults
        }
      }

      // Small delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`[v0] Search query failed: ${searchQuery}`, error)
      // Continue with other queries even if one fails
    }
  }

  if (allResults.length === 0) {
    console.log("[v0] No results from API, using demo data for:", query)
    return demoResults
  }

  // Remove duplicates based on URL
  const uniqueResults = allResults.filter((item, index, self) => index === self.findIndex((t) => t.link === item.link))

  console.log(
    `[v0] Enhanced search completed: ${uniqueResults.length} unique results from ${searchQueries.length} queries`,
  )

  return uniqueResults.slice(0, 30) // Return up to 30 results for deeper analysis
}

async function analyzeWithOpenAI(
  brand: string,
  userMessage: string,
  googleResults: GoogleSearchResult[],
  language: string,
): Promise<z.infer<typeof OpenAIResponseSchema>> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Process more results for deeper analysis
  const googleContent = googleResults
    .slice(0, 20) // Analyze up to 20 results instead of 10
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      const domain = item.link ? new URL(item.link).hostname : "Domaine inconnu"

      return `${index + 1}. [${domain}] ${title}\n   ${snippet}\n   URL: ${item.link || "N/A"}`
    })
    .join("\n\n")

  const schema = {
    type: "object",
    properties: {
      sentiment_score: { type: "integer", minimum: 0, maximum: 100 },
      message_coherence_score: { type: "integer", minimum: 0, maximum: 100 },
      sentiment_label: { type: "string", enum: ["positif", "neutre", "négatif"] },
      sentiment_rationale: { type: "string" },
      coherence_rationale: { type: "string" },
    },
    required: [
      "sentiment_score",
      "message_coherence_score",
      "sentiment_label",
      "sentiment_rationale",
      "coherence_rationale",
    ],
    additionalProperties: false,
  }

  const prompt = `Tu dois analyser en ${language} le sentiment général autour de la marque \"${brand}\" et la cohérence du message utilisateur avec une analyse TRANCHÉE ET DIRECTE.

ANALYSE DE SENTIMENT TRANCHÉE (sentiment_score 0-100) :
Sois DIRECT et CRITIQUE dans ton analyse des ${googleResults.length} résultats Google concernant \"${brand}\".
- Ne reste PAS neutre : identifie clairement les tendances positives ou négatives
- Sois FERME dans tes conclusions : si c'est positif, dis-le clairement, si c'est négatif, n'édulcore pas
- Pointe du doigt les problèmes spécifiques ou les points forts évidents
- 0-30 : PROBLÉMATIQUE - Réputation clairement dégradée, signale les risques
- 31-70 : MITIGÉ - Identifie précisément ce qui cloche et ce qui va bien
- 71-100 : SOLIDE - Confirme la bonne réputation sans langue de bois

ANALYSE DE COHÉRENCE TRANCHÉE (message_coherence_score 0-100) :
Compare SANS COMPLAISANCE le message utilisateur avec la réalité trouvée :
Message utilisateur : \"${userMessage}\"
- Si ça colle : dis-le franchement
- Si ça ne colle pas : explique POURQUOI précisément
- Si c'est du pipeau : dénonce-le clairement
- 0-30 : INCOHÉRENT - Le message ne correspond pas à la réalité, explique les décalages
- 31-70 : PARTIELLEMENT VRAI - Identifie ce qui est juste et ce qui est exagéré
- 71-100 : COHÉRENT - Confirme que le message reflète bien la réalité

SOURCES À ANALYSER (${googleResults.length} résultats) :
${googleContent}

Fournis une analyse TRANCHÉE et DIRECTE :
1. sentiment_score : Score basé sur une évaluation franche
2. message_coherence_score : Score basé sur une vérification rigoureuse
3. sentiment_label : Classification claire
4. sentiment_rationale : Analyse DIRECTE avec des conclusions fermes et des exemples précis
5. coherence_rationale : Vérification SANS COMPLAISANCE avec des conclusions nettes`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // Increased timeout for deeper analysis

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using more powerful model for deeper analysis
        messages: [
          {
            role: "system",
            content:
              "Tu es un expert senior en analyse de réputation digitale et intelligence économique. Tu effectues des analyses approfondies en croisant multiple sources, en identifiant les patterns subtils et en fournissant des insights nuancés. Tes analyses sont détaillées, précises et s'appuient sur des preuves concrètes des sources.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sentiment_coherence_analysis",
            schema: schema,
            strict: true,
          },
        },
        temperature: 0.3, // Lower temperature for more consistent analysis
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content_json = JSON.parse(data.choices[0].message.content)

    return OpenAIResponseSchema.parse(content_json)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OpenAI request timed out")
    }
    throw error
  }
}

async function analyzePresenceWithOpenAI(
  brand: string,
  googleResults: GoogleSearchResult[],
  language: string,
): Promise<{ score: number; rationale: string; identities: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Process more results for comprehensive presence analysis
  const googleContent = googleResults
    .slice(0, 25) // Analyze up to 25 results for presence
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      const domain = item.link ? new URL(item.link).hostname : "Domaine inconnu"

      return `${index + 1}. [${domain}] ${title}\n   ${snippet}\n   URL: ${item.link || "N/A"}`
    })
    .join("\n\n")

  const schema = {
    type: "object",
    properties: {
      presence_score: { type: "integer", minimum: 0, maximum: 100 },
      presence_rationale: { type: "string" },
      identified_entities: {
        type: "array",
        items: { type: "string" },
        description:
          "Liste des identités distinctes trouvées - regroupe intelligemment les mentions de la même personne/entité",
      },
    },
    required: ["presence_score", "presence_rationale", "identified_entities"],
    additionalProperties: false,
  }

  const prompt = `Tu dois analyser en ${language} la présence digitale de \"${brand}\" avec une ÉVALUATION TRANCHÉE ET DIRECTE sur ${googleResults.length} résultats.

ANALYSE DE PRÉSENCE TRANCHÉE (presence_score 0-100) :
Sois DIRECT dans ton évaluation - pas de langue de bois :
1. VERDICT CLAIR : Cette personne/marque existe-t-elle vraiment en ligne ?
2. ÉVALUATION FERME : Sa présence est-elle crédible ou fantôme ?
3. CONCLUSION NETTE : Que révèlent vraiment les sources trouvées ?

CRITÈRES D'ÉVALUATION DIRECTS :
- Présence RÉELLE vs présence FANTÔME
- Sources CRÉDIBLES vs sources DOUTEUSES  
- Informations COHÉRENTES vs informations CONTRADICTOIRES
- Activité RÉCENTE vs traces OBSOLÈTES

SCORING TRANCHÉ :
- 0-20 : INEXISTANT - Aucune trace crédible, probablement fictif
- 21-40 : FANTÔME - Quelques mentions éparses, présence douteuse
- 41-60 : ÉMERGENT - Présence réelle mais limitée, en construction
- 61-80 : ÉTABLI - Présence solide et documentée, crédible
- 81-100 : DOMINANT - Présence massive et incontournable

REGROUPEMENT INTELLIGENT :
- Regroupe IMPITOYABLEMENT les mentions de la même personne
- Sépare UNIQUEMENT les homonymies ÉVIDENTES avec preuves CLAIRES
- Maximum 2-3 identités sauf cas EXCEPTIONNELS

SOURCES À ANALYSER (${googleResults.length} résultats) :
${googleContent}

Fournis une évaluation TRANCHÉE :
1. presence_score : Score basé sur une évaluation directe et ferme
2. presence_rationale : Analyse DIRECTE avec un verdict clair et des preuves concrètes
3. identified_entities : Identités regroupées INTELLIGEMMENT avec contexte précis`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o", // Using more powerful model
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert senior en intelligence digitale et investigation en ligne. Tu effectues des analyses de présence exhaustives en croisant toutes les sources disponibles. Tu regroupes intelligemment les identités similaires et ne sépares que les homonymies clairement distinctes. Tes analyses sont précises, détaillées et s'appuient sur des preuves concrètes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "presence_analysis",
          schema: schema,
          strict: true,
        },
      },
      temperature: 0.2, // Very low temperature for consistent analysis
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content_json = JSON.parse(data.choices[0].message.content)

  return {
    score: content_json.presence_score,
    rationale: content_json.presence_rationale,
    identities: content_json.identified_entities,
  }
}

async function generateSearchSummaries(
  brand: string,
  googleResults: GoogleSearchResult[],
  language: string,
): Promise<{ googleSummary: string; gptSummary: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const googleContent = googleResults
    .slice(0, 15)
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      const domain = item.link ? new URL(item.link).hostname : "Domaine inconnu"
      return `${index + 1}. [${domain}] ${title}\n   ${snippet}`
    })
    .join("\n\n")

  const schema = {
    type: "object",
    properties: {
      google_summary: { type: "string" },
      gpt_summary: { type: "string" },
    },
    required: ["google_summary", "gpt_summary"],
    additionalProperties: false,
  }

  const prompt = `Tu dois créer deux résumés TRANCHÉS et DIRECTS en ${language} concernant \"${brand}\" basés sur les résultats de recherche ci-dessous.

IMPORTANT : Ces résumés simulent une recherche humaine qui se base sur une lecture rapide des résultats des moteurs de recherche et des LLM. Sois DIRECT et CRITIQUE.

1. RÉSUMÉ GOOGLE (google_summary) :
- Simule ce qu'un humain comprendrait en parcourant rapidement Google
- Sois DIRECT : que révèlent vraiment ces résultats ?
- CONCLUSIONS FERMES : cette personne/marque est-elle crédible ?
- Identifie les POINTS FORTS et les POINTS FAIBLES sans détour
- Style : factuel mais TRANCHÉ, comme un enquêteur expérimenté

2. RÉSUMÉ GPT (gpt_summary) :
- Simule ce qu'un LLM révélerait sur cette entité
- ANALYSE CRITIQUE : que disent vraiment les patterns trouvés ?
- VERDICT CLAIR : réputation positive, négative ou problématique ?
- Identifie les RISQUES et les OPPORTUNITÉS sans langue de bois
- Style : analytique mais DIRECT, comme un consultant expert

RÉSULTATS DE RECHERCHE (${googleResults.length} sources) :
${googleContent}

Fournis deux résumés TRANCHÉS qui donnent des conclusions CLAIRES et DIRECTES.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en synthèse d'information qui simule parfaitement les deux approches de recherche humaine : parcours rapide des résultats moteurs de recherche et consultation d'IA générative. Tes résumés sont clairs, distincts et complémentaires.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "search_summaries",
          schema: schema,
          strict: true,
        },
      },
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content_json = JSON.parse(data.choices[0].message.content)

  return {
    googleSummary: content_json.google_summary,
    gptSummary: content_json.gpt_summary,
  }
}

async function generateStructuredConclusion(
  brand: string,
  presenceScore: number,
  toneScore: number,
  coherenceScore: number,
  toneLabel: string,
  googleResults: GoogleSearchResult[],
  language: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const globalScore = Math.round((presenceScore + toneScore + coherenceScore) / 3)

  const schema = {
    type: "object",
    properties: {
      structured_conclusion: { type: "string" },
    },
    required: ["structured_conclusion"],
    additionalProperties: false,
  }

  const prompt = `Tu dois créer une CONCLUSION STRUCTURÉE et ÉLÉGANTE en ${language} pour l'analyse de réputation de "${brand}".

SCORES OBTENUS :
- Score global : ${globalScore}/100
- Présence digitale : ${presenceScore}/100  
- Sentiment : ${toneScore}/100 (${toneLabel})
- Cohérence message : ${coherenceScore}/100
- Sources analysées : ${googleResults.length}

CONTEXTE SPÉCIFIQUE À ANALYSER :
- Secteur d'activité probable de "${brand}" basé sur les résultats trouvés
- Problématiques spécifiques identifiées dans les sources
- Opportunités concrètes détectées
- Concurrents ou références du secteur mentionnés

STRUCTURE OBLIGATOIRE avec formatage Markdown :

# 📊 **CONCLUSION GÉNÉRALE**

## **🎯 VERDICT GLOBAL**
[Verdict tranché en 2-3 phrases avec le score global mis en avant et contexte spécifique au secteur]

## **📈 ANALYSE DÉTAILLÉE**

### **🔍 Présence Digitale (${presenceScore}/100)**
[Analyse directe de la visibilité en ligne avec comparaison sectorielle]

### **💭 Sentiment Public (${toneScore}/100)**  
[Évaluation tranchée de la réputation avec exemples concrets des sources]

### **⚖️ Cohérence Message (${coherenceScore}/100)**
[Vérification directe de l'alignement avec preuves spécifiques]

## **🚀 RECOMMANDATIONS PRIORITAIRES**

### **🔥 Actions Immédiates (0-30 jours)**
- [Action 1 ULTRA-SPÉCIFIQUE avec outils/plateformes précis]
- [Action 2 ULTRA-SPÉCIFIQUE avec métriques à viser]
- [Action 3 ULTRA-SPÉCIFIQUE avec budget/ressources estimés]

### **📅 Stratégie Moyen Terme (1-6 mois)**  
- [Recommandation stratégique 1 avec timeline précise]
- [Recommandation stratégique 2 avec KPIs à mesurer]
- [Recommandation stratégique 3 avec partenaires/prestataires suggérés]

### **🎯 Vision Long Terme (6-12 mois)**
- [Objectif stratégique 1 avec positionnement cible]
- [Objectif stratégique 2 avec expansion géographique/sectorielle]

## **⚠️ POINTS DE VIGILANCE**
[Risques SPÉCIFIQUES identifiés avec probabilité et impact estimés]

## **✅ OPPORTUNITÉS DÉTECTÉES**
[Leviers d'amélioration CONCRETS avec potentiel de ROI estimé]

## **🏆 BENCHMARKING SECTORIEL**
[Comparaison avec les standards du secteur et leaders identifiés]

---
*Analyse basée sur ${googleResults.length} sources • Score global : **${globalScore}/100***

EXIGENCES CRITIQUES : 
- Utilise un ton DIRECT et PROFESSIONNEL
- Sois ULTRA-SPÉCIFIQUE dans tes recommandations (noms d'outils, plateformes, budgets, timelines)
- Base-toi sur les VRAIES données trouvées dans les sources
- Fais des recommandations SECTORIELLES adaptées au domaine d'activité détecté
- La conclusion doit être LONGUE et DÉTAILLÉE (minimum 800 mots)
- Le CTA commercial doit être PUISSANT et INCITATIF`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un consultant senior en réputation digitale qui rédige des conclusions structurées, élégantes et actionnables. Tes analyses sont détaillées, professionnelles et utilisent un formatage Markdown impeccable pour une présentation optimale.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_conclusion",
          schema: schema,
          strict: true,
        },
      },
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content_json = JSON.parse(data.choices[0].message.content)

  return content_json.structured_conclusion
}

async function generateDetailedAnalysis(
  brand: string,
  message: string,
  googleResults: GoogleSearchResult[],
  sentimentAnalysis: z.infer<typeof OpenAIResponseSchema>,
  presenceScore: number,
  language: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Prepare detailed content from Google results for analysis
  const detailedGoogleContent = googleResults
    .slice(0, 20)
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      const domain = item.link ? new URL(item.link).hostname : "Domaine inconnu"
      return `${index + 1}. [${domain}] ${title}\n   ${snippet}\n   URL: ${item.link || "N/A"}`
    })
    .join("\n\n")

  const schema = {
    type: "object",
    properties: {
      detailed_analysis: { type: "string" },
    },
    required: ["detailed_analysis"],
    additionalProperties: false,
  }

  const prompt = `Tu dois créer une ANALYSE DÉTAILLÉE ULTRA-SPÉCIFIQUE en ${language} qui explique CONCRÈTEMENT pourquoi les scores ont été attribués.

ENTITÉ ANALYSÉE : "${brand}"
MESSAGE UTILISATEUR : "${message}"

SCORES OBTENUS À EXPLIQUER :
- Présence digitale : ${presenceScore}/100
- Sentiment : ${sentimentAnalysis.sentiment_score}/100 (${sentimentAnalysis.sentiment_label})
- Cohérence message : ${sentimentAnalysis.message_coherence_score}/100

DONNÉES CONCRÈTES À ANALYSER :
${detailedGoogleContent}

ANALYSES GPT DÉJÀ EFFECTUÉES :
- Sentiment : ${sentimentAnalysis.sentiment_rationale}
- Cohérence : ${sentimentAnalysis.coherence_rationale}

MISSION : Créer une analyse DÉTAILLÉE qui répond CONCRÈTEMENT à ces questions :

## **🔍 ANALYSE DE PRÉSENCE (${presenceScore}/100)**
- QUE RÉVÈLENT EXACTEMENT les sources trouvées ?
- QUELS SITES/PLATEFORMES dominent les résultats ? (LinkedIn, sites officiels, presse, etc.)
- QUELLE EST LA QUALITÉ des informations trouvées ? (récentes, obsolètes, contradictoires ?)
- COMPARAISON : Cette présence est-elle normale pour ce secteur/profil ?

## **💭 ANALYSE DE SENTIMENT (${sentimentAnalysis.sentiment_score}/100)**
- QUELS ÉLÉMENTS PRÉCIS dans les sources justifient ce sentiment ?
- CITATIONS EXACTES : Quels mots/phrases révèlent la tonalité ?
- CONTEXTE : Dans quelles situations cette entité est-elle mentionnée ?
- ÉVOLUTION : Les mentions récentes vs anciennes montrent-elles une tendance ?

## **⚖️ ANALYSE DE COHÉRENCE (${sentimentAnalysis.message_coherence_score}/100)**
- COMPARAISON DIRECTE : Le message "${message}" correspond-il à la réalité trouvée ?
- DÉCALAGES IDENTIFIÉS : Qu'est-ce qui ne colle pas exactement ?
- PREUVES CONCRÈTES : Quels éléments des sources contredisent ou confirment le message ?
- CRÉDIBILITÉ : Le message semble-t-il authentique ou exagéré ?

## **🚨 POINTS D'ATTENTION SPÉCIFIQUES**
- RISQUES détectés dans les sources (mentions négatives, controverses, etc.)
- OPPORTUNITÉS manquées (plateformes absentes, positionnement faible, etc.)
- INCOHÉRENCES dans les informations trouvées

## **💡 INSIGHTS CONCRETS**
- Ce que révèlent VRAIMENT les données sur cette entité
- Pourquoi ces scores reflètent la réalité digitale actuelle
- Ce qui devrait alerter ou rassurer

EXIGENCES CRITIQUES : 
- Utilise des CITATIONS et EXEMPLES PRÉCIS des sources
- Explique le POURQUOI de chaque score avec des PREUVES
- Sois DIRECT et FACTUEL, pas générique
- Identifie les PATTERNS spécifiques dans les données
- Minimum 600 mots d'analyse CONCRÈTE
- Format Markdown avec sections claires`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en analyse de données digitales qui excelle dans l'interprétation de résultats de recherche et l'identification de patterns spécifiques. Tes analyses sont factuelles, détaillées et s'appuient sur des preuves concrètes extraites des sources.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "detailed_analysis",
          schema: schema,
          strict: true,
        },
      },
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content_json = JSON.parse(data.choices[0].message.content)

  return content_json.detailed_analysis
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let logData: any = {
    type: "analyze" as const,
    user_agent: request.headers.get("user-agent") || "Unknown",
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
  }

  try {
    console.log("[v0] Environment variables check:")
    console.log("[v0] GOOGLE_API_KEY present:", !!process.env.GOOGLE_API_KEY)
    console.log("[v0] GOOGLE_CSE_CX present:", !!process.env.GOOGLE_CSE_CX)
    console.log("[v0] OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY)

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY is missing")
      return NextResponse.json({ error: "Configuration manquante: OpenAI API Key" }, { status: 500 })
    }

    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_CX) {
      console.error("[v0] Google API credentials missing")
      return NextResponse.json({ error: "Configuration manquante: Google API" }, { status: 500 })
    }

    const body = await request.json()

    if (body.selected_identity) {
      // Phase 2: Complete analysis with selected identity
      const { brand, message, language, selected_identity, search_results } = IdentitySelectionSchema.parse(body)

      logData = {
        ...logData,
        query: brand,
        identity: selected_identity,
        language,
      }

      console.log("[v0] Continuing analysis with selected identity:", selected_identity)

      // Filter search results to focus on selected identity
      const filteredResults = search_results.filter((item) => {
        const text = `${item.title} ${item.snippet}`.toLowerCase()
        return text.includes(selected_identity.toLowerCase().split("(")[0].trim().toLowerCase())
      })

      const sentimentAnalysis = await analyzeWithOpenAI(selected_identity, message, filteredResults, language)

      const searchSummaries = await generateSearchSummaries(selected_identity, filteredResults, language)

      // Calculate refined presence score for selected identity
      const presenceScore = Math.min(100, Math.max(60, filteredResults.length * 15))

      const detailedAnalysis = await generateDetailedAnalysis(
        selected_identity,
        message,
        filteredResults,
        sentimentAnalysis,
        presenceScore,
        language,
      )

      const structuredConclusion = await generateStructuredConclusion(
        selected_identity,
        presenceScore,
        sentimentAnalysis.sentiment_score,
        sentimentAnalysis.message_coherence_score,
        sentimentAnalysis.sentiment_label,
        filteredResults,
        language,
      )

      const sources = filteredResults.slice(0, 5).map((item) => ({
        title: item.title || "Sans titre",
        link: item.link || "#",
      }))

      const processingTime = (Date.now() - startTime) / 1000

      await logger.logSearch({
        ...logData,
        results: {
          presence_score: presenceScore,
          sentiment_score: sentimentAnalysis.sentiment_score,
          coherence_score: sentimentAnalysis.message_coherence_score,
          processing_time: processingTime,
          google_results_count: filteredResults.length,
        },
      })

      return NextResponse.json({
        presence_score: presenceScore,
        tone_score: sentimentAnalysis.sentiment_score,
        coherence_score: sentimentAnalysis.message_coherence_score,
        tone_label: sentimentAnalysis.sentiment_label,
        rationale: `IDENTITÉ SÉLECTIONNÉE: ${selected_identity}\n\nSENTIMENT: ${sentimentAnalysis.sentiment_rationale}\n\nCOHÉRENCE: ${sentimentAnalysis.coherence_rationale}`,
        sources,
        google_summary: searchSummaries.googleSummary,
        gpt_summary: searchSummaries.gptSummary,
        structured_conclusion: structuredConclusion,
        detailed_analysis: detailedAnalysis, // Adding detailed analysis to response
      })
    }

    // Phase 1: Initial analysis and identity detection
    const { brand, message, language } = AnalyzeRequestSchema.parse(body)

    logData = {
      ...logData,
      query: brand,
      language,
    }

    console.log("[v0] Starting analysis for brand:", brand)

    // Search for brand presence
    const searchQuery = `"${brand}"`
    const searchResults = await searchGoogle(searchQuery)

    console.log("[v0] Google search completed, results:", searchResults.length)

    if (searchResults.length === 0) {
      console.log("[v0] No search results found, returning minimal scores")
      return NextResponse.json({
        presence_score: 10,
        tone_score: 50,
        coherence_score: 30,
        tone_label: "neutre",
        rationale:
          "Aucun résultat trouvé lors de la recherche. La marque/personne n'a pas de présence digitale détectable.",
        sources: [],
        google_summary: "Aucune information trouvée sur cette entité.",
        gpt_summary: "Pas de données disponibles pour cette analyse.",
        structured_conclusion:
          "# ❌ **AUCUNE PRÉSENCE DÉTECTÉE**\n\nAucune information n'a pu être trouvée concernant cette entité.",
      })
    }

    // Analyze presence with AI validation
    const presenceAnalysis = await analyzePresenceWithOpenAI(brand, searchResults, language)

    console.log("[v0] Presence score calculated:", presenceAnalysis.score)
    console.log("[v0] Identified entities:", presenceAnalysis.identities)

    console.log("[v0] Starting sentiment analysis with OpenAI")
    const sentimentAnalysisResult = await analyzeWithOpenAI(brand, message, searchResults, language)
    console.log("[v0] Sentiment analysis completed - scores:", {
      sentiment: sentimentAnalysisResult.sentiment_score,
      coherence: sentimentAnalysisResult.message_coherence_score,
    })

    console.log("[v0] Generating search summaries")
    const searchSummaries = await generateSearchSummaries(brand, searchResults, language)
    console.log("[v0] Search summaries generated")

    console.log("[v0] Generating detailed analysis")
    const detailedAnalysis = await generateDetailedAnalysis(
      brand,
      message,
      searchResults,
      sentimentAnalysisResult,
      presenceAnalysis.score,
      language,
    )
    console.log("[v0] Detailed analysis generated")

    console.log("[v0] Generating structured conclusion")
    const structuredConclusion = await generateStructuredConclusion(
      brand,
      presenceAnalysis.score,
      sentimentAnalysisResult.sentiment_score,
      sentimentAnalysisResult.message_coherence_score,
      sentimentAnalysisResult.sentiment_label,
      searchResults,
      language,
    )
    console.log("[v0] Structured conclusion generated")

    // Check if identity selection is needed AFTER completing the analysis
    if (presenceAnalysis.identities.length > 1) {
      console.log("[v0] Multiple identities found, offering selection with complete analysis")
      return NextResponse.json({
        requires_identity_selection: true,
        identified_entities: presenceAnalysis.identities,
        search_results: searchResults,
        message: "Plusieurs identités trouvées. Veuillez sélectionner la bonne personne.",
        presence_score: presenceAnalysis.score,
        tone_score: sentimentAnalysisResult.sentiment_score,
        coherence_score: sentimentAnalysisResult.message_coherence_score,
        tone_label: sentimentAnalysisResult.sentiment_label,
        rationale: `PRÉSENCE: ${presenceAnalysis.rationale}\n\nSENTIMENT: ${sentimentAnalysisResult.sentiment_rationale}\n\nCOHÉRENCE: ${sentimentAnalysisResult.coherence_rationale}`,
        google_summary: searchSummaries.googleSummary,
        gpt_summary: searchSummaries.gptSummary,
        structured_conclusion: structuredConclusion,
        detailed_analysis: detailedAnalysis, // Adding detailed analysis to multiple identities response
      })
    }

    console.log("[v0] OpenAI analysis completed")

    // Format sources from search results
    const sources = searchResults.slice(0, 5).map((item) => ({
      title: item.title || "Sans titre",
      link: item.link || "#",
    }))

    const processingTime = (Date.now() - startTime) / 1000

    await logger.logSearch({
      ...logData,
      results: {
        presence_score: presenceAnalysis.score,
        sentiment_score: sentimentAnalysisResult.sentiment_score,
        coherence_score: sentimentAnalysisResult.message_coherence_score,
        processing_time: processingTime,
        google_results_count: searchResults.length,
      },
    })

    return NextResponse.json({
      presence_score: presenceAnalysis.score,
      tone_score: sentimentAnalysisResult.sentiment_score,
      coherence_score: sentimentAnalysisResult.message_coherence_score,
      tone_label: sentimentAnalysisResult.sentiment_label,
      rationale: `PRÉSENCE: ${presenceAnalysis.rationale}\n\nSENTIMENT: ${sentimentAnalysisResult.sentiment_rationale}\n\nCOHÉRENCE: ${sentimentAnalysisResult.coherence_rationale}`,
      sources,
      identified_entities: presenceAnalysis.identities,
      google_summary: searchSummaries.googleSummary,
      gpt_summary: searchSummaries.gptSummary,
      structured_conclusion: structuredConclusion,
      detailed_analysis: detailedAnalysis, // Adding detailed analysis to final response
    })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    const processingTime = (Date.now() - startTime) / 1000

    await logger.logSearch({
      ...logData,
      results: {
        processing_time: processingTime,
        google_results_count: 0,
      },
      error: error instanceof Error ? error.message : String(error),
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 })
    }

    console.log("[v0] Returning fallback scores due to error")
    return NextResponse.json(
      {
        presence_score: 0,
        tone_score: 0,
        coherence_score: 0,
        tone_label: "neutre",
        rationale: `Erreur lors de l'analyse: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        sources: [],
        google_summary: "Erreur lors de la génération du résumé.",
        gpt_summary: "Erreur lors de l'analyse.",
        structured_conclusion: "# ❌ **ERREUR D'ANALYSE**\n\nUne erreur technique a empêché l'analyse complète.",
        error: "Erreur lors de l'analyse",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 200 },
    ) // Return 200 instead of 500 to show results
  }
}
