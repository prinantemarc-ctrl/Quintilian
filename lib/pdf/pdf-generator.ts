import jsPDF from "jspdf"

// Colors matching MAK-IA brand and interface
const colors = {
  primary: [124, 58, 237] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  yellow: [245, 158, 11] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  purple: [168, 85, 247] as [number, number, number],
  gray: [156, 163, 175] as [number, number, number],
  lightGray: [229, 231, 235] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
}

function addHeaderFooter(doc: jsPDF, pageNumber: number, dateStr: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Dark header bar
  doc.setFillColor(17, 24, 39)
  doc.rect(0, 0, pageWidth, 8, "F")

  // Logo
  doc.setTextColor(...colors.primary)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("MAK-IA", 20, 20)

  // Page number
  doc.setTextColor(...colors.gray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Page ${pageNumber}`, pageWidth - 20, 20, { align: "right" })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...colors.gray)
  doc.text("Confidential - MAK-IA Intelligence", 20, pageHeight - 10)
  doc.text(dateStr, pageWidth - 20, pageHeight - 10, { align: "right" })
}

function drawSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(...colors.primary)
  doc.rect(20, y, 5, 5, "F")
  doc.setTextColor(...colors.black)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(title, 30, y + 4)
}

function drawCircularGauge(doc: jsPDF, x: number, y: number, radius: number, score: number) {
  const percentage = (score / 100) * 360
  const scoreColor = score >= 70 ? colors.emerald : score >= 50 ? colors.yellow : colors.red

  // Background circle (light gray)
  doc.setFillColor(243, 244, 246)
  doc.circle(x, y, radius, "F")

  // Score arc
  if (percentage > 0) {
    const segments = Math.ceil(percentage / 3)
    doc.setLineWidth(radius * 0.35)
    doc.setDrawColor(...scoreColor)
    for (let i = 0; i < segments; i++) {
      const angle1 = ((i * 3 - 90) * Math.PI) / 180
      const angle2 = (((i + 1) * 3 - 90) * Math.PI) / 180
      const x1 = x + radius * 0.82 * Math.cos(angle1)
      const y1 = y + radius * 0.82 * Math.sin(angle1)
      const x2 = x + radius * 0.82 * Math.cos(angle2)
      const y2 = y + radius * 0.82 * Math.sin(angle2)
      doc.line(x1, y1, x2, y2)
    }
  }

  // Inner white circle
  doc.setFillColor(...colors.white)
  doc.circle(x, y, radius * 0.65, "F")

  // Score text
  doc.setTextColor(...colors.dark)
  doc.setFontSize(radius * 0.9)
  doc.setFont("helvetica", "bold")
  doc.text(score.toString(), x, y + radius * 0.25, { align: "center" })
}

function drawMetricCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  subtitle: string,
  color: "emerald" | "yellow" | "gray" | "blue" | "purple" | "red",
) {
  const colorMap = {
    emerald: colors.emerald,
    yellow: colors.yellow,
    gray: colors.gray,
    blue: colors.blue,
    purple: colors.purple,
    red: colors.red,
  }

  // Card background
  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(...colors.lightGray)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, width, height, 3, 3, "FD")

  // Label
  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(label, x + width / 2, y + 10, { align: "center" })

  // Value
  doc.setTextColor(...colorMap[color])
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.text(value, x + width / 2, y + height / 2 + 8, { align: "center" })

  // Subtitle
  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(subtitle, x + width / 2, y + height - 8, { align: "center" })
}

// Extract percentage from nested objects
function extractPercentage(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "object") {
    return value.percentage ?? value.score ?? value.value ?? value.percent ?? 0
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Generate Simple Analysis PDF
export async function generateSimpleAnalysisPDF(brand: string, result: any): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let currentPage = 1

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // ===== PAGE 1: COVER =====
  doc.setFillColor(31, 41, 55)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  doc.setTextColor(...colors.white)
  doc.setFontSize(50)
  doc.setFont("helvetica", "bold")
  doc.text("MAK-IA", pageWidth / 2, 70, { align: "center" })

  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text("Reputation Analysis Report", pageWidth / 2, 85, { align: "center" })

  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 - 40, 100, pageWidth / 2 + 40, 100)

  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  const brandLines = doc.splitTextToSize(brand, pageWidth - 50)
  doc.text(brandLines, pageWidth / 2, 125, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Simple Analysis", pageWidth / 2, 145, { align: "center" })

  doc.setFontSize(10)
  doc.text(dateStr, pageWidth / 2, pageHeight - 20, { align: "center" })

  // ===== PAGE 2: OVERVIEW =====
  doc.addPage()
  currentPage++

  doc.setFillColor(...colors.white)
  doc.rect(0, 0, pageWidth, pageHeight, "F")
  addHeaderFooter(doc, currentPage, dateStr)

  drawSectionTitle(doc, "Overview", 35)

  // Global Score Card
  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(...colors.lightGray)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, 50, pageWidth - 40, 60, 4, 4, "FD")

  doc.setTextColor(...colors.gray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("GLOBAL SCORE", pageWidth / 2, 60, { align: "center" })

  const globalScore = result.global_score || 0
  drawCircularGauge(doc, pageWidth / 2, 82, 18, globalScore)

  const toneLabel = result.tone_label || "neutral"
  const toneLabelMap: any = { positive: "Positive", negative: "Negative", neutral: "Neutral", mixed: "Mixed" }
  doc.setTextColor(...(globalScore >= 70 ? colors.emerald : globalScore >= 50 ? colors.yellow : colors.red))
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(toneLabelMap[toneLabel] || "Neutral", pageWidth / 2, 105, { align: "center" })

  // Score Cards Row 1
  const cardY = 120
  const cardWidth = (pageWidth - 55) / 2
  const cardHeight = 45

  drawMetricCard(
    doc,
    20,
    cardY,
    cardWidth,
    cardHeight,
    "DIGITAL PRESENCE",
    `${result.presence_score || 0}`,
    "/100",
    "emerald",
  )

  drawMetricCard(
    doc,
    35 + cardWidth,
    cardY,
    cardWidth,
    cardHeight,
    "PUBLIC SENTIMENT",
    `${result.tone_score || 0}`,
    "/100",
    "purple",
  )

  // Score Cards Row 2
  const cardY2 = cardY + cardHeight + 10

  const sourcesCount = result.sources_analyzed || result.sources?.length || 0
  drawMetricCard(
    doc,
    35 + cardWidth,
    cardY2,
    cardWidth,
    cardHeight,
    "SOURCES ANALYZED",
    sourcesCount.toString(),
    "articles",
    "blue",
  )

  // ===== PAGE 3: DETAILED ANALYSIS =====
  doc.addPage()
  currentPage++

  doc.setFillColor(...colors.white)
  doc.rect(0, 0, pageWidth, pageHeight, "F")
  addHeaderFooter(doc, currentPage, dateStr)

  drawSectionTitle(doc, "Detailed Analysis", 35)

  const analysisText = result.detailed_analysis || result.gpt_summary || "No detailed analysis available."
  doc.setTextColor(...colors.dark)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  const maxWidth = pageWidth - 50
  const splitAnalysis = doc.splitTextToSize(analysisText, maxWidth)
  const linesPerPage = 40

  // Draw analysis box
  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(...colors.lightGray)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, 50, pageWidth - 40, 150, 4, 4, "FD")

  // Add text with proper line spacing
  let yPos = 60
  for (let i = 0; i < Math.min(splitAnalysis.length, linesPerPage); i++) {
    if (yPos > 190) break
    doc.text(splitAnalysis[i], 25, yPos)
    yPos += 4
  }

  // ===== PAGE 4: ADVANCED METRICS =====
  if (result.advanced_metrics) {
    doc.addPage()
    currentPage++

    doc.setFillColor(...colors.white)
    doc.rect(0, 0, pageWidth, pageHeight, "F")
    addHeaderFooter(doc, currentPage, dateStr)

    drawSectionTitle(doc, "Advanced Metrics", 35)

    const metrics = result.advanced_metrics
    let yPos = 50

    // Source Quality
    if (metrics.source_quality) {
      doc.setTextColor(...colors.black)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Source Quality", 20, yPos)
      yPos += 10

      const tier1 = extractPercentage(metrics.source_quality.tier1_percentage)
      const tier2 = extractPercentage(metrics.source_quality.tier2_percentage)
      const tier3 = extractPercentage(metrics.source_quality.tier3_percentage)

      drawMetricCard(doc, 20, yPos, 55, 40, "TIER 1", `${Math.round(tier1)}%`, "Wikipedia, NYT, Forbes", "emerald")
      drawMetricCard(doc, 80, yPos, 55, 40, "TIER 2", `${Math.round(tier2)}%`, "Regional media", "yellow")
      drawMetricCard(doc, 140, yPos, 55, 40, "TIER 3", `${Math.round(tier3)}%`, "Social networks", "gray")

      const dominance = metrics.source_quality.dominance || "Tier 1 (High Authority)"
      doc.setTextColor(...colors.gray)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Dominance: ${dominance}`, 20, yPos + 48)

      yPos += 60
    }

    // Information Freshness
    if (metrics.information_freshness && yPos < pageHeight - 80) {
      doc.setTextColor(...colors.black)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Information Freshness", 20, yPos)
      yPos += 10

      const recent = extractPercentage(metrics.information_freshness.recent_percentage)
      const old = 100 - recent

      drawMetricCard(doc, 20, yPos, 85, 40, "RECENT SOURCES", `${Math.round(recent)}%`, "< 6 months", "emerald")
      drawMetricCard(doc, 110, yPos, 85, 40, "OLD SOURCES", `${Math.round(old)}%`, "> 6 months", "gray")

      const avgAge = metrics.information_freshness.average_age_months || "N/A"
      doc.setTextColor(...colors.gray)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Average Age: ${avgAge} months`, 20, yPos + 48)

      yPos += 60
    }

    // If more metrics, add new page
    if (metrics.geographic_diversity || metrics.polarization || metrics.risk_level) {
      if (yPos > pageHeight - 100) {
        doc.addPage()
        currentPage++
        doc.setFillColor(...colors.white)
        doc.rect(0, 0, pageWidth, pageHeight, "F")
        addHeaderFooter(doc, currentPage, dateStr)
        yPos = 35
      }

      // Geographic Diversity
      if (metrics.geographic_diversity) {
        doc.setTextColor(...colors.black)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Geographic Diversity", 20, yPos)
        yPos += 10

        const local = extractPercentage(metrics.geographic_diversity.local_percentage)
        const national = extractPercentage(metrics.geographic_diversity.national_percentage)
        const international = extractPercentage(metrics.geographic_diversity.international_percentage)

        drawMetricCard(doc, 20, yPos, 55, 40, "LOCAL", `${Math.round(local)}%`, "Regional", "blue")
        drawMetricCard(doc, 80, yPos, 55, 40, "NATIONAL", `${Math.round(national)}%`, "National", "purple")
        drawMetricCard(doc, 140, yPos, 55, 40, "INTERNATIONAL", `${Math.round(international)}%`, "Global", "emerald")

        yPos += 55
      }

      // Polarization
      if (metrics.polarization && yPos < pageHeight - 70) {
        doc.setTextColor(...colors.black)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Polarization", 20, yPos)
        yPos += 10

        const neutral = extractPercentage(metrics.polarization.neutral_percentage)
        const oriented = extractPercentage(metrics.polarization.oriented_percentage)

        drawMetricCard(
          doc,
          20,
          yPos,
          85,
          40,
          "NEUTRAL SOURCES",
          `${Math.round(neutral)}%`,
          "Editorial objectivity",
          "emerald",
        )
        drawMetricCard(
          doc,
          110,
          yPos,
          85,
          40,
          "ORIENTED SOURCES",
          `${Math.round(oriented)}%`,
          "Political/editorial bias",
          "red",
        )

        const biasLevel = metrics.polarization.bias_level || "neutral"
        const biasLabelMap: any = {
          neutral: "Neutral",
          slightly_biased: "Slightly Biased",
          moderately_biased: "Moderately Biased",
          highly_biased: "Highly Biased",
        }
        doc.setTextColor(...colors.gray)
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Bias Level: ${biasLabelMap[biasLevel] || "Neutral"}`, 20, yPos + 48)

        yPos += 60
      }

      // Risk Level
      if (metrics.risk_level) {
        if (yPos > pageHeight - 100) {
          doc.addPage()
          currentPage++
          doc.setFillColor(...colors.white)
          doc.rect(0, 0, pageWidth, pageHeight, "F")
          addHeaderFooter(doc, currentPage, dateStr)
          yPos = 35
        }

        doc.setTextColor(...colors.black)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Risk Level", 20, yPos)
        yPos += 10

        // Risk card
        doc.setFillColor(254, 242, 242)
        doc.setDrawColor(254, 202, 202)
        doc.setLineWidth(1)
        doc.roundedRect(20, yPos, pageWidth - 40, 50, 4, 4, "FD")

        const riskScore = extractPercentage(metrics.risk_level.score)
        doc.setTextColor(...colors.red)
        doc.setFontSize(48)
        doc.setFont("helvetica", "bold")
        doc.text(riskScore.toFixed(1), 50, yPos + 30)

        const category = metrics.risk_level.category || "moderate"
        const categoryMap: any = { low: "Low", moderate: "Moderate", high: "High", critical: "Critical" }
        const categoryColor = category === "low" ? colors.emerald : category === "high" ? colors.red : colors.yellow

        doc.setFillColor(...categoryColor)
        doc.roundedRect(pageWidth - 80, yPos + 15, 50, 20, 3, 3, "F")
        doc.setTextColor(...colors.white)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(categoryMap[category] || "Moderate", pageWidth - 55, yPos + 27, { align: "center" })

        doc.setTextColor(...colors.gray)
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text("Category:", pageWidth - 55, yPos + 34, { align: "center" })

        // Threats
        if (metrics.risk_level.identified_threats && metrics.risk_level.identified_threats.length > 0) {
          yPos += 60

          doc.setTextColor(...colors.dark)
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          doc.text("⚠ IDENTIFIED THREATS", 25, yPos)
          yPos += 8

          metrics.risk_level.identified_threats.slice(0, 3).forEach((threat: any) => {
            doc.setFillColor(249, 250, 251)
            doc.setDrawColor(...colors.lightGray)
            doc.setLineWidth(0.5)
            doc.roundedRect(25, yPos, pageWidth - 50, 20, 3, 3, "FD")

            const threatName = threat.name || threat.title || "Unknown Threat"
            const threatLevel = threat.severity || threat.level || "low"
            const levelColor =
              threatLevel === "low" ? colors.emerald : threatLevel === "medium" ? colors.yellow : colors.red

            doc.setFillColor(...levelColor)
            doc.roundedRect(30, yPos + 5, 20, 8, 2, 2, "F")
            doc.setTextColor(...colors.white)
            doc.setFontSize(7)
            doc.setFont("helvetica", "bold")
            doc.text(threatLevel.toUpperCase(), 40, yPos + 10.5, { align: "center" })

            doc.setTextColor(...colors.dark)
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text(threatName, 55, yPos + 9)

            const threatDesc = threat.description || ""
            if (threatDesc) {
              doc.setTextColor(...colors.gray)
              doc.setFontSize(8)
              doc.setFont("helvetica", "normal")
              const descLines = doc.splitTextToSize(threatDesc, pageWidth - 95)
              doc.text(descLines[0], 55, yPos + 16)
            }

            yPos += 25
          })
        }
      }
    }
  }

  // ===== SOURCES PAGE =====
  if (result.sources && result.sources.length > 0) {
    doc.addPage()
    currentPage++

    doc.setFillColor(...colors.white)
    doc.rect(0, 0, pageWidth, pageHeight, "F")
    addHeaderFooter(doc, currentPage, dateStr)

    drawSectionTitle(doc, "Sources", 35)

    let sourceY = 50
    result.sources.slice(0, 10).forEach((source: any, index: number) => {
      if (sourceY > pageHeight - 40) return

      const title = source.title || source.name || `Source ${index + 1}`
      const url = source.url || source.link || ""

      doc.setFillColor(249, 250, 251)
      doc.setDrawColor(...colors.lightGray)
      doc.setLineWidth(0.3)
      doc.roundedRect(20, sourceY, pageWidth - 40, 16, 2, 2, "FD")

      doc.setTextColor(...colors.dark)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      const truncTitle = title.length > 70 ? title.substring(0, 67) + "..." : title
      doc.text(truncTitle, 25, sourceY + 6)

      if (url) {
        doc.setTextColor(...colors.primary)
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        const truncUrl = url.length > 90 ? url.substring(0, 87) + "..." : url
        doc.text(truncUrl, 25, sourceY + 12)
      }

      sourceY += 20
    })
  }

  return doc.output("blob")
}

