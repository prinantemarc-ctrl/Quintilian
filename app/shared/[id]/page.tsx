import { notFound } from "next/navigation"
import { getSharedResultServer } from "@/lib/services/shared-results-server"
import { SharedResultDisplay } from "@/components/shared-result-display"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getSharedResultServer(id)

  if (!result) {
    return {
      title: "Résultat non trouvé - Quintilian",
      description: "Ce résultat d'analyse n'existe pas ou a expiré.",
    }
  }

  const globalScore = Math.round(
    (result.results.presence_score + result.results.tone_score + result.results.coherence_score) / 3,
  )

  return {
    title: `Analyse SEO de ${result.brand} - Score: ${globalScore}/100 - Quintilian`,
    description: `Découvrez l'analyse SEO complète de ${result.brand} : présence digitale, sentiment et cohérence. Score global: ${globalScore}/100.`,
    openGraph: {
      title: `Analyse SEO de ${result.brand} - Score: ${globalScore}/100`,
      description: `Découvrez l'analyse SEO complète de ${result.brand}. Score global: ${globalScore}/100`,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://quintilian.vercel.app"}/shared/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Analyse SEO de ${result.brand} - Score: ${globalScore}/100`,
      description: `Découvrez l'analyse SEO complète de ${result.brand}. Score global: ${globalScore}/100`,
    },
  }
}

export default async function SharedResultPage({ params }: PageProps) {
  const { id } = await params
  const result = await getSharedResultServer(id)

  if (!result) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedResultDisplay result={result} />
    </div>
  )
}
