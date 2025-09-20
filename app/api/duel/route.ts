import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logger } from "@/lib/logger"

const DuelRequestSchema = z.object({
  brand1: z.string().min(1, "Le premier nom est requis"),
  brand2: z.string().min(1, "Le second nom est requis"),
  message: z.string().min(1, "Le message est requis"),
  language: z.string().min(1, "La langue est requise"),
})

interface GoogleSearchResult {
  title?: string
  link?: string
  snippet?: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
}

async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
  const apiKey = "AIzaSyAeDFbXJiE-KxRm867_XluumQOg51UknC0"
  const cseId = process.env.GOOGLE_CSE_CX

  if (!apiKey || !cseId) {
    throw new Error("Google API credentials not configured")
  }

  // Multiple search strategies for deeper results
  const searchQueries = [
    `"${query}"`, // Exact match
    `${query} -site:facebook.com -site:twitter.com`, // Exclude social media for professional results
    `${query} site:linkedin.com OR site:wikipedia.org OR site:crunchbase.com`, // Professional sources
    `${query} news OR interview OR biography`, // News and biographical content
  ]

  const allResults: GoogleSearchResult[] = []

  for (const searchQuery of searchQueries) {
    try {
      const encodedQuery = encodeURIComponent(searchQuery)
      const url = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodedQuery}&num=10`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data: GoogleSearchResponse = await response.json()
        if (data.items) {
          allResults.push(...data.items)
        }
      }

      // Small delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.log(`[v0] Search query failed: ${searchQuery}`, error)
      // Continue with other queries even if one fails
    }
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
): Promise<{
  sentiment_score: number
  message_coherence_score: number
  tone_label: string
  rationale: string
  google_summary: string
  gpt_summary: string
}> {
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
      tone_label: { type: "string", enum: ["positif", "neutre", "négatif"] },
      rationale: { type: "string" },
      google_summary: { type: "string" },
      gpt_summary: { type: "string" },
    },
    required: [
      "sentiment_score",
      "message_coherence_score",
      "tone_label",
      "rationale",
      "google_summary",
      "gpt_summary",
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
3. tone_label : "positif", "neutre", ou "négatif" selon ton analyse
4. rationale : Explication DIRECTE de tes scores avec citations des sources
5. google_summary : Résumé des points clés trouvés dans les sources Google
6. gpt_summary : Ton analyse personnelle et tes conclusions tranchées

EXIGENCES CRITIQUES :
- Sois DIRECT et sans complaisance
- Cite des EXEMPLES PRÉCIS des sources
- Ne généralise PAS : base-toi sur les VRAIES données trouvées
- Si les sources sont insuffisantes, dis-le clairement`

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

    return {
      sentiment_score: content_json.sentiment_score,
      message_coherence_score: content_json.message_coherence_score,
      tone_label: content_json.tone_label,
      rationale: content_json.rationale,
      google_summary: content_json.google_summary,
      gpt_summary: content_json.gpt_summary,
    }
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
): Promise<{ score: number; rationale: string }> {
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
    },
    required: ["presence_score", "presence_rationale"],
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

SOURCES À ANALYSER (${googleResults.length} résultats) :
${googleContent}

