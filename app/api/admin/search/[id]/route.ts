import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { id } = params

    const { data: search, error } = await supabase.from("search_logs").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching search details:", error)
      return NextResponse.json({ error: "Search not found" }, { status: 404 })
    }

    return NextResponse.json(search)
  } catch (error) {
    console.error("Error in search details API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
