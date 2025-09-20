"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function PricingSection() {
  const { t } = useLanguage()

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToContact = () => {
    const element = document.getElementById("contact")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const plans = [
    {
      name: t("pricing.free_title"),
      price: t("pricing.free_price"),
      period: t("pricing.free_period"),
      features: [
        t("pricing.free_feature1"),
        t("pricing.free_feature2"),
        t("pricing.free_feature3"),
        t("pricing.free_feature4"),
      ],
      cta: t("pricing.free_cta"),
      action: scrollToHero,
      popular: false,
    },
    {
      name: t("pricing.pro_title"),
      price: t("pricing.pro_price"),
      period: t("pricing.pro_period"),
      features: [
        t("pricing.pro_feature1"),
        t("pricing.pro_feature2"),
        t("pricing.pro_feature3"),
        t("pricing.pro_feature4"),
        t("pricing.pro_feature5"),
        t("pricing.pro_feature6"),
      ],
      cta: t("pricing.pro_cta"),
      action: scrollToContact,
      popular: true,
    },
    {
      name: t("pricing.ultimate_title"),
      price: t("pricing.ultimate_price"),
      period: "",
      features: [
        t("pricing.ultimate_feature1"),
        t("pricing.ultimate_feature2"),
        t("pricing.ultimate_feature3"),
        t("pricing.ultimate_feature4"),
        t("pricing.ultimate_feature5"),
        t("pricing.ultimate_feature6"),
        t("pricing.ultimate_feature7"),
      ],
      cta: t("pricing.ultimate_cta"),
      action: scrollToContact,
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("pricing.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-accent shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                    {t("pricing.popular")}
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={plan.action}
                  className={`w-full ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
