"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  MessageSquare,
  Shield,
  Target,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap,
  TrendingUp,
  Eye,
} from "lucide-react"
import Link from "next/link"

export default function RenseignementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - REPRENEZ LE CONTRÔLE */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">REPRENEZ LE CONTRÔLE</h1>
              <p className="text-lg text-muted-foreground">
                Opérations spéciales pour améliorer vos scores de présence, tonalité et cohérence.
              </p>
              <Link href="/#analysis-form">
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3">
                  Lancer l'Opération
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* QG TACTIQUE Dashboard Mockup */}
            <div className="relative">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-red-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground tracking-wide">QG TACTIQUE</h3>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">94</div>
                    <div className="text-xs text-muted-foreground mt-1">SEO Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-muted-foreground">87</div>
                    <div className="text-xs text-muted-foreground mt-1">IA Analysis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-muted-foreground">92</div>
                    <div className="text-xs text-muted-foreground mt-1">Reputation</div>
                  </div>
                </div>

                {/* Bars */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-end justify-between gap-3 h-24">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-700 rounded-t relative overflow-hidden" style={{ height: "70%" }}>
                        <div className="absolute bottom-0 w-full h-1/2 bg-red-500/80" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-700 rounded-t relative overflow-hidden" style={{ height: "85%" }}>
                        <div className="absolute bottom-0 w-full h-1/3 bg-red-500/80" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-700 rounded-t relative overflow-hidden" style={{ height: "60%" }}>
                        <div className="absolute bottom-0 w-full h-1/4 bg-red-500/60" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-700 rounded-t relative overflow-hidden" style={{ height: "90%" }}>
                        <div className="absolute bottom-0 w-full h-2/3 bg-red-500/80" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOS ARMES Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">NOS ARMES</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche systémique pour dominer votre écosystème digital et neutraliser les menaces
            </p>
          </div>

          {/* Dashboard Tactique - Temps Réel */}
          <Card className="border border-red-500/20 bg-gradient-to-br from-zinc-900/50 to-background mb-16">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-500">Dashboard Tactique - Temps Réel</h3>
                  <p className="text-muted-foreground">
                    Accédez à votre centre de commandement de réputation en temps réel
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Métriques Critiques */}
                <div>
                  <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">
                    Métriques Critiques
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Présence IA - Visibilité dans les réseaux neuronaux</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Présence SEO - Occupation du terrain Google</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Impact Presse - Couverture médiatique</span>
                    </li>
                  </ul>
                </div>

                {/* Analyse Comportementale */}
                <div>
                  <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">
                    Analyse Comportementale
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Présence Sociale - Force de frappe réseaux</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Sentiment - Analyse tonalité et perception</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Cohérence Message - Discipline narrative</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Surveillance Banner */}
              <div className="flex items-center gap-2 text-amber-500">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Surveillance 24/7 avec alertes et contre-mesures IA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NOS 4 MODULES D'INTERVENTION */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">NOS 4 MODULES D'INTERVENTION</h2>
            <p className="text-lg text-muted-foreground">
              Solutions opérationnelles pour transformer la réalité digitale
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Module H - Duplication de Masse */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Globe className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module H - Duplication de Masse</h3>
                    <p className="text-sm text-muted-foreground">
                      Déploiement éclair de contenu sur réseau mondial (103 pays, 35 langues)
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Saturation des algorithmes GPT</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Impact SEO massif et immédiat</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Réseau de sites fantômes</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Déploiement automatisé</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module A - Dôme de Fer Social */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module A - Dôme de Fer Social</h3>
                    <p className="text-sm text-muted-foreground">
                      Système de défense et promotion sur réseaux sociaux (Focus X)
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Signal social amplifié</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Influence sur recherches temps réel</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Manipulation algorithmique</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Riposte automatisée</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module C - Légitimité */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module C - Légitimité</h3>
                    <p className="text-sm text-muted-foreground">Réseau de sites d'autorité pour ancrage durable</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>SEO pérenne</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Influence structurelle IA</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Sites Haute Autorité</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Crédibilité Institutionnelle</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module P - Black Ops */}
            <Card className="border border-red-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module P - Black Ops</h3>
                    <p className="text-sm text-muted-foreground">Opérateurs OSINT et techniques d'influence avancées</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>OSINT Profond</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Guerre Psychologique</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Influence ciblée</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Stratégie Fantôme</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* POURQUOI MAK-IA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight italic mb-4">POURQUOI MAK-IA ?</h2>
                <p className="text-lg text-muted-foreground">
                  Une expertise du renseignement au service de votre image
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">DOMINATION VISUELLE</h3>
                    <p className="text-muted-foreground">Occupation totale de l'espace Google</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">RÉPUTATION VERROUILLÉE</h3>
                    <p className="text-muted-foreground">Contrôle total du narratif</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">INFLUENCE MESURABLE</h3>
                    <p className="text-muted-foreground">ROI transparent et KPIs tactiques</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stratégie Card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-red-500/20">
                <div className="flex flex-col items-center justify-center h-64">
                  <TrendingUp className="w-16 h-16 text-red-500 mb-6" />
                  <h3 className="text-2xl font-bold text-foreground">Stratégie</h3>
                  <p className="text-muted-foreground">Approche 360°</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
