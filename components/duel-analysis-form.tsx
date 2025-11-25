"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { DuelModal } from "@/components/duel-modal"
import { Swords } from "lucide-react"

export function DuelAnalysisForm() {
  const [formData, setFormData] = useState({
    brand1: "",
    brand2: "",
    message: "",
    language: "fr",
  })
  const [showModal, setShowModal] = useState(false)

  const handleAnalyze = () => {
    if (formData.brand1.trim() && formData.brand2.trim()) {
      setShowModal(true)
    }
  }

  const isFormValid = formData.brand1.trim() && formData.brand2.trim()

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand1" className="text-sm font-semibold">
                  Premier concurrent 🥊
                </Label>
                <Input
                  id="brand1"
                  placeholder="Ex: Apple"
                  value={formData.brand1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand1: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand2" className="text-sm font-semibold">
                  Second concurrent 🥊
                </Label>
                <Input
                  id="brand2"
                  placeholder="Ex: Samsung"
                  value={formData.brand2}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand2: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold">
                Message à analyser <span className="text-gray-500 font-normal text-xs">(optionnel)</span>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇺🇸 Anglais</SelectItem>
                  <SelectItem value="es">🇪🇸 Espagnol</SelectItem>
                  <SelectItem value="de">🇩🇪 Allemand</SelectItem>
                  <SelectItem value="it">🇮🇹 Italien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!isFormValid}
              className="w-full h-14 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg"
            >
              <Swords className="w-5 h-5 mr-2" />
              Lancer le Duel !
            </Button>
          </div>
        </CardContent>
      </Card>

      <DuelModal isOpen={showModal} onClose={() => setShowModal(false)} formData={formData} />
    </>
  )
}
