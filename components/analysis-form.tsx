"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, MessageSquare, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { AnalysisAdapter } from "@/components/dialog-fit/analysis-adapter"

export function AnalysisForm() {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    language: "",
  })

  const languageOptions = [
    { value: "fr", label: t("lang.french"), icon: <span>🇫🇷</span> },
    { value: "en", label: t("lang.english"), icon: <span>🇺🇸</span> },
    { value: "es", label: t("lang.spanish"), icon: <span>🇪🇸</span> },
    { value: "de", label: t("lang.german"), icon: <span>🇩🇪</span> },
    { value: "it", label: t("lang.italian"), icon: <span>🇮🇹</span> },
    { value: "pt", label: t("lang.portuguese"), icon: <span>🇵🇹</span> },
    { value: "nl", label: t("lang.dutch"), icon: <span>🇳🇱</span> },
    { value: "ru", label: t("lang.russian"), icon: <span>🇷🇺</span> },
    { value: "zh", label: t("lang.chinese"), icon: <span>🇨🇳</span> },
    { value: "ja", label: t("lang.japanese"), icon: <span>🇯🇵</span> },
    { value: "ar", label: t("lang.arabic"), icon: <span>🇸🇦</span> },
    { value: "hi", label: t("lang.hindi"), icon: <span>🇮🇳</span> },
    { value: "ko", label: t("lang.korean"), icon: <span>🇰🇷</span> },
    { value: "sv", label: t("lang.swedish"), icon: <span>🇸🇪</span> },
    { value: "no", label: t("lang.norwegian"), icon: <span>🇳🇴</span> },
  ]

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
          <CardTitle className="text-2xl text-primary">{t("analysis.form_title")}</CardTitle>
          <CardDescription>{t("analysis.form_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                {t("analysis.name_label")}
              </Label>
              <Input
                id="name"
                placeholder={t("analysis.name_placeholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-primary/30 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {t("analysis.message_label")}
              </Label>
              <Textarea
                id="message"
                placeholder={t("analysis.message_placeholder")}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="border-primary/30 focus:border-primary min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                {t("analysis.language_label")}
              </Label>
              <SimpleSelect
                options={languageOptions}
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                placeholder={t("analysis.language_placeholder")}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              disabled={isAnalyzing || !formData.name.trim()}
            >
              {isAnalyzing ? t("analysis.analyzing") : t("analysis.analyze_now")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnalysisAdapter
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchTerm={formData.name}
        message={formData.message}
        language={formData.language}
      />
    </>
  )
}
