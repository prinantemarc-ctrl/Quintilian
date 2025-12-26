import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CreditManager } from "@/lib/credits"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const credits = await CreditManager.getUserCredits(user.id)
    return NextResponse.json(credits)
  } catch (error) {
    console.error("[v0] Error fetching credits:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
