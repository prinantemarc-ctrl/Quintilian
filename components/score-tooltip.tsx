"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface ScoreTooltipProps {
  type: "presence" | "sentiment" | "coherence"
  score: number
}

export function ScoreTooltip({ type, score }: ScoreTooltipProps) {
  const getTooltipContent = () => {
    switch (type) {
      case "presence":
        return {
          title: "Score de Présence Digitale",
          description: "Mesure votre visibilité sur Google et les moteurs de recherche",
          details: [
            "Nombre de résultats trouvés",
            "Qualité et autorité des sources",
            "Diversité des plateformes",
            "Fraîcheur du contenu",
          ],
          interpretation: getScoreInterpretation(score, "presence"),
        }
      case "sentiment":
        return {
          title: "Score de Sentiment Global",
          description: "Analyse la tonalité des mentions vous concernant",
          details: [
            "Analyse sémantique avancée",
            "Détection d'émotions par IA",
            "Pondération par autorité de source",
            "Évolution temporelle du sentiment",
          ],
          interpretation: getScoreInterpretation(score, "sentiment"),
        }
      case "coherence":
        return {
          title: "Score de Cohérence Message",
          description: "Mesure l'alignement entre votre message et la réalité digitale",
          details: [
            "Comparaison sémantique",
            "Correspondance thématique",
            "Validation factuelle",
            "Cohérence temporelle",
          ],
          interpretation: getScoreInterpretation(score, "coherence"),
        }
    }
  }

  const getScoreInterpretation = (score: number, type: string) => {
    if (score >= 80) {
      return {
        level: "Excellent",
        color: "text-green-600",
        message:
          type === "presence"
            ? "Excellente visibilité, présence dominante"
            : type === "sentiment"
              ? "Sentiment très positif, image excellente"
              : "Message parfaitement aligné avec la réalité",
      }
    } else if (score >= 60) {
      return {
        level: "Bon",
        color: "text-yellow-600",
        message:
          type === "presence"
            ? "Bonne présence, quelques améliorations possibles"
            : type === "sentiment"
              ? "Sentiment globalement positif"
              : "Bonne cohérence, alignement satisfaisant",
      }
    } else if (score >= 40) {
      return {
        level: "Moyen",
        color: "text-orange-600",
        message:
          type === "presence"
            ? "Présence modérée, travail nécessaire"
            : type === "sentiment"
              ? "Sentiment mitigé, attention requise"
              : "Cohérence partielle, ajustements nécessaires",
      }
    } else {
      return {
        level: "Faible",
        color: "text-red-600",
        message:
          type === "presence"
            ? "Faible visibilité, action urgente"
            : type === "sentiment"
              ? "Sentiment négatif, intervention nécessaire"
              : "Message incohérent, révision complète requise",
      }
    }
  }

  const content = getTooltipContent()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="top">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm">{content.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{content.description}</p>
            </div>
            <div>
              <h5 className="font-medium text-xs mb-2">Critères analysés :</h5>
              <ul className="text-xs space-y-1">
                {content.details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Votre niveau :</span>
                <span className={`text-xs font-semibold ${content.interpretation.color}`}>
                  {content.interpretation.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{content.interpretation.message}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
