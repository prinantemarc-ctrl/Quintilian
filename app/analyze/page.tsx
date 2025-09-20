"use client"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Swords, Globe, Zap } from "lucide-react"

import { SimpleAnalysisForm } from "@/components/simple-analysis-form"
import { DuelAnalysisForm } from "@/components/duel-analysis-form"
import { WorldAnalysisForm } from "@/components/world-analysis-form"

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState("simple")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
            <Zap className="w-4 h-4" />
            Analyse de réputation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Analysez votre réputation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choisissez le type d'analyse qui correspond à vos besoins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Analyse Simple
              </TabsTrigger>
              <TabsTrigger value="duel" className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Comparaison
              </TabsTrigger>
              <TabsTrigger value="world" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Géographique
              </TabsTrigger>
            </TabsList>

            <div className="mb-8">
              {activeTab === "simple" && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Analyse Simple
                    </CardTitle>
                    <CardDescription>
                      Analysez la réputation d'une marque ou d'un nom avec un message spécifique. Obtenez des scores de
                      présence, sentiment et cohérence.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === "duel" && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-primary" />
                      Mode Comparaison
                    </CardTitle>
                    <CardDescription>
                      Comparez deux marques ou noms sur le même message. Idéal pour analyser la concurrence ou des
                      alternatives.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === "world" && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Analyse Géographique
                    </CardTitle>
                    <CardDescription>
                      Analysez la réputation d'une marque dans plusieurs pays. Découvrez les différences culturelles et
                      géographiques.
                      <Badge variant="secondary" className="ml-2">
                        Jusqu'à 5 pays
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>

            <TabsContent value="simple" className="space-y-6">
              <SimpleAnalysisForm />
            </TabsContent>

            <TabsContent value="duel" className="space-y-6">
              <DuelAnalysisForm />
            </TabsContent>

            <TabsContent value="world" className="space-y-6">
              <WorldAnalysisForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
