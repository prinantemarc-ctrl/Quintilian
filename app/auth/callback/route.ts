import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to homepage after successful email confirmation
      return NextResponse.redirect(`${origin}/?confirmed=true`)
    }
  }

  // Return to homepage with error if something went wrong
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
