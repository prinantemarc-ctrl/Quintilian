import { CACHE_TTL, searchCache } from "@/lib/cache"

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

  const cacheKey = {
    query,
    language: options.language,
    country: options.country,
    maxResults: options.maxResults || 10,
  }

  const { data: searchResults, fromCache } = await searchCache.getOrSet(
    cacheKey,
    async () => {
      try {
        const apiKey = "AIzaSyAeDFbXJiE-KxRm867_XluumQOg51UknC0"
        const cseId = process.env.GOOGLE_CSE_CX

        if (!apiKey || !cseId) {
          console.log("[v0] Missing Google API credentials, using fallback")
          throw new Error("MISSING_CREDENTIALS")
        }

        let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&lr=lang_${options.language}&num=${options.maxResults || 10}`

        if (options.country) {
          url += `&gl=${options.country}&cr=country${options.country.toUpperCase()}`
        }

        console.log("[v0] Making Google API request with geolocation:", options.country || "global")

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.log("[v0] Google API error:", response.status, response.statusText)
          if (response.status === 429) {
            throw new Error("RATE_LIMIT_EXCEEDED")
          }
          throw new Error(`GOOGLE_API_ERROR_${response.status}`)
        }

        const data: GoogleSearchResponse = await response.json()
        console.log("[v0] Google search completed, found", data.items?.length || 0, "results")

        return data.items || []
      } catch (error) {
        console.error("[v0] Google search error:", error)
        throw error
      }
    },
    { ttl: CACHE_TTL.GOOGLE_SEARCH },
  )

  if (fromCache) {
    console.log("[v0] Using cached Google search results")
  }

  return searchResults
}

export async function clearGoogleSearchCache(query: string, options: SearchOptions) {
  const cacheKey = {
    query,
    language: options.language,
    country: options.country,
    maxResults: options.maxResults || 10,
  }

  await searchCache.delete(cacheKey)
  console.log("[v0] Cleared Google search cache for:", query)
}

function generateFallbackResults(): GoogleSearchResult[] {
  return [
    {
      title: "Fallback Source 1",
      link: "https://example.com/1",
      snippet: "Fallback content due to search error",
    },
    {
      title: "Fallback Source 2",
      link: "https://example.com/2",
      snippet: "Fallback content due to search error",
    },
  ]
}

export function formatSearchResultsForAnalysis(results: GoogleSearchResult[]): string {
  return results
    .slice(0, 10)
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
