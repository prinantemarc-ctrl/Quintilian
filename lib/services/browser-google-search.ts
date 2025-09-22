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

  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY
      const cseId = process.env.GOOGLE_CSE_CX

      if (!apiKey || !cseId) {
        console.log("[v0] Missing Google API credentials, using fallback")
        return generateFallbackResults()
      }

      let url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${options.maxResults || 10}`

      if (options.country && options.country.length === 2) {
        const countryCode = options.country.toLowerCase()
        url += `&gl=${countryCode}`
      }

      console.log("[v0] Making Google API request with geolocation:", options.country || "global")

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
          return generateFallbackResults()
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
        return generateFallbackResults()
      }
      const delay = baseDelay * attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return generateFallbackResults()
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
