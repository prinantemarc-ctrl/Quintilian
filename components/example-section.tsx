"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Swords, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function ExampleSection() {
  const { t } = useLanguage()

  const analysisTypes = [
    {
      icon: BarChart3,
      title: "Audit de Réputation",
      description:
        "Analysez votre présence digitale, la tonalité des mentions et la cohérence de votre message en ligne.",
      href: "/analyze",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: ["Score de présence", "Analyse sentiment", "Recommandations IA"],
    },
    {
      icon: Swords,
      title: "Mode Confrontation",
      description: "Comparez votre image en ligne à celle de votre concurrent direct et identifiez vos avantages.",
      href: "/duel",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      features: ["Comparaison directe", "Forces & faiblesses", "Verdict IA"],
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">Nos 2 Protocoles d'Analyse</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Choisissez le protocole adapté à votre besoin : audit individuel ou confrontation concurrentielle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {analysisTypes.map((analysis, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${analysis.borderColor} border-2`}
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-xl ${analysis.bgColor} flex items-center justify-center mb-4`}>
                  <analysis.icon className={`w-7 h-7 ${analysis.color}`} />
                </div>
                <CardTitle className="text-xl font-bold text-balance">{analysis.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-pretty">{analysis.description}</p>

                <ul className="space-y-2">
                  {analysis.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${analysis.color.replace("text-", "bg-")}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={analysis.href} className="block">
                  <Button
                    className={`w-full ${analysis.bgColor} ${analysis.color} border-2 ${analysis.borderColor} hover:opacity-90 font-semibold`}
                  >
                    Lancer ce protocole
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">Vous ne savez pas quel protocole choisir ?</p>
          <Link href="/analyze">
            <Button className="bg-gradient-to-r from-primary to-red-600 text-white px-8 py-6 text-lg font-semibold">
              Commencer par l'Audit de Réputation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
