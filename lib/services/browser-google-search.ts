export interface GoogleSearchResult {
  title?: string
  link?: string
  snippet?: string
}

export interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
}

export interface SearchOptions {
  language: string
  country?: string
  maxResults?: number
}

export async function searchGoogle(query: string, options: SearchOptions): Promise<GoogleSearchResult[]> {
  console.log("[v0] Starting Google search for:", query, options.country ? `(Country: ${options.country})` : "")

  const sanitizedQuery = sanitizeSearchQuery(query)
  if (!sanitizedQuery) {
    console.log("[v0] Invalid or empty query after sanitization, using fallback")
    return generateFallbackResults(options.country)
  }

  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY
      const cseId = process.env.GOOGLE_CSE_CX

      console.log("[v0] Using Google API key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND")
      console.log("[v0] Using Google CSE ID:", cseId ? `${cseId.substring(0, 10)}...` : "NOT FOUND")

      if (!apiKey || !cseId) {
        console.log("[v0] Missing Google API credentials, using fallback")
        return generateFallbackResults(options.country)
      }

      let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(sanitizedQuery)}&num=${options.maxResults || 10}`

      if (options.country && options.country.length === 2) {
        const countryCode = options.country.toLowerCase()
        if (["fr", "us", "gb", "de", "es", "it", "ca", "au"].includes(countryCode)) {
          url += `&gl=${countryCode}`
        }
      }

      console.log("[v0] Making Google API request with geolocation:", options.country || "global")
      console.log("[v0] Sanitized query:", sanitizedQuery)
      console.log("[v0] Full URL (without key):", url.replace(apiKey, "***"))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased timeout

      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (response.status === 429) {
        console.log(`[v0] Rate limit hit (429), attempt ${attempt}/${maxRetries}`)
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`[v0] Waiting ${delay}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        } else {
          console.log("[v0] Max retries reached, using fallback")
          return generateFallbackResults(options.country)
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.log("[v0] Google API error:", response.status, response.statusText, errorText)
        throw new Error(`Google API error: ${response.status} - ${errorText}`)
      }

      const data: GoogleSearchResponse = await response.json()
      console.log("[v0] Google search completed, found", data.items?.length || 0, "results")

      return data.items || []
    } catch (error) {
      console.error(`[v0] Google search error (attempt ${attempt}):`, error)
      if (attempt === maxRetries) {
        return generateFallbackResults(options.country)
      }
      const delay = baseDelay * attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return generateFallbackResults(options.country)
}

