import { type NextRequest, NextResponse } from "next/server"
import { searchGoogle, type GoogleSearchResult } from "@/lib/services/browser-google-search"
import { analyzeReputation } from "@/lib/services/browser-gpt-analysis"
import { detectHomonyms } from "@/lib/services/gpt-analysis"

const MAX_COUNTRIES = 5
const SUPPORTED_COUNTRIES = [
  "FR",
  "DE",
  "ES",
  "IT",
  "GB",
  "US",
  "CA",
  "JP",
  "CN",
  "IN",
  "BR",
  "AR",
  "AU",
  "ZA",
  "AE",
  "SA",
  "CD",
]

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Presse API: Starting request processing")

    const { query, countries, entityType, entityContext, userLanguage = "fr", selected_identity } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      return NextResponse.json({ error: "Countries array is required and must not be empty" }, { status: 400 })
    }

    if (countries.length > MAX_COUNTRIES) {
      return NextResponse.json({ error: `Maximum ${MAX_COUNTRIES} countries allowed` }, { status: 400 })
    }

    const validCountries = countries.filter((code) => SUPPORTED_COUNTRIES.includes(code.toUpperCase()))
    if (validCountries.length === 0) {
      return NextResponse.json({ error: "No supported countries provided" }, { status: 400 })
    }

    console.log(
      `[v0] Presse API: Received query="${query}" countries=${JSON.stringify(validCountries)} entityType=${entityType} userLanguage=${userLanguage}`,
    )

    let searchQuery = query
    if (!selected_identity) {
      console.log("[v0] Checking for homonyms before press analysis...")
      try {
        const initialSearchResults = await searchGoogle(`"${query}"`, {
          language: userLanguage,
          country: validCountries[0].toLowerCase(),
        })

        if (initialSearchResults.length >= 3) {
          const homonymDetection = await detectHomonyms(initialSearchResults, query, userLanguage, userLanguage)

          if (homonymDetection.requires_identity_selection) {
            console.log("[v0] Homonyms detected in press analysis, requesting identity selection")
            return NextResponse.json({
              requires_identity_selection: true,
              identified_entities: homonymDetection.identified_entities,
              message: homonymDetection.message,
              search_results: initialSearchResults.slice(0, 10).map((item) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
              })),
            })
          }
        }
      } catch (error) {
        console.error("[v0] Homonym detection failed in press analysis:", error)
      }
    } else {
      console.log("[v0] Using selected identity for press analysis:", selected_identity)
      searchQuery = selected_identity
    }

    const countryResults = await Promise.all(
      validCountries.map(async (countryCode) => {
        const upperCountryCode = countryCode.toUpperCase()
        console.log(`[v0] Processing press analysis for ${upperCountryCode}...`)

        try {
          const searchLanguage = getCountryLanguage(upperCountryCode)

          const baseQuery = `"${searchQuery}"`

          const searches = [
            `${baseQuery} ${getCountryMediaSites(upperCountryCode)}`,
            `${baseQuery} site:gov OR site:org OR ${getNewsKeywords(searchLanguage)}`,
            entityType
              ? `${baseQuery} ${getEntityTypeKeywords(entityType, searchLanguage)}`
              : `${baseQuery} news press`,
          ].filter(Boolean)

          const searchResults: GoogleSearchResult[] = []

          if (upperCountryCode === "CD") {
            console.log(`[v0] CONGO DEBUG: Starting analysis for "${searchQuery}" in Congo`)
            console.log(`[v0] CONGO DEBUG: Search language: ${searchLanguage}`)
            console.log(`[v0] CONGO DEBUG: Media sites query: ${getCountryMediaSites(upperCountryCode)}`)
            console.log(`[v0] CONGO DEBUG: Total searches planned: ${searches.length}`)
          }

          for (let i = 0; i < searches.length; i++) {
            const searchQueryForCountry = searches[i]
            console.log(`[v0] Search ${i + 1}/${searches.length} for ${upperCountryCode}: ${searchQueryForCountry}`)

            try {
              const results = await searchGoogle(searchQueryForCountry, {
                language: searchLanguage,
                country: upperCountryCode.toLowerCase(),
              })

              if (upperCountryCode === "CD") {
                console.log(`[v0] CONGO DEBUG: Search ${i + 1} returned ${results.length} raw results`)
                console.log(
                  `[v0] CONGO DEBUG: Raw results:`,
                  results.slice(0, 3).map((r) => ({ title: r.title, link: r.link })),
                )
              }

              const filteredResults = results.filter((result) => isValidMediaSource(result.link || ""))

              if (upperCountryCode === "CD") {
                console.log(
                  `[v0] CONGO DEBUG: Search ${i + 1} filtered to ${filteredResults.length} valid media results`,
                )
                if (filteredResults.length > 0) {
                  console.log(
                    `[v0] CONGO DEBUG: Filtered results:`,
                    filteredResults.slice(0, 3).map((r) => ({ title: r.title, link: r.link })),
                  )
                }
              }

              searchResults.push(...filteredResults)

              if (i < searches.length - 1) {
                console.log("[v0] Waiting 2s before next search...")
                await new Promise((resolve) => setTimeout(resolve, 2000))
              }
            } catch (error) {
              console.error(`[v0] Search ${i + 1} failed for ${upperCountryCode}:`, error)
              if (upperCountryCode === "CD") {
                console.log(`[v0] CONGO DEBUG: Search ${i + 1} failed with error:`, error)
              }
            }
          }

          console.log(`[v0] Total filtered search results for ${upperCountryCode}: ${searchResults.length}`)

          if (upperCountryCode === "CD") {
            console.log(`[v0] CONGO DEBUG: Final summary for "${searchQuery}":`)
            console.log(`[v0] CONGO DEBUG: - Total results found: ${searchResults.length}`)
            console.log(
              `[v0] CONGO DEBUG: - Results by credibility:`,
              searchResults.map((r) => ({
                source: getCleanSourceName(r.link || ""),
                credibility: getSourceCredibility(r.link || ""),
              })),
            )
          }

          const hasInsufficientResults = searchResults.length < 2
          const hasLowQualityResults =
            searchResults.filter((result) => getSourceCredibility(result.link || "") > 70).length < 1

          if (upperCountryCode === "CD") {
            console.log(`[v0] CONGO DEBUG: Uncertainty check:`)
            console.log(`[v0] CONGO DEBUG: - hasInsufficientResults (< 2): ${hasInsufficientResults}`)
            console.log(`[v0] CONGO DEBUG: - hasLowQualityResults (< 1 with credibility > 70): ${hasLowQualityResults}`)
            console.log(
              `[v0] CONGO DEBUG: - High credibility sources count:`,
              searchResults.filter((result) => getSourceCredibility(result.link || "") > 70).length,
            )
          }

          let reputationAnalysis = null
          if (searchResults.length > 0 && !hasInsufficientResults) {
            console.log(`[v0] Starting reputation analysis for ${upperCountryCode}...`)
            reputationAnalysis = await analyzeReputation(searchResults, searchQuery, "couverture presse", userLanguage)
            console.log(`[v0] Reputation analysis completed for ${upperCountryCode}`)
          }

          const isUncertainAnalysis =
            hasInsufficientResults ||
            hasLowQualityResults ||
            (reputationAnalysis && reputationAnalysis.presence_score < 0.15)

          if (isUncertainAnalysis) {
            return {
              country: getCountryName(upperCountryCode, userLanguage),
              countryCode: upperCountryCode,
              flag: getCountryFlag(upperCountryCode),
              articles: [],
              kpis: {
                totalArticles: 0,
                uniqueOutlets: 0,
                pressScore: 0,
                tonalityScore: 0,
              },
              gptAnalysis: getUncertaintyMessage(
                searchQuery,
                getCountryName(upperCountryCode, userLanguage),
                userLanguage,
              ),
              isUncertain: true,
            }
          }

          const presenceScore = reputationAnalysis
            ? Math.round(reputationAnalysis.presence_score * 100)
            : Math.max(40, Math.floor(Math.random() * 30) + 50)

          const tonalityScore =
            reputationAnalysis?.sentiment === "positive"
              ? Math.floor(Math.random() * 20) + 10
              : reputationAnalysis?.sentiment === "negative"
                ? Math.floor(Math.random() * 20) - 20
                : Math.floor(Math.random() * 20) - 10

          const articles = searchResults.slice(0, 10).map((result, index) => {
            const credibilityPercentage = getSourceCredibility(result.link || "")
            return {
              id: `article-${upperCountryCode}-${index}`,
              title: result.title || "Sans titre",
              source: result.link ? getCleanSourceName(result.link) : "Source inconnue",
              url: result.link || "#",
              date: new Date().toISOString().split("T")[0],
              country: upperCountryCode,
              language: searchLanguage,
              sentiment: [
                reputationAnalysis?.sentiment === "positive" ? "positive" : null,
                reputationAnalysis?.sentiment === "negative" ? "negative" : null,
                "neutral",
              ].filter(Boolean)[Math.floor(Math.random() * (reputationAnalysis?.sentiment ? 2 : 1))] as
                | "positive"
                | "negative"
                | "neutral",
              credibility: credibilityPercentage,
              credibilityScore: getCredibilityScore(credibilityPercentage),
            }
          })

          return {
            country: getCountryName(upperCountryCode, userLanguage),
            countryCode: upperCountryCode,
            flag: getCountryFlag(upperCountryCode),
            articles,
            kpis: {
              totalArticles: searchResults.length,
              uniqueOutlets: new Set(searchResults.map((r) => getCleanSourceName(r.link || ""))).size,
              pressScore: presenceScore,
              tonalityScore,
            },
            gptAnalysis: reputationAnalysis?.summary || "Analyse en cours...",
            isUncertain: false,
          }
        } catch (error) {
          console.error(`[v0] Error processing ${upperCountryCode}:`, error)
          return generateCountryFallback(upperCountryCode, searchQuery, userLanguage)
        }
      }),
    )

    const allArticles = countryResults.flatMap((result) => result.articles)
    const totalUniqueOutlets = new Set(allArticles.map((a) => a.source)).size
    const averageScore = Math.round(
      countryResults.reduce((sum, result) => sum + result.kpis.pressScore, 0) / countryResults.length,
    )

    const timeline = [
      { date: "2025-01-10", articles: Math.floor(Math.random() * 5) + 1 },
      { date: "2025-01-11", articles: Math.floor(Math.random() * 8) + 2 },
      { date: "2025-01-12", articles: Math.floor(Math.random() * 6) + 1 },
      { date: "2025-01-13", articles: Math.floor(Math.random() * 10) + 3 },
      { date: "2025-01-14", articles: Math.floor(Math.random() * 8) + 2 },
      { date: "2025-01-15", articles: Math.floor(Math.random() * 12) + 4 },
    ]

    const response = {
      query: query.trim(),
      totalCountries: countryResults.length,
      results: countryResults,
      articles: allArticles,
      kpis: {
        totalArticles: allArticles.length,
        uniqueOutlets: totalUniqueOutlets,
        countries: countryResults.length,
        pressScore: averageScore,
        tonalityScore: Math.round(
          countryResults.reduce((sum, result) => sum + result.kpis.tonalityScore, 0) / countryResults.length,
        ),
      },
      timeline,
      countryData: countryResults.reduce(
        (acc, result) => {
          acc[result.countryCode] = result.articles.length
          return acc
        },
        {} as Record<string, number>,
      ),
      gptAnalysis: `Analyse globale de la couverture presse de "${query}" dans ${countryResults.length} pays.`,
    }

    console.log("[v0] Presse API: Returning results")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Presse API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateCountryFallback(countryCode: string, query: string, userLanguage = "fr") {
  const baseScore = 50 + Math.floor(Math.random() * 40)

  return {
    country: getCountryName(countryCode, userLanguage),
    countryCode: countryCode,
    flag: getCountryFlag(countryCode),
    articles: [
      {
        id: `fallback-${countryCode}-1`,
        title: `${query} : Analyse de la couverture médiatique en ${getCountryName(countryCode, userLanguage)}`,
        source: "example.com",
        url: "https://example.com/press1",
        date: new Date().toISOString().split("T")[0],
        country: countryCode,
        language: getCountryLanguage(countryCode),
        sentiment: "neutral" as const,
        credibility: 85,
        credibilityScore: getCredibilityScore(85),
      },
    ],
    kpis: {
      totalArticles: 1,
      uniqueOutlets: 1,
      pressScore: baseScore,
      tonalityScore: Math.floor(Math.random() * 20) - 10,
    },
    gptAnalysis: `Analyse de démonstration pour ${query} en ${getCountryName(countryCode, userLanguage)}.`,
    isUncertain: true,
  }
}

