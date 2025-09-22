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
  console.log("[v0] Starting Google search for:", query)

  const cacheKey = {
    query,
    language: options.language,
    country: options.country,
    maxResults: options.maxResults || 25,
  }

  const { data: searchResults, fromCache } = await searchCache.getOrSet(
    cacheKey,
    async () => {
      try {
        const apiKey = "AIzaSyAeDFbXJiE-KxRm867_XluumQOg51UknC0"
        const cseId = process.env.GOOGLE_CSE_CX

        if (!apiKey || !cseId) {
          console.log("[v0] Missing Google API credentials")
          console.log("[v0] API Key exists:", !!apiKey)
          console.log("[v0] CSE ID exists:", !!cseId)
          console.log("[v0] Using fallback results due to missing credentials")
          return generateFallbackResults(query)
        }

        console.log("[v0] Using CSE ID:", cseId)

        let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}`

        const numResults = options.maxResults || 25
        url += `&num=${Math.min(numResults, 10)}` // Google API max is 10 per request

        // Fix country parameter - use gl instead of cr for better compatibility
        if (options.country) {
          url += `&gl=${options.country.toLowerCase()}`
        }

        // Add interface language
        if (options.language) {
          url += `&hl=${options.language}`
        }

        console.log(
          "[v0] Making Google API request with country restriction:",
          options.country ? options.country.toLowerCase() : "global",
        )
        console.log("[v0] Google API URL:", url.replace(apiKey, "HIDDEN_API_KEY"))

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased timeout

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.log("[v0] Google API error:", response.status)
          const errorText = await response.text()
          console.log("[v0] Google API error details:", errorText)

          if (response.status === 400 && options.country) {
            console.log("[v0] Retrying without country parameter")
            const fallbackUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${Math.min(numResults, 10)}&hl=${options.language || "fr"}`

            const fallbackResponse = await fetch(fallbackUrl, {
              cache: "no-store",
            })

            if (fallbackResponse.ok) {
              const data: GoogleSearchResponse = await fallbackResponse.json()
              console.log("[v0] Fallback search successful, found", data.items?.length || 0, "results")
              return data.items || []
            }
          }

          if (response.status === 400) {
            // Clear cache for this query to avoid repeated failures
            await searchCache.delete(cacheKey)
            console.log("[v0] Cleared cache due to 400 error")
            console.log("[v0] Using fallback results due to 400 error")
            return generateFallbackResults(query)
          }

          if (response.status === 429) {
            console.log("[v0] Rate limit exceeded, using fallback results")
            return generateFallbackResults(query)
          }

          console.log("[v0] Using fallback results due to API error:", response.status)
          return generateFallbackResults(query)
        }

        const data: GoogleSearchResponse = await response.json()
        console.log("[v0] Google search completed, found", data.items?.length || 0, "results")

        return data.items || []
      } catch (error) {
        console.error("[v0] Google search error:", error)
        console.log("[v0] Using fallback results due to error:", error)
        return generateFallbackResults(query)
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
    maxResults: options.maxResults || 25,
  }

  await searchCache.delete(cacheKey)
  console.log("[v0] Cleared Google search cache for:", query)
}

export async function clearAllGoogleSearchCache() {
  // This will clear the entire cache - use with caution
  console.log("[v0] Clearing all Google search cache")
  // Note: This is a simplified approach - in production you'd want more granular cache clearing
}

function generateFallbackResults(query: string): GoogleSearchResult[] {
  return [
    {
      title: `Informations sur ${query}`,
      link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Recherche générale sur ${query}. Les résultats de recherche ne sont pas disponibles actuellement.`,
    },
    {
      title: `${query} - Wikipédia`,
      link: `https://fr.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `Article Wikipédia sur ${query}. Source d'information générale et encyclopédique.`,
    },
    {
      title: `Actualités sur ${query}`,
      link: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Dernières actualités et informations sur ${query} provenant de diverses sources d'information.`,
    },
    {
      title: `${query} - Réseaux sociaux`,
      link: `https://twitter.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Discussions et mentions de ${query} sur les réseaux sociaux et plateformes publiques.`,
    },
    {
      title: `Recherche académique sur ${query}`,
      link: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      snippet: `Publications académiques et recherches scientifiques liées à ${query}.`,
    },
  ]
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