Fournis une évaluation TRANCHÉE :
1. presence_score : Score basé sur une évaluation directe et ferme
2. presence_rationale : Analyse DIRECTE avec un verdict clair et des preuves concrètes`

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
            "Tu es un expert senior en intelligence digitale et investigation en ligne. Tu effectues des analyses de présence exhaustives en croisant toutes les sources disponibles. Tes analyses sont précises, détaillées et s'appuient sur des preuves concrètes.",
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

## **💡 VOUS VOULEZ AMÉLIORER VOTRE SCORE ?**

**Nous avons tous les outils pour transformer votre réputation digitale.**

🎯 **Nos experts vous accompagnent pour :**
- Optimiser votre présence sur les moteurs de recherche
- Construire une stratégie de contenu percutante  
- Gérer et améliorer votre e-réputation
- Développer votre influence digitale

**📞 CONTACTEZ-NOUS DÈS MAINTENANT**
*Une consultation gratuite peut changer la donne pour votre image en ligne.*

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
  sentimentAnalysis: any,
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
- Sentiment : ${sentimentAnalysis.sentiment_score}/100 (${sentimentAnalysis.tone_label})
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

async function analyzeBrandSequentially(brand: string, message: string, language: string) {
  console.log(`[v0] Starting comprehensive sequential analysis for brand: ${brand}`)

  try {
    // Search for brand presence using the same logic as analyze API
    const searchQuery = `"${brand}"`
    const searchResults = await searchGoogle(searchQuery)

    console.log(`[v0] Google search completed for ${brand}, results: ${searchResults.length}`)

    if (searchResults.length === 0) {
      console.log(`[v0] No search results found for ${brand}, returning minimal scores`)
      return {
        presence_score: 10,
        tone_score: 50,
        coherence_score: 30,
        tone_label: "neutre",
        rationale: `Aucun résultat trouvé pour ${brand}. Présence digitale non détectable.`,
        sources: [],
        google_summary: `Aucune information trouvée sur ${brand}.`,
        gpt_summary: `Pas de données disponibles pour analyser ${brand}.`,
        structured_conclusion: `# ❌ **AUCUNE PRÉSENCE DÉTECTÉE**\n\nAucune information n'a pu être trouvée concernant ${brand}.`,
        detailed_analysis: `# ❌ **ANALYSE IMPOSSIBLE**\n\nAucune donnée disponible pour analyser ${brand}.`,
      }
    }

    // Analyze presence with AI validation
    const presenceAnalysis = await analyzePresenceWithOpenAI(brand, searchResults, language)

    console.log(`[v0] Presence analysis completed for ${brand}: ${presenceAnalysis.score}/100`)

    // Analyze sentiment and coherence
    const sentimentAnalysis = await analyzeWithOpenAI(brand, message, searchResults, language)

    console.log(`[v0] Sentiment analysis completed for ${brand}: ${sentimentAnalysis.sentiment_score}/100`)

    // Generate search summaries
    const searchSummaries = await generateSearchSummaries(brand, searchResults, language)

    console.log(`[v0] Search summaries generated for ${brand}`)

    const detailedAnalysis = await generateDetailedAnalysis(
      brand,
      message,
      searchResults,
      sentimentAnalysis,
      presenceAnalysis.score,
      language,
    )

    console.log(`[v0] Detailed analysis generated for ${brand}`)

    // Generate structured conclusion
    const structuredConclusion = await generateStructuredConclusion(
      brand,
      presenceAnalysis.score,
      sentimentAnalysis.sentiment_score,
      sentimentAnalysis.message_coherence_score,
      sentimentAnalysis.tone_label,
      searchResults,
      language,
    )

    console.log(`[v0] Structured conclusion generated for ${brand}`)

    // Format sources from search results
    const sources = searchResults.slice(0, 5).map((item) => ({
      title: item.title || "Sans titre",
      link: item.link || "#",
    }))

    return {
      presence_score: presenceAnalysis.score,
      tone_score: sentimentAnalysis.sentiment_score,
      coherence_score: sentimentAnalysis.message_coherence_score,
      tone_label: sentimentAnalysis.tone_label,
      rationale: `PRÉSENCE: ${presenceAnalysis.rationale}\n\nSENTIMENT: ${sentimentAnalysis.sentiment_rationale}\n\nCOHÉRENCE: ${sentimentAnalysis.coherence_rationale}`,
      sources,
      google_summary: searchSummaries.googleSummary,
      gpt_summary: searchSummaries.gptSummary,
      structured_conclusion: structuredConclusion,
      detailed_analysis: detailedAnalysis,
    }
  } catch (error) {
    console.error(`[v0] Error analyzing ${brand}:`, error)
    return {
      presence_score: 0,
      tone_score: 0,
      coherence_score: 0,
      tone_label: "neutre",
      rationale: "Erreur lors de l'analyse",
      sources: [],
      google_summary: `Erreur lors de la génération du résumé Google pour ${brand}`,
      gpt_summary: `Erreur lors de la génération du résumé GPT pour ${brand}`,
      structured_conclusion: `# ❌ **ERREUR D'ANALYSE**\n\nImpossible d'analyser ${brand} en raison d'une erreur technique: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      detailed_analysis: `# ❌ **ERREUR D'ANALYSE**\n\nImpossible d'analyser ${brand} en raison d'une erreur technique: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
    }
  }
}

