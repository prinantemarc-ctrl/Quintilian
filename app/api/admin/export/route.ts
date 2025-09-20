import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get("format") as "json" | "csv") || "csv"

    const exportData = await logger.exportLogs(format)

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