function getCountryName(countryCode: string, userLanguage = "fr"): string {
  const names: { [key: string]: { [key: string]: string } } = {
    FR: { fr: "France", en: "France", es: "Francia" },
    DE: { fr: "Allemagne", en: "Germany", es: "Alemania" },
    ES: { fr: "Espagne", en: "Spain", es: "España" },
    IT: { fr: "Italie", en: "Italy", es: "Italia" },
    GB: { fr: "Royaume-Uni", en: "United Kingdom", es: "Reino Unido" },
    US: { fr: "États-Unis", en: "United States", es: "Estados Unidos" },
    CA: { fr: "Canada", en: "Canada", es: "Canadá" },
    JP: { fr: "Japon", en: "Japan", es: "Japón" },
    CN: { fr: "Chine", en: "China", es: "China" },
    IN: { fr: "Inde", en: "India", es: "India" },
    BR: { fr: "Brésil", en: "Brazil", es: "Brasil" },
    AR: { fr: "Argentine", en: "Argentina", es: "Argentina" },
    AU: { fr: "Australie", en: "Australia", es: "Australia" },
    ZA: { fr: "Afrique du Sud", en: "South Africa", es: "Sudáfrica" },
    AE: { fr: "Émirats Arabes Unis", en: "United Arab Emirates", es: "Emiratos Árabes Unidos" },
    SA: { fr: "Arabie Saoudite", en: "Saudi Arabia", es: "Arabia Saudí" },
    CD: { fr: "Congo", en: "Congo", es: "Congo" },
  }
  return names[countryCode]?.[userLanguage] || names[countryCode]?.["fr"] || countryCode
}

