"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AnalysisModal } from "@/components/analysis-modal"
import { useLanguage } from "@/contexts/language-context"
import { Eye, Lock, Fingerprint, Activity, Globe } from "lucide-react"

export function HeroSection() {
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({
    brand: "",
    message: "",
    language: "fr",
  })
  const [showModal, setShowModal] = useState(false)

  const handleAnalyze = () => {
    if (formData.brand.trim()) {
      setShowModal(true)
    }
  }

  const isFormValid = formData.brand.trim()

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 overflow-hidden bg-black">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-12">
          {/* Badge - Purple theme */}
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 border border-violet-900/50 bg-violet-950/10 text-violet-400 text-[10px] sm:text-xs font-medium uppercase tracking-widest mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            {t("hero.badge")}
          </div>

          {/* Main Title */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-heading font-black tracking-tighter text-white leading-none px-2">
              <span className="block text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                {t("hero.title_measure")}
              </span>
              <span className="block text-lg sm:text-2xl lg:text-4xl text-neutral-400 font-normal tracking-widest mt-3 sm:mt-4 uppercase">
                {t("hero.title_reputation")}
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-neutral-500 leading-relaxed px-4">
              {t("hero.subtitle_desc")}
            </p>
          </div>

          {/* Spy Interface / Input Form */}
          <div className="max-w-3xl mx-auto mt-8 sm:mt-12">
            <div className="bg-black/80 border border-white/10 backdrop-blur-md p-1 shadow-2xl relative group">
              {/* Corner accents - Purple */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-violet-600/50"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-violet-600/50"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-violet-600/50"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-violet-600/50"></div>

              <div className="bg-zinc-950/50 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-medium text-violet-400 uppercase tracking-wider flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" />
                      {t("hero.name_label")} <span className="text-violet-300">*</span>
                    </Label>
                    <Input
                      id="brand"
                      placeholder={t("hero.name_placeholder")}
                      value={formData.brand}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      className="bg-black border-zinc-800 focus:border-violet-900 text-white placeholder:text-zinc-700 h-12 rounded-none"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] sm:text-xs font-medium text-violet-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      {t("hero.message_label")}{" "}
                      <span className="text-zinc-500 text-[9px] sm:text-[10px]">(optionnel)</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={t("hero.message_placeholder")}
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none border-zinc-800 focus:border-violet-900 text-white bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-xs font-medium text-violet-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    {t("hero.language_label")} <span className="text-zinc-500 text-[10px]">(optionnel)</span>
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="bg-black border-zinc-800 focus:border-violet-900 text-white h-12 rounded-none">
                      <SelectValue placeholder={t("hero.language_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
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
                  onClick={handleAnalyze}
                  disabled={!isFormValid}
                  className="w-full h-12 sm:h-14 bg-violet-700 hover:bg-violet-600 text-white font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm rounded-none border border-transparent hover:border-violet-400 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                  {t("hero.analyze_button")}
                </Button>
              </div>
            </div>

            {/* Status Line */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 px-2 text-[9px] sm:text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-pulse"></div>
                System Operational
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                {t("hero.secure")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnalysisModal isOpen={showModal} onClose={() => setShowModal(false)} initialData={formData} />
    </section>
  )
}
