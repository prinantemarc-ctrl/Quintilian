import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get("format") as "json" | "csv") || "csv"

    const supabase = createServiceClient()

    const { data: logs, error } = await supabase
      .from("search_logs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    let exportData: string

    if (format === "json") {
      exportData = JSON.stringify(logs, null, 2)
    } else {
      // CSV format
      const headers = [
        "id",
        "created_at",
        "query",
        "url",
        "analysis_type",
        "language",
        "processing_time_ms",
        "error_message",
      ]
      const csvRows = [
        headers.join(","),
        ...logs.map((log) =>
          headers
            .map((header) => {
              const value = log[header]
              return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value || ""
            })
            .join(","),
        ),
      ]
      exportData = csvRows.join("\n")
    }

    const filename = `search-logs-${new Date().toISOString().split("T")[0]}.${format}`
    const contentType = format === "json" ? "application/json" : "text/csv"

    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export logs" }, { status: 500 })
  }
}
