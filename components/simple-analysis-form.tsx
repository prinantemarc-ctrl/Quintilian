"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { AnalysisModal } from "@/components/analysis-modal"
import { Zap, Target, TrendingUp } from "lucide-react"

export function SimpleAnalysisForm() {
  const [formData, setFormData] = useState({
    brand: "",
    message: "",
    language: "",
  })
  const [showModal, setShowModal] = useState(false)

  const handleAnalyze = () => {
    if (formData.brand.trim() && formData.message.trim() && formData.language) {
      setShowModal(true)
    }
  }

  const isFormValid = formData.brand.trim() && formData.message.trim() && formData.language

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Nom ou marque à analyser
              </Label>
              <Input
                id="brand"
                placeholder="Ex: Apple, Jean Dupont, Mon Entreprise..."
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Message à analyser
              </Label>
              <Textarea
                id="message"
                placeholder="Ex: Leader de l'innovation technologique"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="min-h-[100px] text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold">
                Langue d'analyse
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choisissez une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇺🇸 Anglais</SelectItem>
                  <SelectItem value="es">🇪🇸 Espagnol</SelectItem>
                  <SelectItem value="de">🇩🇪 Allemand</SelectItem>
                  <SelectItem value="it">🇮🇹 Italien</SelectItem>
                  <SelectItem value="pt">🇵🇹 Portugais</SelectItem>
                  <SelectItem value="nl">🇳🇱 Néerlandais</SelectItem>
                  <SelectItem value="ru">🇷🇺 Russe</SelectItem>
                  <SelectItem value="zh">🇨🇳 Chinois</SelectItem>
                  <SelectItem value="ja">🇯🇵 Japonais</SelectItem>
                  <SelectItem value="ar">🇸🇦 Arabe</SelectItem>
                  <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                  <SelectItem value="ko">🇰🇷 Coréen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!isFormValid}
              className="w-full h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Analyser la réputation
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnalysisModal isOpen={showModal} onClose={() => setShowModal(false)} formData={formData} />
    </>
  )
}
