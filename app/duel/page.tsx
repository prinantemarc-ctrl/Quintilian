"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Swords, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DuelModal } from "@/components/duel-modal"

export default function DuelPage() {
  const [formData, setFormData] = useState({
    brand1: "",
    brand2: "",
    message: "",
    language: "fr",
  })
  const [showModal, setShowModal] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.brand1.trim() && formData.brand2.trim() && formData.message.trim()) {
      setShowModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mode Duel
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Comparez deux noms ou marques sur le même message</p>
          </div>

          {/* Form */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl">Configuration du Duel</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand1" className="text-sm font-medium">
                      Premier concurrent 🥊
                    </Label>
                    <Input
                      id="brand1"
                      placeholder="Ex: Apple"
                      value={formData.brand1}
                      onChange={(e) => setFormData({ ...formData, brand1: e.target.value })}
                      className="border-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand2" className="text-sm font-medium">
                      Second concurrent 🥊
                    </Label>
                    <Input
                      id="brand2"
                      placeholder="Ex: Samsung"
                      value={formData.brand2}
                      onChange={(e) => setFormData({ ...formData, brand2: e.target.value })}
                      className="border-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message à analyser
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Ex: Leader de l'innovation technologique"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[100px] border-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Langue d'analyse
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="border-primary/20 focus:border-primary">
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
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
                  size="lg"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  Lancer le Duel !
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <DuelModal isOpen={showModal} onClose={() => setShowModal(false)} formData={formData} />
    </div>
  )
}
