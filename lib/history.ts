"use client"

export interface AnalysisHistoryItem {
  id: string
  brand: string
  message: string
  language: string
  type: "simple" | "duel" | "world"
  timestamp: number
  results: {
    presence_score: number
    tone_score: number
    coherence_score: number
    tone_label: string
    rationale: string
    google_summary?: string
    gpt_summary?: string
    structured_conclusion?: string
    detailed_analysis?: string
    sources?: Array<{
      title: string
      link: string
    }>
    // For duel analysis
    brand1?: string
    brand2?: string
    brand1_results?: any
    brand2_results?: any
    // For world analysis
    countries?: string[]
    country_results?: any[]
  }
  metadata?: {
    duration?: number
    fromCache?: boolean
  }
}

class AnalysisHistory {
  private readonly storageKey = "mak_ia_analysis_history"
  private readonly maxItems = 20

  private isClient(): boolean {
    return typeof window !== "undefined"
  }

  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getHistory(): AnalysisHistoryItem[] {
    if (!this.isClient()) return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []

      const history = JSON.parse(stored) as AnalysisHistoryItem[]

      // Sort by timestamp (newest first)
      return history.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error("[v0] Error reading history from localStorage:", error)
      return []
    }
  }

  addAnalysis(analysis: Omit<AnalysisHistoryItem, "id" | "timestamp">): string {
    if (!this.isClient()) return ""

    try {
      const history = this.getHistory()
      const id = this.generateId()

      const newItem: AnalysisHistoryItem = {
        ...analysis,
        id,
        timestamp: Date.now(),
      }

      // Add to beginning of array
      history.unshift(newItem)

      // Keep only the most recent items
      const trimmedHistory = history.slice(0, this.maxItems)

      localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory))

      console.log(`[v0] Added analysis to history: ${id}`)
      return id
    } catch (error) {
      console.error("[v0] Error saving analysis to history:", error)
      return ""
    }
  }

  getAnalysis(id: string): AnalysisHistoryItem | null {
    if (!this.isClient()) return null

    const history = this.getHistory()
    return history.find((item) => item.id === id) || null
  }

  deleteAnalysis(id: string): boolean {
    if (!this.isClient()) return false

    try {
      const history = this.getHistory()
      const filteredHistory = history.filter((item) => item.id !== id)

      localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory))

      console.log(`[v0] Deleted analysis from history: ${id}`)
      return true
    } catch (error) {
      console.error("[v0] Error deleting analysis from history:", error)
      return false
    }
  }

  clearHistory(): boolean {
    if (!this.isClient()) return false

    try {
      localStorage.removeItem(this.storageKey)
      console.log("[v0] Cleared analysis history")
      return true
    } catch (error) {
      console.error("[v0] Error clearing history:", error)
      return false
    }
  }

  exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  importHistory(jsonData: string): boolean {
    if (!this.isClient()) return false

    try {
      const importedHistory = JSON.parse(jsonData) as AnalysisHistoryItem[]

      // Validate the structure
      if (!Array.isArray(importedHistory)) {
        throw new Error("Invalid history format")
      }

      // Merge with existing history and remove duplicates
      const existingHistory = this.getHistory()
      const mergedHistory = [...importedHistory, ...existingHistory]

      // Remove duplicates based on brand, message, and timestamp
      const uniqueHistory = mergedHistory.filter(
        (item, index, arr) =>
          arr.findIndex(
            (other) =>
              other.brand === item.brand &&
              other.message === item.message &&
              Math.abs(other.timestamp - item.timestamp) < 60000, // Within 1 minute
          ) === index,
      )

      // Sort and trim
      const sortedHistory = uniqueHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, this.maxItems)

      localStorage.setItem(this.storageKey, JSON.stringify(sortedHistory))

      console.log(`[v0] Imported ${importedHistory.length} analyses to history`)
      return true
    } catch (error) {
      console.error("[v0] Error importing history:", error)
      return false
    }
  }

  getStats() {
    const history = this.getHistory()
    const now = Date.now()

    const last24h = history.filter((item) => now - item.timestamp < 24 * 60 * 60 * 1000)
    const last7days = history.filter((item) => now - item.timestamp < 7 * 24 * 60 * 60 * 1000)

    const typeStats = history.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: history.length,
      last24h: last24h.length,
      last7days: last7days.length,
      byType: typeStats,
      oldestTimestamp: history.length > 0 ? Math.min(...history.map((h) => h.timestamp)) : null,
      newestTimestamp: history.length > 0 ? Math.max(...history.map((h) => h.timestamp)) : null,
    }
  }
}

// Global instance
export const analysisHistory = new AnalysisHistory()

// Hook for React components
export function useAnalysisHistory() {
  const [history, setHistory] = React.useState<AnalysisHistoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHistory(analysisHistory.getHistory())
      setIsLoading(false)
    }
  }, [])

  const addAnalysis = React.useCallback((analysis: Omit<AnalysisHistoryItem, "id" | "timestamp">) => {
    const id = analysisHistory.addAnalysis(analysis)
    setHistory(analysisHistory.getHistory())
    return id
  }, [])

  const deleteAnalysis = React.useCallback((id: string) => {
    const success = analysisHistory.deleteAnalysis(id)
    if (success) {
      setHistory(analysisHistory.getHistory())
    }
    return success
  }, [])

  const clearHistory = React.useCallback(() => {
    const success = analysisHistory.clearHistory()
    if (success) {
      setHistory([])
    }
    return success
  }, [])

  const refreshHistory = React.useCallback(() => {
    setHistory(analysisHistory.getHistory())
  }, [])

  return {
    history,
    isLoading,
    addAnalysis,
    deleteAnalysis,
    clearHistory,
    refreshHistory,
    stats: analysisHistory.getStats(),
  }
}

// We need to import React for the hook
import React from "react"