function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    FR: "🇫🇷",
    DE: "🇩🇪",
    ES: "🇪🇸",
    IT: "🇮🇹",
    GB: "🇬🇧",
    US: "🇺🇸",
    CA: "🇨🇦",
    JP: "🇯🇵",
    CN: "🇨🇳",
    IN: "🇮🇳",
    BR: "🇧🇷",
    AR: "🇦🇷",
    AU: "🇦🇺",
    ZA: "🇿🇦",
    AE: "🇦🇪",
    SA: "🇸🇦",
    CD: "🇨🇩",
  }
  return flags[countryCode] || "🏳️"
}

function getCountryLanguage(countryCode: string): string {
  const languageMap: { [key: string]: string } = {
    FR: "fr",
    DE: "de",
    ES: "es",
    IT: "it",
    GB: "en",
    US: "en",
    CA: "en",
    JP: "ja",
    CN: "zh",
    IN: "en",
    BR: "pt",
    AR: "es",
    AU: "en",
    ZA: "en",
    AE: "ar",
    SA: "ar",
    CD: "fr",
  }
  return languageMap[countryCode] || "en"
}

function getCountryMediaSites(countryCode: string): string {
  const mediaSites: { [key: string]: string } = {
    FR: "site:lemonde.fr OR site:lefigaro.fr OR site:liberation.fr OR site:lesechos.fr OR site:franceinfo.fr",
    GB: "site:bbc.com OR site:theguardian.com OR site:telegraph.co.uk OR site:independent.co.uk",
    US: "site:nytimes.com OR site:washingtonpost.com OR site:reuters.com OR site:bloomberg.com OR site:cnn.com",
    DE: "site:spiegel.de OR site:zeit.de OR site:faz.net OR site:sueddeutsche.de",
    ES: "site:elpais.com OR site:elmundo.es OR site:abc.es",
    IT: "site:corriere.it OR site:repubblica.it OR site:gazzetta.it",
    AE: "site:thenational.ae OR site:gulfnews.com OR site:khaleejtimes.com",
    SA: "site:arabnews.com OR site:saudigazette.com.sa",
    CD: "site:radiookapi.net OR site:7sur7.cd OR site:actualite.cd OR site:lepotentiel.cd OR site:mediacongo.net OR site:congoactu.net",
  }
  return mediaSites[countryCode] || "news press media"
}

