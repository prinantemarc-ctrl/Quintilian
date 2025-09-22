"use client"

import { useLanguage } from "@/contexts/language-context"
import { SimpleSelect } from "@/components/ui/simple-select"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    {
      value: "fr",
      label: t("lang.french"),
      icon: <span className="text-base">🇫🇷</span>,
    },
    {
      value: "en",
      label: t("lang.english"),
      icon: <span className="text-base">🇺🇸</span>,
    },
    {
      value: "es",
      label: t("lang.spanish"),
      icon: <span className="text-base">🇪🇸</span>,
    },
  ]

  return (
    <SimpleSelect
      options={languages}
      value={language}
      onValueChange={setLanguage}
      size="sm"
      className="min-w-[120px] bg-transparent"
    />
  )
}
