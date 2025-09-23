"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Swords, Globe, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function ExampleSection() {
  const { t } = useLanguage()

  const analysisTypes = [
    {
      icon: BarChart3,
      title: t("example.simple_analysis_title"),
      description: t("example.simple_analysis_desc"),
      href: "/analyze",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: Swords,
      title: t("example.duel_analysis_title"),
      description: t("example.duel_analysis_desc"),
      href: "/duel",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      icon: Globe,
      title: t("example.press_analysis_title"),
      description: t("example.press_analysis_desc"),
      href: "/presse",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      icon: Users,
      title: t("example.world_reputation_title"),
      description: t("example.world_reputation_desc"),
      href: "/world-reputation",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("example.discover_analysis_types")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            {t("example.analysis_types_subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {analysisTypes.map((analysis, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-lg ${analysis.borderColor}`}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${analysis.bgColor} flex items-center justify-center mb-4`}>
                  <analysis.icon className={`w-6 h-6 ${analysis.color}`} />
                </div>
                <CardTitle className="text-lg font-semibold text-balance">{analysis.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{analysis.description}</p>
                <Link href={analysis.href}>
                  <Button
                    variant="outline"
                    className={`w-full ${analysis.color} border-current hover:bg-current hover:text-white`}
                  >
                    {t("example.try_analysis")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">{t("example.choose_analysis_cta")}</p>
          <Link href="/analyze">
            <Button className="bg-gradient-to-r from-green-600 to-black text-white px-8">
              {t("example.start_analysis")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