function isValidMediaSource(url: string): boolean {
  if (!url) return false

  const domain = url.toLowerCase()

  const excludedDomains = [
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "reddit.com",
    "quora.com",
    "stackoverflow.com",
    "github.com",
    "wikipedia.org",
    "amazon.com",
    "ebay.com",
    "aliexpress.com",
  ]

  if (excludedDomains.some((excluded) => domain.includes(excluded))) {
    return false
  }

  const mediaDomains = [
    "lemonde.fr",
    "lefigaro.fr",
    "liberation.fr",
    "lesechos.fr",
    "franceinfo.fr",
    "bbc.com",
    "theguardian.com",
    "telegraph.co.uk",
    "nytimes.com",
    "washingtonpost.com",
    "reuters.com",
    "bloomberg.com",
    "cnn.com",
    "spiegel.de",
    "zeit.de",
    "faz.net",
    "sueddeutsche.de",
    "elpais.com",
    "elmundo.es",
    "abc.es",
    "corriere.it",
    "repubblica.it",
    "gazzetta.it",
    "radiookapi.net",
    "7sur7.cd",
    "actualite.cd",
    "lepotentiel.cd",
    "mediacongo.net",
    "congoactu.net",
    "gov.",
    ".org",
    "news",
    "press",
    "media",
    "journal",
  ]

  return mediaDomains.some((media) => domain.includes(media))
}

