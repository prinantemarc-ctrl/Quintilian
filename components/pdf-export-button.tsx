"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { generateSimpleAnalysisPDF, generateDuelAnalysisPDF } from "@/lib/pdf/pdf-generator"
import { toast } from "sonner"

interface PDFExportButtonProps {
  type: "simple" | "duel"
  brand: string
  brand2?: string
  result: any
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase()
}

export function PDFExportButton({
  type,
  brand,
  brand2,
  result,
  className,
  variant = "default",
  size = "default",
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = async () => {
    try {
      setIsGenerating(true)
      toast.info("Generating PDF...", { duration: 2000 })

      let blob: Blob
      let filename: string

      if (type === "duel" && brand2) {
        blob = await generateDuelAnalysisPDF(brand, brand2, result)
        filename = `mak-ia_duel_${sanitizeFilename(brand)}_vs_${sanitizeFilename(brand2)}_${Date.now()}.pdf`
      } else {
        blob = await generateSimpleAnalysisPDF(brand, result)
        filename = `mak-ia_analysis_${sanitizeFilename(brand)}_${Date.now()}.pdf`
      }

      downloadPDF(blob, filename)
      toast.success("PDF generated successfully!", { duration: 3000 })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Error generating PDF", { duration: 4000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isGenerating} className={className} variant={variant} size={size}>
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  )
}
