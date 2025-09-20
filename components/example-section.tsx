"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { InfoModal } from "@/components/info-modal"
import { Eye, Heart, Target, Info } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function ExampleSection() {
  const { t } = useLanguage()
  const [showInfo, setShowInfo] = useState(false)

  const mockScores = [
    { icon: Eye, label: t("example.presence"), score: 87, color: "text-accent" },
    { icon: Heart, label: t("example.tone"), score: 92, color: "text-accent" },
    { icon: Target, label: t("example.coherence"), score: 78, color: "text-yellow-600" },
  ]

  return (
    <>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("example.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("example.subtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {mockScores.map((item, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <item.icon className="w-5 h-5 text-primary" />
                      {item.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto p-1 h-6 w-6"
                        onClick={() => setShowInfo(true)}
                      >
                        <Info className="w-3 h-3" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-3xl font-bold ${item.color}`}>{item.score}</span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                      <Progress value={item.score} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>{t("example.scale")}</span>
                <div className="flex items-center gap-4">
                  <span>0</span>
                  <div className="w-20 h-2 bg-gradient-to-r from-destructive via-yellow-500 to-accent rounded-full"></div>
                  <span>100</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowInfo(true)}
                className="text-primary border-primary hover:bg-primary/10"
              >
                {t("example.how_calculated")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
