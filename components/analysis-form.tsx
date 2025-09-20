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
import { useLanguage } from "@/contexts/language-context"

export function AnalysisForm() {
  const { t } = useLanguage()
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
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger className="border-primary/30 focus:border-primary">
                  <SelectValue placeholder={t("analysis.language_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t("lang.french")}</SelectItem>
                  <SelectItem value="en">{t("lang.english")}</SelectItem>
                  <SelectItem value="es">{t("lang.spanish")}</SelectItem>
                  <SelectItem value="de">{t("lang.german")}</SelectItem>
                  <SelectItem value="it">{t("lang.italian")}</SelectItem>
                  <SelectItem value="pt">{t("lang.portuguese")}</SelectItem>
                  <SelectItem value="nl">{t("lang.dutch")}</SelectItem>
                  <SelectItem value="ru">{t("lang.russian")}</SelectItem>
                  <SelectItem value="zh">{t("lang.chinese")}</SelectItem>
                  <SelectItem value="ja">{t("lang.japanese")}</SelectItem>
                  <SelectItem value="ar">{t("lang.arabic")}</SelectItem>
                  <SelectItem value="hi">{t("lang.hindi")}</SelectItem>
                  <SelectItem value="ko">{t("lang.korean")}</SelectItem>
                  <SelectItem value="sv">{t("lang.swedish")}</SelectItem>
                  <SelectItem value="no">{t("lang.norwegian")}</SelectItem>
                </SelectContent>
              </Select>
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
