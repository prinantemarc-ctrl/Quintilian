"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, TrendingUp, Users, Calendar } from "lucide-react"

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  results: any
  type: "analyze" | "duel" | "gmi" | "press"
}

export function ResultsModal({ isOpen, onClose, title, results, type }: ResultsModalProps) {
  const renderAnalyzeResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Score SEO</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{results.score}/100</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Concurrence</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{results.competition || "Moyenne"}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Tendance</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{results.trend || "Stable"}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analyse détaillée</h3>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{results.analysis}</div>
        </div>
      </div>

      {results.sources && results.sources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sources analysées</h3>
          <div className="grid gap-3">
            {results.sources.map((source: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{source.title}</div>
                  <div className="text-xs text-gray-500 truncate">{source.link}</div>
                </div>
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderDuelResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">{results.winner ? `🏆 ${results.winner}` : "🤝 Match nul"}</div>
        <div className="text-gray-600">
          {results.brand1} vs {results.brand2}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-blue-900 mb-2">{results.brand1}</div>
          <div className="text-3xl font-bold text-blue-600">{results.score1}/100</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-red-900 mb-2">{results.brand2}</div>
          <div className="text-3xl font-bold text-red-600">{results.score2}/100</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analyse comparative</h3>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{results.analysis}</div>
        </div>
      </div>
    </div>
  )

  const renderGmiResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="font-semibold text-gray-900 mb-2">Score GMI Global</div>
          <div className="text-3xl font-bold text-blue-600">{results.globalScore}/100</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <div className="font-semibold text-gray-900 mb-2">Potentiel de croissance</div>
          <div className="text-2xl font-bold text-green-600">{results.growthPotential || "Élevé"}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analyse GMI détaillée</h3>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{results.analysis}</div>
        </div>
      </div>
    </div>
  )

  const renderPressResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="font-semibold text-orange-900 mb-2">Score Presse</div>
          <div className="text-2xl font-bold text-orange-600">{results.score}/100</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="font-semibold text-blue-900 mb-2">Couverture</div>
          <div className="text-2xl font-bold text-blue-600">{results.coverage || "Moyenne"}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="font-semibold text-green-900 mb-2">Sentiment</div>
          <div className="text-2xl font-bold text-green-600">{results.sentiment || "Positif"}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analyse presse</h3>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{results.analysis}</div>
        </div>
      </div>
    </div>
  )

  const renderResults = () => {
    switch (type) {
      case "analyze":
        return renderAnalyzeResults()
      case "duel":
        return renderDuelResults()
      case "gmi":
        return renderGmiResults()
      case "press":
        return renderPressResults()
      default:
        return <div>Type de résultat non reconnu</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">{renderResults()}</ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