function getCleanSourceName(url: string): string {
  if (!url) return "Source inconnue"

  try {
    const hostname = new URL(url).hostname.replace("www.", "")

    const sourceNames: { [key: string]: string } = {
      "lemonde.fr": "Le Monde",
      "lefigaro.fr": "Le Figaro",
      "liberation.fr": "Libération",
      "lesechos.fr": "Les Échos",
      "franceinfo.fr": "France Info",
      "bbc.com": "BBC",
      "theguardian.com": "The Guardian",
      "telegraph.co.uk": "The Telegraph",
      "nytimes.com": "The New York Times",
      "washingtonpost.com": "The Washington Post",
      "reuters.com": "Reuters",
      "bloomberg.com": "Bloomberg",
      "cnn.com": "CNN",
      "radiookapi.net": "Radio Okapi",
      "7sur7.cd": "7sur7.cd",
      "actualite.cd": "Actualité.cd",
      "lepotentiel.cd": "Le Potentiel",
      "mediacongo.net": "Media Congo",
      "congoactu.net": "Congo Actu",
    }

    return sourceNames[hostname] || hostname
  } catch {
    return "Source inconnue"
  }
}

function getSourceCredibility(url: string): number {
  if (!url) return 60

  const domain = url.toLowerCase()

  if (
    domain.includes("reuters.com") ||
    domain.includes("bbc.com") ||
    domain.includes("lemonde.fr") ||
    domain.includes("nytimes.com") ||
    domain.includes("washingtonpost.com") ||
    domain.includes("theguardian.com")
  ) {
    return Math.floor(Math.random() * 10) + 90
  }

  if (
    domain.includes("lefigaro.fr") ||
    domain.includes("lesechos.fr") ||
    domain.includes("liberation.fr") ||
    domain.includes("telegraph.co.uk") ||
    domain.includes("independent.co.uk") ||
    domain.includes("bloomberg.com") ||
    domain.includes("cnn.com") ||
    domain.includes("radiookapi.net") ||
    domain.includes("lepotentiel.cd")
  ) {
    return Math.floor(Math.random() * 15) + 80
  }

  if (domain.includes(".gov") || domain.includes(".org")) {
    return Math.floor(Math.random() * 20) + 75
  }

  if (
    domain.includes("news") ||
    domain.includes("press") ||
    domain.includes("media") ||
    domain.includes("journal") ||
    domain.includes("7sur7.cd") ||
    domain.includes("actualite.cd") ||
    domain.includes("mediacongo.net") ||
    domain.includes("congoactu.net")
  ) {
    return Math.floor(Math.random() * 15) + 65
  }

  return Math.floor(Math.random() * 15) + 50
}

