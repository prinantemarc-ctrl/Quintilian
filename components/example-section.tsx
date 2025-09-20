"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { InfoModal } from "@/components/info-modal"
import {
  Eye,
  Heart,
  Target,
  Info,
  AlertTriangle,
  CheckCircle,
  Swords,
  Crown,
  Globe,
  Users,
  Search,
  Brain,
  Shield,
  BarChart3,
  Zap,
  Clock,
  Star,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function ExampleSection() {
  const { t } = useLanguage()
  const [activeExample, setActiveExample] = useState<"simple" | "duel">("simple")
  const [showInfo, setShowInfo] = useState(false)

  const simpleExample = {
    name: t("example.company_name"),
    sector: "Conseil en transformation digitale",
    analysisDate: t("example.analysis_date"),
    scores: [
      {
        icon: Eye,
        label: t("example.presence"),
        score: 73,
        color: "text-yellow-600",
        trend: "+12",
        insights: "Forte présence LinkedIn (8.2K followers), faible indexation Google (3 pages)",
        details: {
          google: 68,
          linkedin: 89,
          twitter: 45,
          websites: 71,
        },
      },
      {
        icon: Heart,
        label: t("example.tone"),
        score: 89,
        color: "text-green-600",
        trend: "+5",
        insights: "Tonalité très professionnelle (94%) avec expertise technique reconnue",
        details: {
          positive: 78,
          neutral: 18,
          negative: 4,
          authority: 94,
        },
      },
      {
        icon: Target,
        label: t("example.coherence"),
        score: 67,
        color: "text-yellow-600",
        trend: "-3",
        insights: "Message incohérent : 'Innovation' sur site vs 'Tradition' sur réseaux",
        details: {
          messaging: 62,
          visual: 71,
          tone_consistency: 68,
          positioning: 67,
        },
      },
    ],
    globalScore: 76,
    sources: 47,
    timeframe: "6 derniers mois",
    competitive_position: "Top 15% du secteur",
    risk_level: "Modéré",
    opportunities: [
      { text: t("example.rec1_desc"), impact: t("example.rec1_impact"), priority: "Haute" },
      { text: "Harmoniser le message 'Innovation responsable'", impact: "Cohérence +18 pts", priority: "Critique" },
      { text: "Optimiser 8 pages clés pour le SEO", impact: "Présence +8 pts", priority: "Moyenne" },
    ],
    threats: [
      { text: t("example.threat1"), severity: "Élevée" },
      { text: t("example.threat2"), severity: "Critique" },
    ],
    detailed_metrics: {
      search_volume: t("example.search_volume"),
      brand_mentions: t("example.brand_mentions"),
      sentiment_evolution: t("example.sentiment_evolution"),
      share_of_voice: "8.4% du secteur",
    },
  }

  const duelExample = {
    competitor1: {
      name: "Nike",
      scores: { presence: 98, tone: 94, coherence: 96, global: 96 },
      color: "text-blue-600",
      strengths: [t("example.nike_strength1"), t("example.nike_strength2"), t("example.nike_strength3")],
      weaknesses: [t("example.nike_weakness1")],
      market_share: "18.2%",
      mentions: "45K/mois",
    },
    competitor2: {
      name: "Adidas",
      scores: { presence: 95, tone: 91, coherence: 93, global: 93 },
      color: "text-red-600",
      strengths: [t("example.adidas_strength1"), t("example.adidas_strength2")],
      weaknesses: [t("example.adidas_weakness1"), t("example.adidas_weakness2")],
      market_share: "15.7%",
      mentions: "38K/mois",
    },
    winner: "Nike",
    detailed_analysis: [
      {
        category: t("example.seo_performance"),
        nike: 98,
        adidas: 95,
        insight: "Nike domine avec 2.1M followers Instagram vs 1.8M pour Adidas",
      },
      {
        category: "Innovation Narrative",
        nike: 96,
        adidas: 89,
        insight: "Nike excelle dans le storytelling technologique (Air Max, Flyknit)",
      },
      {
        category: t("example.social_presence"),
        nike: 94,
        adidas: 96,
        insight: "Adidas surpasse Nike sur l'engagement communautaire (+12%)",
      },
    ],
    market_context: t("example.market_desc"),
    methodology: "47 sources, 6 langues, 12 pays analysés",
  }

  return (
    <>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("example.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">{t("example.subtitle")}</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-background rounded-lg p-1 border">
              <Button
                variant={activeExample === "simple" ? "default" : "ghost"}
                onClick={() => setActiveExample("simple")}
                className="px-6"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t("example.simple_mode")}
              </Button>
              <Button
                variant={activeExample === "duel" ? "default" : "ghost"}
                onClick={() => setActiveExample("duel")}
                className="px-6"
              >
                <Swords className="w-4 h-4 mr-2" />
                {t("example.duel_mode")}
              </Button>
            </div>
          </div>

          {activeExample === "simple" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-background rounded-xl border p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-green-600">{simpleExample.name}</h3>
                    <p className="text-lg text-muted-foreground">{simpleExample.sector}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {simpleExample.analysisDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {simpleExample.sources} sources
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {simpleExample.competitive_position}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-4xl font-bold text-green-600">{simpleExample.globalScore}/100</div>
                    <p className="text-sm text-muted-foreground">{t("example.global_score")}</p>
                    <Badge variant={simpleExample.risk_level === "Modéré" ? "secondary" : "destructive"}>
                      <Shield className="w-3 h-3 mr-1" />
                      Risque {simpleExample.risk_level}
                    </Badge>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {simpleExample.scores.map((item, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <item.icon className="w-5 h-5 text-primary" />
                          {item.label}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {item.trend}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={`text-3xl font-bold ${item.color}`}>{item.score}</span>
                            <span className="text-sm text-muted-foreground">/100</span>
                          </div>
                          <Progress value={item.score} className="h-3" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.insights}</p>

                          <div className="pt-3 border-t space-y-2">
                            {Object.entries(item.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="capitalize text-muted-foreground">{key.replace("_", " ")}</span>
                                <span className="font-medium">{value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Search className="w-4 h-4 text-blue-600" />
                        {t("example.search_volume")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">2.3K/mois</div>
                      <p className="text-xs text-muted-foreground">+23% vs trimestre précédent</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-purple-600" />
                        {t("example.brand_mentions")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">156/mois</div>
                      <p className="text-xs text-muted-foreground">Croissance soutenue</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4 text-green-600" />
                        {t("example.sentiment_evolution")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">+12% (30j)</div>
                      <p className="text-xs text-muted-foreground">Amélioration continue</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-orange-600" />
                        Part de Voix
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">8.4%</div>
                      <p className="text-xs text-muted-foreground">Position consolidée</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-green-600" />
                        {t("example.strategic_recommendations")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {simpleExample.opportunities.map((opp, index) => (
                          <div key={index} className="border-l-4 border-green-600 pl-4 space-y-1">
                            <p className="font-medium text-sm">{opp.text}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {opp.impact}
                              </Badge>
                              <Badge
                                variant={
                                  opp.priority === "Critique"
                                    ? "destructive"
                                    : opp.priority === "Haute"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {opp.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        {t("example.threat_analysis")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {simpleExample.threats.map((threat, index) => (
                          <div key={index} className="border-l-4 border-red-600 pl-4 space-y-1">
                            <p className="font-medium text-sm">{threat.text}</p>
                            <Badge variant={threat.severity === "Critique" ? "destructive" : "secondary"}>
                              Sévérité {threat.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeExample === "duel" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-background rounded-xl border p-8">
                <div className="text-center mb-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("example.market_context")}: {duelExample.market_context}
                  </p>
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-bold text-blue-600">{duelExample.competitor1.name}</h3>
                      <div className="text-4xl font-bold text-blue-600">{duelExample.competitor1.scores.global}</div>
                      <div className="text-sm text-muted-foreground">
                        {duelExample.competitor1.market_share} part de marché
                      </div>
                    </div>
                    <div className="text-5xl font-bold text-muted-foreground mx-8">VS</div>
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-bold text-red-600">{duelExample.competitor2.name}</h3>
                      <div className="text-4xl font-bold text-red-600">{duelExample.competitor2.scores.global}</div>
                      <div className="text-sm text-muted-foreground">
                        {duelExample.competitor2.market_share} part de marché
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white text-base px-4 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    {duelExample.winner} domine l'écosystème digital
                  </Badge>
                </div>

                <div className="space-y-6 mb-8">
                  {duelExample.detailed_analysis.map((analysis, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{analysis.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-semibold">{duelExample.competitor1.name}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.nike} className="w-24 h-2" />
                              <span className="text-xl font-bold text-blue-600 w-8">{analysis.nike}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-red-600 font-semibold">{duelExample.competitor2.name}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.adidas} className="w-24 h-2" />
                              <span className="text-xl font-bold text-red-600 w-8">{analysis.adidas}</span>
                            </div>
                          </div>

                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">
                              <Brain className="w-4 h-4 inline mr-2" />
                              {analysis.insight}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">{t("example.nike_strengths")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {duelExample.competitor1.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          {duelExample.competitor1.mentions} mentions mensuelles
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">{t("example.adidas_strengths")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {duelExample.competitor2.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          {duelExample.competitor2.mentions} mentions mensuelles
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>{duelExample.methodology}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => setShowInfo(true)}
              className="text-primary border-primary hover:bg-primary/10 mr-4"
            >
              <Info className="w-4 h-4 mr-2" />
              {t("example.how_calculated")}
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-black text-white px-8">
              Obtenir mon analyse complète
            </Button>
          </div>
        </div>
      </section>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
