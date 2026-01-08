import {
  generateSimpleAnalysisPDF as generateSimplePDF,
  generateDuelAnalysisPDF as generateDuelPDF,
} from "./pdf-generator"

export async function generateSimpleAnalysisPDF(brand: string, result: any): Promise<Blob> {
  return await generateSimplePDF(brand, result)
}

export async function generateDuelAnalysisPDF(brand1: string, brand2: string, result: any): Promise<Blob> {
  return await generateDuelPDF(brand1, brand2, result)
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase()
}

// Additional updates can be made here if needed
