"use client"

import type React from "react"
import { AuthGateModal } from "@/components/auth/auth-gate-modal"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Swords, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AnalysisResultsFullscreen } from "@/components/analysis-results-fullscreen"
import { DuelLoadingAnimation } from "@/components/duel-loading-animation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export default function DuelPage() {
  const [formData, setFormData] = useState({
    brand1: "",
    brand2: "",
    message: "",
    language: "fr",
  })
  const [showLoading, setShowLoading] = useState(false)
  const [duelResult, setDuelResult] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showAuthGate, setShowAuthGate] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.brand1.trim() && formData.brand2.trim()) {
      setShowLoading(true)

      try {
        const response = await fetch("/api/duel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            uiLanguage: "en",
          }),
        })

        if (!response.ok) {
          throw new Error(`Erreur lors du duel: ${response.status}`)
        }

        const apiResponse = await response.json()

        if (apiResponse.success && apiResponse.data) {
          setDuelResult(apiResponse.data)
          setShowLoading(false)

          if (isAuthenticated) {
            setShowResults(true)
          } else {
            setShowAuthGate(true)
          }
        }
      } catch (error) {
        console.error("[v0] Duel error:", error)
        setShowLoading(false)
      }
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthGate(false)
    setShowResults(true)
  }

  const duelPreviewData = duelResult
    ? {
        brand1: formData.brand1,
        brand2: formData.brand2,
        brand1_score: duelResult.brand1_analysis?.global_score,
        brand2_score: duelResult.brand2_analysis?.global_score,
        brand1_presence: duelResult.brand1_analysis?.presence_score,
        brand2_presence: duelResult.brand2_analysis?.presence_score,
        brand1_sentiment: duelResult.brand1_analysis?.tone_score,
        brand2_sentiment: duelResult.brand2_analysis?.tone_score,
        winner: duelResult.winner,
        verdict: duelResult.detailed_comparison?.substring(0, 200),
      }
    : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Confrontation
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Compare two subjects head-to-head</p>
          </div>

          {/* Form */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl">Confrontation - Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand1" className="text-sm font-medium">
                      Subject 1 🥊
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
                      Subject 2 🥊
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
                    Hypothesis / Claim <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[100px] border-primary/20 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a hypothesis or claim to analyze which subject better aligns with it
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
                  size="lg"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  Start Confrontation!
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showLoading} onOpenChange={() => setShowLoading(false)}>
        <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] p-0 gap-0 flex flex-col bg-black border border-violet-900/30">
          <DuelLoadingAnimation brand1={formData.brand1} brand2={formData.brand2} />
        </DialogContent>
      </Dialog>

      <AuthGateModal
        isOpen={showAuthGate}
        onAuthSuccess={handleAuthSuccess}
        onClose={() => setShowAuthGate(false)}
        analysisType="duel"
        duelPreviewData={duelPreviewData}
      />

      {/* Results for authenticated users */}
      {duelResult && (
        <AnalysisResultsFullscreen
          isOpen={showResults}
          onClose={() => {
            setShowResults(false)
            setDuelResult(null)
          }}
          result={duelResult}
          type="duel"
          brand={`${formData.brand1} vs ${formData.brand2}`}
        />
      )}
    </div>
  )
}