// Generate Duel Analysis PDF
export async function generateDuelAnalysisPDF(brand1: string, brand2: string, result: any): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let currentPage = 1

  const brand1Name = result.brand1_name || brand1
  const brand2Name = result.brand2_name || brand2

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // ===== COVER =====
  doc.setFillColor(31, 41, 55)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  doc.setTextColor(...colors.white)
  doc.setFontSize(50)
  doc.setFont("helvetica", "bold")
  doc.text("MAK-IA", pageWidth / 2, 60, { align: "center" })

  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text("Confrontation Report", pageWidth / 2, 75, { align: "center" })

  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 - 40, 90, pageWidth / 2 + 40, 90)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  const b1Lines = doc.splitTextToSize(brand1Name, pageWidth - 60)
  doc.text(b1Lines, pageWidth / 2, 110, { align: "center" })

  doc.setFontSize(18)
  doc.setFont("helvetica", "normal")
  doc.text("VS", pageWidth / 2, 125, { align: "center" })

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  const b2Lines = doc.splitTextToSize(brand2Name, pageWidth - 60)
  doc.text(b2Lines, pageWidth / 2, 140, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Comparative Analysis", pageWidth / 2, 160, { align: "center" })

  doc.setFontSize(10)
  doc.text(dateStr, pageWidth / 2, pageHeight - 20, { align: "center" })

  // ===== RESULT PAGE =====
  doc.addPage()
  currentPage++

  doc.setFillColor(...colors.white)
  doc.rect(0, 0, pageWidth, pageHeight, "F")
  addHeaderFooter(doc, currentPage, dateStr)

  drawSectionTitle(doc, "Confrontation Result", 35)

  // Winner banner
  doc.setFillColor(...colors.primary)
  doc.roundedRect(20, 50, pageWidth - 40, 35, 4, 4, "F")

  doc.setTextColor(...colors.white)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("DOMINANT SUBJECT", pageWidth / 2, 60, { align: "center" })

  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  const winnerLines = doc.splitTextToSize(result.winner || "Draw", pageWidth - 60)
  doc.text(winnerLines, pageWidth / 2, 72, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Difference: ${result.score_difference || 0} points`, pageWidth / 2, 82, { align: "center" })

  // Comparison cards
  const cardY = 100
  const cardW = (pageWidth - 55) / 2
  const cardH = 80

  // Brand 1
  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(...colors.lightGray)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, cardY, cardW, cardH, 4, 4, "FD")

  doc.setTextColor(...colors.dark)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  const b1CardLines = doc.splitTextToSize(brand1Name, cardW - 10)
  doc.text(b1CardLines, 20 + cardW / 2, cardY + 15, { align: "center" })

  doc.setTextColor(...colors.gray)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Global Score", 20 + cardW / 2, cardY + 35, { align: "center" })

  const b1Score = result.brand1_analysis?.global_score || 0
  doc.setTextColor(...colors.primary)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.text(b1Score.toString(), 20 + cardW / 2, cardY + 52, { align: "center" })

  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`Presence: ${result.brand1_analysis?.presence_score || 0}`, 20 + cardW / 2, cardY + 65, {
    align: "center",
  })
  doc.text(`Sentiment: ${result.brand1_analysis?.tone_score || 0}`, 20 + cardW / 2, cardY + 72, {
    align: "center",
  })

  // Brand 2
  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(...colors.lightGray)
  doc.setLineWidth(0.5)
  doc.roundedRect(35 + cardW, cardY, cardW, cardH, 4, 4, "FD")

  doc.setTextColor(...colors.dark)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  const b2CardLines = doc.splitTextToSize(brand2Name, cardW - 10)
  doc.text(b2CardLines, 35 + cardW + cardW / 2, cardY + 15, { align: "center" })

  doc.setTextColor(...colors.gray)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Global Score", 35 + cardW + cardW / 2, cardY + 35, { align: "center" })

  const b2Score = result.brand2_analysis?.global_score || 0
  doc.setTextColor(...colors.primary)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.text(b2Score.toString(), 35 + cardW + cardW / 2, cardY + 52, { align: "center" })

  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`Presence: ${result.brand2_analysis?.presence_score || 0}`, 35 + cardW + cardW / 2, cardY + 65, {
    align: "center",
  })
  doc.text(`Sentiment: ${result.brand2_analysis?.tone_score || 0}`, 35 + cardW + cardW / 2, cardY + 72, {
    align: "center",
  })

  // Analysis
  if (result.detailed_comparison) {
    doc.addPage()
    currentPage++

    doc.setFillColor(...colors.white)
    doc.rect(0, 0, pageWidth, pageHeight, "F")
    addHeaderFooter(doc, currentPage, dateStr)

    drawSectionTitle(doc, "Comparative Analysis", 35)

    const analysisText = result.detailed_comparison
    doc.setTextColor(...colors.dark)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    const splitAnalysis = doc.splitTextToSize(analysisText, pageWidth - 50)

    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(...colors.lightGray)
    doc.setLineWidth(0.5)
    doc.roundedRect(20, 50, pageWidth - 40, 150, 4, 4, "FD")

    let yPos = 60
    for (let i = 0; i < Math.min(splitAnalysis.length, 35); i++) {
      if (yPos > 190) break
      doc.text(splitAnalysis[i], 25, yPos)
      yPos += 4
    }
  }

  return doc.output("blob")
}