async function generateDuelComparison(
  brand1: string,
  brand1Analysis: any,
  brand2: string,
  brand2Analysis: any,
  message: string,
  language: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const schema = {
    type: "object",
    properties: {
      detailed_comparison: { type: "string" },
    },
    required: ["detailed_comparison"],
    additionalProperties: false,
  }

  const prompt = `Tu dois créer une COMPARAISON DÉTAILLÉE et TRANCHÉE en ${language} entre "${brand1}" et "${brand2}" concernant le message "${message}".

DONNÉES D'ANALYSE :

**${brand1}** :
- Présence digitale : ${brand1Analysis.presence_score}/100
- Sentiment : ${brand1Analysis.tone_score}/100 (${brand1Analysis.tone_label})
- Cohérence : ${brand1Analysis.coherence_score}/100
- Résumé Google : ${brand1Analysis.google_summary}
- Résumé GPT : ${brand1Analysis.gpt_summary}

**${brand2}** :
- Présence digitale : ${brand2Analysis.presence_score}/100
- Sentiment : ${brand2Analysis.tone_score}/100 (${brand2Analysis.tone_label})
- Cohérence : ${brand2Analysis.coherence_score}/100
- Résumé Google : ${brand2Analysis.google_summary}
- Résumé GPT : ${brand2Analysis.gpt_summary}

STRUCTURE OBLIGATOIRE avec formatage Markdown :

# ⚔️ **DUEL COMPARATIF**

## **🏆 VERDICT FINAL**
[Annonce du gagnant avec un verdict tranché et justifié]

## **📊 COMPARAISON DÉTAILLÉE**

### **🔍 Présence Digitale**
[Analyse comparative des scores de présence avec explications concrètes]

### **💭 Sentiment Public**
[Comparaison des réputations avec exemples précis des sources]

### **⚖️ Cohérence Message**
[Évaluation de l'alignement de chaque marque avec le message testé]

## **🎯 POINTS FORTS ET FAIBLESSES**

### **${brand1}**
**Forces :** [Points forts spécifiques avec preuves]
**Faiblesses :** [Points faibles identifiés avec exemples]

### **${brand2}**
**Forces :** [Points forts spécifiques avec preuves]
**Faiblesses :** [Points faibles identifiés avec exemples]

## **📈 RECOMMANDATIONS STRATÉGIQUES**

### **Pour ${brand1}**
- [Recommandation 1 ULTRA-SPÉCIFIQUE]
- [Recommandation 2 ULTRA-SPÉCIFIQUE]

### **Pour ${brand2}**
- [Recommandation 1 ULTRA-SPÉCIFIQUE]
- [Recommandation 2 ULTRA-SPÉCIFIQUE]

## **🚀 OPPORTUNITÉS CONCURRENTIELLES**
[Analyse des opportunités pour chaque marque de surpasser l'autre]

---
*Comparaison basée sur une analyse multi-critères • Message analysé : "${message}"*

EXIGENCES CRITIQUES : 
- Sois DIRECT et TRANCHÉ dans tes conclusions
- Base-toi sur les VRAIES données d'analyse, pas sur des suppositions
- Identifie des différences CONCRÈTES entre les deux marques
- Donne des recommandations SPÉCIFIQUES et ACTIONNABLES
- Utilise les données des résumés Google et GPT pour étayer tes arguments`

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
            "Tu es un expert en analyse comparative qui excelle dans les duels de réputation. Tu fournis des comparaisons détaillées, équilibrées mais décisives, avec des recommandations stratégiques précises pour chaque entité analysée.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "duel_comparison",
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

  return content_json.detailed_comparison
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let logData: any = {
    type: "duel" as const,
    user_agent: request.headers.get("user-agent") || "Unknown",
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
  }

  try {
    console.log("[v0] Duel API started")
    console.log("[v0] Environment variables check:")
    console.log("[v0] GOOGLE_API_KEY present:", !!process.env.GOOGLE_API_KEY)
    console.log("[v0] GOOGLE_CSE_CX present:", !!process.env.GOOGLE_CSE_CX)
    console.log("[v0] OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY)

    // Explicit environment variable validation
    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OPENAI_API_KEY is missing")
      return NextResponse.json({ error: "Configuration manquante: OpenAI API Key" }, { status: 500 })
    }

    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_CX) {
      console.error("[v0] Google API credentials missing")
      return NextResponse.json({ error: "Configuration manquante: Google API" }, { status: 500 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body))

    const { brand1, brand2, message, language } = DuelRequestSchema.parse(body)

    logData = {
      ...logData,
      query: `${brand1} vs ${brand2}`,
      brand1,
      brand2,
      language,
    }

    console.log(`[v0] Starting comprehensive duel: "${brand1}" vs "${brand2}" for "${message}"`)

    console.log("[v0] Analyzing brand1 with full details...")
    const brand1Analysis = await analyzeBrandSequentially(brand1, message, language)

    console.log("[v0] Analyzing brand2 with full details...")
    const brand2Analysis = await analyzeBrandSequentially(brand2, message, language)

    console.log("[v0] Both comprehensive analyses completed")

    // Calculate global scores
    const brand1GlobalScore = Math.round(
      (brand1Analysis.presence_score + brand1Analysis.tone_score + brand1Analysis.coherence_score) / 3,
    )
    const brand2GlobalScore = Math.round(
      (brand2Analysis.presence_score + brand2Analysis.tone_score + brand2Analysis.coherence_score) / 3,
    )

    // Determine winner
    const scoreDiff = Math.abs(brand1GlobalScore - brand2GlobalScore)
    let winner = brand1GlobalScore > brand2GlobalScore ? brand1 : brand2

    if (scoreDiff <= 3) {
      winner = "Match nul"
    }

    const detailedComparison = await generateDuelComparison(
      brand1,
      brand1Analysis,
      brand2,
      brand2Analysis,
      message,
      language,
    )

    console.log("[v0] Detailed comparison generated")

    const result = {
      brand1_analysis: {
        ...brand1Analysis,
        global_score: brand1GlobalScore,
      },
      brand2_analysis: {
        ...brand2Analysis,
        global_score: brand2GlobalScore,
      },
      winner,
      score_difference: scoreDiff,
      detailed_comparison: detailedComparison,
      summary: `${brand1} (${brand1GlobalScore}/100) vs ${brand2} (${brand2GlobalScore}/100). ${
        winner === "Match nul"
          ? "Scores très proches, match nul !"
          : `${winner} l'emporte avec ${scoreDiff} points d'avance.`
      }`,
    }

    const processingTime = (Date.now() - startTime) / 1000
    const totalGoogleResults = (brand1Analysis.sources?.length || 0) + (brand2Analysis.sources?.length || 0)

    await logger.logSearch({
      ...logData,
      results: {
        presence_score: Math.round((brand1Analysis.presence_score + brand2Analysis.presence_score) / 2),
        sentiment_score: Math.round((brand1Analysis.tone_score + brand2Analysis.tone_score) / 2),
        coherence_score: Math.round((brand1Analysis.coherence_score + brand2Analysis.coherence_score) / 2),
        processing_time: processingTime,
        google_results_count: totalGoogleResults,
      },
    })

    console.log("[v0] Comprehensive duel result generated successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Duel API critical error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    console.error("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")

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

    return NextResponse.json(
      {
        brand1_analysis: {
          presence_score: 0,
          tone_score: 0,
          coherence_score: 0,
          tone_label: "neutre",
          rationale: "Erreur lors de l'analyse",
          sources: [],
          global_score: 0,
          detailed_analysis: "# ❌ **ERREUR D'ANALYSE**\n\nUne erreur technique a empêché l'analyse complète.",
        },
        brand2_analysis: {
          presence_score: 0,
          tone_score: 0,
          coherence_score: 0,
          tone_label: "neutre",
          rationale: "Erreur lors de l'analyse",
          sources: [],
          global_score: 0,
          detailed_analysis: "# ❌ **ERREUR D'ANALYSE**\n\nUne erreur technique a empêché l'analyse complète.",
        },
        winner: "Erreur",
        score_difference: 0,
        detailed_comparison: "# ❌ **ERREUR DE DUEL**\n\nUne erreur technique a empêché la comparaison.",
        summary: "Erreur lors du duel",
        error: "Erreur lors du duel",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        errorType: error instanceof Error ? error.name : "Unknown",
      },
      { status: 200 }, // Return 200 instead of 500 to show error results
    )
  }
}
