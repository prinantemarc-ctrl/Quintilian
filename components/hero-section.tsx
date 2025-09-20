"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AnalysisModal } from "@/components/analysis-modal"
import { useLanguage } from "@/contexts/language-context"
import { Zap, Shield, Target, TrendingUp } from "lucide-react"

export function HeroSection() {
  const { t, language } = useLanguage()
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
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(21,128,61,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(132,204,22,0.1),transparent_50%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main Title Section - Full Width */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
              <Zap className="w-4 h-4" />
              {t("hero.badge")}
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-8xl font-black text-balance leading-[0.9] tracking-tight">
                <span className="block text-6xl lg:text-9xl bg-gradient-to-r from-green-600 via-green-500 to-black bg-clip-text text-transparent font-extrabold">
                  {t("hero.title_measure")}
                </span>
                <span className="block text-4xl lg:text-6xl text-foreground font-bold mt-2">
                  {t("hero.title_reputation")}
                </span>
                <span className="block text-3xl lg:text-5xl bg-gradient-to-r from-black via-green-600 to-green-500 bg-clip-text text-transparent font-semibold mt-1">
                  {t("hero.title_time")}
                </span>
              </h1>

              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1 max-w-20"></div>
                <p className="text-lg lg:text-xl font-medium text-muted-foreground px-4 bg-background/80 backdrop-blur-sm rounded-full border border-green-500/20">
                  {t("hero.subtitle")}
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent flex-1 max-w-20"></div>
              </div>
            </div>

            {/* Input Section - Centered */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      {t("hero.name_label")}
                    </Label>
                    <Input
                      id="brand"
                      placeholder={t("hero.name_placeholder")}
                      value={formData.brand}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      className="h-12 text-base border-border/50 focus:border-primary/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {t("hero.message_label")}
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={t("hero.message_placeholder")}
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      className="min-h-[100px] text-base resize-none border-border/50 focus:border-primary/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-semibold text-foreground">
                      {t("hero.language_label")}
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="h-12 text-base border-border/50 focus:border-primary/50 bg-background/50">
                        <SelectValue placeholder={t("hero.language_placeholder")} />
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
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!isFormValid}
                  className="w-full h-14 px-8 mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t("hero.analyze_button")}
                </Button>

                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-medium">{t("hero.result_time")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">{t("hero.secure")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Bottom Section */}
          <div className="flex flex-col items-center justify-center pt-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center shadow-2xl border border-primary/20 backdrop-blur-sm">
                <Zap className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("hero.instant_analysis")}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{t("hero.detailed_results")}</p>
              </div>

              <div className="flex items-center justify-center gap-8 pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span>Google API</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-300"></div>
                  <span>GPT Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse delay-500"></div>
                  <span>Global Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnalysisModal isOpen={showModal} onClose={() => setShowModal(false)} formData={formData} />
    </section>
  )
}
