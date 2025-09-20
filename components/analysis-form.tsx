"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AnalysisModal } from "@/components/analysis-modal"
import { Search, MessageSquare, Globe } from "lucide-react"

export function AnalysisForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    language: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsAnalyzing(true)
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Commencez votre analyse</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour analyser votre présence digitale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Nom / Marque à analyser
              </Label>
              <Input
                id="name"
                placeholder="Mon identité, mon entreprise, ma marque..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-primary/30 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message (optionnel)
              </Label>
              <Textarea
                id="message"
                placeholder="Vérifiez si cette phrase matche avec votre identité en ligne"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="border-primary/30 focus:border-primary min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Langue
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger className="border-primary/30 focus:border-primary">
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="nl">Nederlands</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="no">Norsk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              disabled={isAnalyzing || !formData.name.trim()}
            >
              {isAnalyzing ? "Analyse en cours..." : "Analyser maintenant"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnalysisModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchTerm={formData.name}
        message={formData.message}
        language={formData.language}
      />
    </>
  )
}
