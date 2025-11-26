"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, Target, Zap, Users, Brain, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function FeaturesSection() {
  const { t } = useLanguage()

  const allFeatures = [
    {
      icon: Eye,
      title: t("features.presence_title"),
      subtitle: t("features.presence_subtitle"),
      description: t("features.presence_desc"),
      category: "Core",
    },
    {
      icon: Heart,
      title: t("features.tone_title"),
      subtitle: t("features.tone_subtitle"),
      description: t("features.tone_desc"),
      category: "Core",
    },
    {
      icon: Target,
      title: t("features.coherence_title"),
      subtitle: t("features.coherence_subtitle"),
      description: t("features.coherence_desc"),
      category: "Core",
    },
    {
      icon: Users,
      title: "Confrontation Directe",
      subtitle: "Mode Duel",
      description: "Comparez directement votre marque avec un concurrent pour identifier vos avantages compétitifs.",
      category: "Duel",
    },
    {
      icon: Brain,
      title: "IA Avancée",
      subtitle: "GPT-4 Analysis",
      description:
        "Analyse sémantique poussée avec intelligence artificielle pour des insights précis et actionnables.",
      category: "AI",
    },
    {
      icon: Shield,
      title: "Rapport d'Intelligence",
      subtitle: "Dossier Complet",
      description: "Recevez un rapport détaillé avec recommandations stratégiques pour améliorer votre réputation.",
      category: "Report",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Core":
        return "bg-primary/10 text-primary border-primary/20"
      case "Duel":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "AI":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "Report":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("features.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("features.subtitle")}</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />6 Fonctionnalités Clés
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allFeatures.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <p className="text-sm text-accent font-medium">({feature.subtitle})</p>
                  <Badge className={`text-xs ${getCategoryColor(feature.category)}`}>{feature.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 pt-12 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Langues Supportées</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">30s</div>
              <div className="text-sm text-muted-foreground">Temps d'Analyse</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground">Modes d'Analyse</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilité</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
