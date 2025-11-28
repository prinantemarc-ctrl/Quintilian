"use client"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Swords } from "lucide-react"

import { SimpleAnalysisForm } from "@/components/simple-analysis-form"
import { DuelAnalysisForm } from "@/components/duel-analysis-form"

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState("simple")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Analysez votre réputation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">Analyse simple ou comparaison de deux entités</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Analyse Simple
              </TabsTrigger>
              <TabsTrigger value="duel" className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Comparaison
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
                      Analysez la réputation d'une marque, personne ou organisation. Le message et la langue sont
                      optionnels.
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
                      Comparez deux marques ou noms sur le même message. Idéal pour analyser la concurrence.
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
