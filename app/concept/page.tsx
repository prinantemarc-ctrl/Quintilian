"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, Search, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function ConceptPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Eye className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Découvrez l'image que vous projetez en ligne
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Dans un monde numérique où votre réputation se construit à chaque recherche, comprenez comment vous êtes
              perçu par vos clients, partenaires et concurrents.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Le premier réflexe de tous</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Un citoyen, un consommateur, un banquier, un collaborateur, ou un concurrent. Tous ont un premier
                réflexe avant de vous faire confiance :{" "}
                <strong className="text-blue-600">taper votre nom ou celui de votre marque sur internet</strong>.
              </p>
            </div>

            {/* Three Questions Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Que vont-ils voir ?</h3>
                  <p className="text-gray-600">Les premiers résultats qui apparaissent définissent votre image</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Que vont-ils ressentir ?</h3>
                  <p className="text-gray-600">L'émotion transmise par vos contenus influence leur décision</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Qu'en concluront-ils ?</h3>
                  <p className="text-gray-600">Leur impression finale détermine s'ils vous font confiance</p>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">C'est exactement ce que nous analysons</h2>
                <p className="text-lg text-gray-700">
                  Notre technologie scrute l'ensemble de votre écosystème digital pour vous révéler votre véritable
                  image en ligne.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Moteurs de recherche</h3>
                      <p className="text-gray-600">(SEO)</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Analyse complète de votre visibilité sur Google, Bing et autres moteurs de recherche
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">IA conversationnelles</h3>
                      <p className="text-gray-600">(GPT et autres)</p>
                    </div>
                  </div>
                  <p className="text-gray-700">Évaluation de votre réputation auprès des intelligences artificielles</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Link href="/">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Analyser ma réputation maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
