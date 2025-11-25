import { type NextRequest, NextResponse } from "next/server"

interface EntityOption {
  id: string
  name: string
  description: string
  type: "company" | "person" | "location" | "organization" | "product" | "brand"
  context: string
  confidence: number
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchResults } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const searchContext = searchResults
      ? `\n\nSearch results found:\n${searchResults
          .slice(0, 5)
          .map((r: any) => `- ${r.title}: ${r.snippet}`)
          .join("\n")}`
      : ""

    const disambiguationPrompt = `
    Given the search term "${query}", analyze and identify the most likely distinct entities this could refer to.
    ${searchContext}
    
    Provide 3-5 different possible entities, ranked by confidence (most likely first).
    Consider companies, people, products, brands, locations, and organizations.
    
    Return a JSON array of objects with this exact structure:
    {
      "id": "unique_identifier",
      "name": "Official Entity Name",
      "description": "Clear, specific description (e.g., 'Tech company based in California', 'French footballer', 'Historic town in Corsica')",
      "type": "company|person|location|organization|product|brand",
      "context": "Detailed context for disambiguation (industry, location, notable facts)",
      "confidence": 0.95 // Float between 0 and 1, indicating confidence level
    }
    
    IMPORTANT:
    - Order results by confidence (highest first)
    - Be specific in descriptions to help users distinguish between entities
    - Include geographic/industry context when relevant
    - confidence should reflect how likely this interpretation is
    
    Return ONLY the JSON array, no markdown, no other text.
    `

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert entity disambiguation system. Provide clear, accurate entity distinctions based on search context.",
          },
          {
            role: "user",
            content: disambiguationPrompt,
          },
        ],
        temperature: 0.2, // Lower temperature for more consistent results
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      console.error("[v0] OpenAI API error:", response.status)
      return NextResponse.json([])
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json([])
    }

    try {
      let jsonContent = content.trim()

      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      console.log("[v0] Parsing disambiguation JSON:", jsonContent.substring(0, 200))

      const entities: EntityOption[] = JSON.parse(jsonContent)

      const validEntities = entities
        .filter((entity) => entity.name && entity.description && entity.type && entity.context)
        .map((entity) => ({
          ...entity,
          confidence: entity.confidence || 0.5, // Default confidence if missing
        }))
        .sort((a, b) => b.confidence - a.confidence) // Sort by confidence
        .slice(0, 5)

      console.log(`[v0] Returning ${validEntities.length} disambiguation options`)

      return NextResponse.json(validEntities)
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response:", parseError)
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("[v0] Entity disambiguation error:", error)
    return NextResponse.json([])
  }
}
