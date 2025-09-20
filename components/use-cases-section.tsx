"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Newspaper, User, Megaphone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function UseCasesSection() {
  const { t } = useLanguage()

  const useCases = [
    {
      icon: Building2,
      title: t("usecases.companies"),
      description: t("usecases.companies_desc"),
    },
    {
      icon: Newspaper,
      title: t("usecases.media"),
      description: t("usecases.media_desc"),
    },
    {
      icon: User,
      title: t("usecases.individuals"),
      description: t("usecases.individuals_desc"),
    },
    {
      icon: Megaphone,
      title: t("usecases.agencies"),
      description: t("usecases.agencies_desc"),
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("usecases.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("usecases.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3">
                  <useCase.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-pretty">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
