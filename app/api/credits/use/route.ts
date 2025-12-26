import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CreditManager } from "@/lib/credits"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description } = await request.json()

    const success = await CreditManager.deductCredits(user.id, amount, description || "Credit usage")

    if (!success) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const updatedCredits = await CreditManager.getUserCredits(user.id)
    return NextResponse.json({ success: true, credits: updatedCredits })
  } catch (error) {
    console.error("Error using credits:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
