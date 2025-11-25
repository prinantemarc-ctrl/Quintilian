export async function callOpenAI(
  messages: { role: string; content: string }[],
  options: {
    temperature?: number
    max_tokens?: number
    response_format?: { type: "json_object" }
  } = {},
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set")
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
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.response_format && { response_format: options.response_format }),
    }),
  })

  const data = await response.json()
  if (response.ok) {
    return data.choices[0].message.content
  } else {
    throw new Error(`OpenAI API error: ${data.error.message}`)
  }
}
