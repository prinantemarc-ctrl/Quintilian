import { type NextRequest, NextResponse } from "next/server"

interface EntityOption {
  id: string
  name: string
  description: string
  type: "company" | "person" | "location" | "organization"
  context: string
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const disambiguationPrompt = `
    Given the search term "${query}", provide up to 4 different possible entities this could refer to.
    Consider companies, people, locations, and organizations that might share this name.
    
    Return a JSON array of objects with this structure:
    {
      "id": "unique_id",
      "name": "Entity Name",
      "description": "Brief description (company in X industry, person known for Y, etc.)",
      "type": "company|person|location|organization",
      "context": "Additional context for search refinement"
    }
    
    Examples for "Aleria":
    - Company: Aleria AI company in UAE
    - Location: Aleria town in Corsica, France  
    - Company: Aleria tech company in USA
    
    Only return the JSON array, no other text.
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
            role: "user",
            content: disambiguationPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
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

      console.log("[v0] Parsing JSON content:", jsonContent)

      const entities: EntityOption[] = JSON.parse(jsonContent)

      const validEntities = entities
        .filter((entity) => entity.name && entity.description && entity.type && entity.context)
        .slice(0, 4)

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