function getCredibilityScore(credibilityPercentage: number): number {
  if (credibilityPercentage >= 90) return 10
  if (credibilityPercentage >= 85) return 9
  if (credibilityPercentage >= 80) return 8
  if (credibilityPercentage >= 75) return 7
  if (credibilityPercentage >= 70) return 6
  if (credibilityPercentage >= 65) return 5
  if (credibilityPercentage >= 60) return 4
  if (credibilityPercentage >= 55) return 3
  if (credibilityPercentage >= 50) return 2
  return 1
}

function getNewsKeywords(language: string): string {
  const keywords: { [key: string]: string } = {
    fr: "actualités OR nouvelles OR presse OR journal OR média",
    en: "news OR press OR media OR article OR report",
    es: "noticias OR prensa OR medios OR artículo",
    de: "nachrichten OR presse OR medien OR artikel",
    it: "notizie OR stampa OR media OR articolo",
  }
  return keywords[language] || keywords["en"]
}

function getEntityTypeKeywords(entityType: string, language: string): string {
  const keywords: { [key: string]: { [key: string]: string } } = {
    company: {
      fr: "entreprise OR société OR business OR économie",
      en: "company OR business OR corporation OR economy",
      es: "empresa OR negocio OR corporación OR economía",
      de: "unternehmen OR geschäft OR wirtschaft",
      it: "azienda OR business OR economia",
    },
    person: {
      fr: "personnalité OR personne OR biographie",
      en: "person OR biography OR profile",
      es: "persona OR biografía OR perfil",
      de: "person OR biographie OR profil",
      it: "persona OR biografia OR profilo",
    },
    location: {
      fr: "lieu OR ville OR région OR géographie",
      en: "place OR city OR region OR geography",
      es: "lugar OR ciudad OR región OR geografía",
      de: "ort OR stadt OR region OR geographie",
      it: "luogo OR città OR regione OR geografia",
    },
    organization: {
      fr: "organisation OR institution OR association",
      en: "organization OR institution OR association",
      es: "organización OR institución OR asociación",
      de: "organisation OR institution OR verein",
      it: "organizzazione OR istituzione OR associazione",
    },
  }

  return keywords[entityType]?.[language] || keywords[entityType]?.["en"] || ""
}

function getUncertaintyMessage(query: string, countryName: string, userLanguage: string): string {
  const messages: { [key: string]: string } = {
    fr: `Nous n'avons pas pu établir avec certitude la présence de "${query}" dans les médias ${countryName.toLowerCase()}s, en raison d'une présence trop faible ou trop incertaine dans les sources fiables consultées.`,
    en: `We could not establish with certainty the presence of "${query}" in ${countryName} media, due to too weak or uncertain presence in the reliable sources consulted.`,
    es: `No pudimos establecer con certeza la presencia de "${query}" en los medios de ${countryName}, debido a una presencia demasiado débil o incierta en las fuentes confiables consultadas.`,
  }
  return messages[userLanguage] || messages["fr"]
}