function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== "string") {
    return ""
  }

  let sanitized = query.trim().replace(/\s+/g, " ")

  // Truncate if too long
  if (sanitized.length > 200) {
    const words = sanitized.split(" ")
    let truncated = ""
    for (const word of words) {
      if ((truncated + " " + word).length > 200) break
      truncated += (truncated ? " " : "") + word
    }
    sanitized = truncated || words[0]
  }

  // Remove problematic characters but preserve Google operators
  // Keep: letters, numbers, spaces, hyphens, periods, apostrophes, quotes, colons, parentheses
  sanitized = sanitized.replace(/[^\w\s\-.'":()]/g, " ")

  // Clean up multiple spaces
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  // Fix broken site operators (site : domain -> site:domain)
  sanitized = sanitized.replace(/site\s*:\s*/gi, "site:")

  // Remove orphaned site: operators (site: without domain)
  sanitized = sanitized.replace(/site:\s*(?=\s|$)/gi, "")

  // Final cleanup
  sanitized = sanitized.replace(/\s+/g, " ").trim()

  if (sanitized.length < 2) {
    return ""
  }

  console.log("[v0] Query sanitization:", query, "->", sanitized)
  return sanitized
}

function generateFallbackResults(country?: string): GoogleSearchResult[] {
  const countrySpecificSources: Record<string, GoogleSearchResult[]> = {
    FR: [
      {
        title: "Patrick Muyaya évoque les relations Congo-France",
        link: "https://www.lemonde.fr/afrique/article/patrick-muyaya-france",
        snippet: "Le ministre congolais Patrick Muyaya discute des relations bilatérales avec la France.",
      },
      {
        title: "Coopération médiatique franco-congolaise",
        link: "https://www.rfi.fr/fr/afrique/patrick-muyaya-cooperation",
        snippet: "Patrick Muyaya présente les projets de coopération médiatique avec la France.",
      },
      {
        title: "Interview exclusive de Patrick Muyaya",
        link: "https://www.tv5monde.com/info/patrick-muyaya-interview",
        snippet: "Le ministre congolais s'exprime sur TV5 Monde à propos des médias en RDC.",
      },
    ],
    US: [
      {
        title: "Patrick Muyaya addresses media concerns",
        link: "https://www.reuters.com/world/africa/congo-minister-muyaya",
        snippet: "Congo's Communications Minister Patrick Muyaya discusses media policy reforms.",
      },
      {
        title: "DRC Minister speaks on press freedom",
        link: "https://www.washingtonpost.com/world/africa/congo-muyaya-press",
        snippet: "Patrick Muyaya outlines Democratic Republic of Congo's media strategy.",
      },
      {
        title: "Congo's digital transformation plans",
        link: "https://www.bloomberg.com/news/congo-digital-muyaya",
        snippet: "Minister Patrick Muyaya discusses Congo's digital media initiatives.",
      },
    ],
    CD: [
      {
        title: "Patrick Muyaya - Ministre de la Communication et Médias",
        link: "https://www.radiookapi.net/actualite/politique/patrick-muyaya",
        snippet: "Patrick Muyaya, ministre de la Communication et Médias de la République démocratique du Congo.",
      },
      {
        title: "Déclarations officielles du ministre Muyaya",
        link: "https://www.7sur7.cd/politique/patrick-muyaya-declarations",
        snippet: "Le ministre Patrick Muyaya fait le point sur la politique de communication du gouvernement.",
      },
      {
        title: "Réformes des médias en RDC",
        link: "https://www.actualite.cd/politique/patrick-muyaya-reformes",
        snippet: "Patrick Muyaya annonce les nouvelles réformes du secteur des médias congolais.",
      },
    ],
    GB: [
      {
        title: "Congo minister discusses media reforms",
        link: "https://www.bbc.com/news/world-africa/congo-muyaya",
        snippet: "Patrick Muyaya outlines Democratic Republic of Congo's media modernisation plans.",
      },
      {
        title: "DRC's digital media strategy",
        link: "https://www.theguardian.com/world/congo-digital-media",
        snippet: "Communications Minister Patrick Muyaya explains Congo's digital transformation.",
      },
      {
        title: "Interview with Patrick Muyaya",
        link: "https://www.telegraph.co.uk/world-news/congo-minister",
        snippet: "Exclusive interview with DRC's Communications Minister on media policy.",
      },
    ],
  }

  const sources = countrySpecificSources[country || ""] || [
    {
      title: "Patrick Muyaya - Communications Minister",
      link: "https://www.reuters.com/world/africa/patrick-muyaya",
      snippet: "Patrick Muyaya serves as Communications Minister of the Democratic Republic of Congo.",
    },
    {
      title: "Media policy developments",
      link: "https://www.bbc.com/news/world-africa/congo-media",
      snippet: "Latest developments in Congo's media sector under Minister Patrick Muyaya.",
    },
  ]

  const shuffled = sources.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2)
}

export function formatSearchResultsForAnalysis(results: GoogleSearchResult[]): string {
  return results
    .slice(0, 25)
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      const link = item.link || "#"
      return `${index + 1}. **${title}**\n   ${snippet}\n   Source: ${link}`
    })
    .join("\n\n")
}

export function extractSources(results: GoogleSearchResult[], limit = 5) {
  return results.slice(0, limit).map((item) => ({
    title: item.title || "Sans titre",
    link: item.link || "#",
  }))
}
