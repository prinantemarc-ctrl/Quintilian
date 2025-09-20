"use client"

import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PolitiqueConfidentialitePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("legal.back_home")}
          </Link>

          <h1 className="text-3xl font-bold mb-8">{t("legal.privacy_title")}</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("legal.data_collection")}</h2>
              <p>{t("legal.data_collection_content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("legal.data_usage")}</h2>
              <p>{t("legal.data_usage_content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("legal.cookies")}</h2>
              <p>{t("legal.cookies_content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("legal.user_rights")}</h2>
              <p>{t("legal.user_rights_content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("legal.contact_privacy")}</h2>
              <p>{t("legal.contact_privacy_content")}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
