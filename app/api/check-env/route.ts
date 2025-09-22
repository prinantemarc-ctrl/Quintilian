export async function GET() {
  return Response.json({
    google_api: process.env.GOOGLE_API_KEY ? "✓ Found" : "✗ Missing",
    google_cse: process.env.GOOGLE_CSE_CX ? "✓ Found" : "✗ Missing",
    openai: process.env.OPENAI_API_KEY ? "✓ Found" : "✗ Missing",
  })
}
