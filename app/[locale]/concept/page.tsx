"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, Search, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const translations = {
  fr: {
    backHome: "Retour à l'accueil",
    heroTitle: "Découvrez l'image que vous projetez en ligne",
    heroSubtitle:
      "Dans un monde numérique où votre réputation se construit à chaque recherche, comprenez comment vous êtes perçu par vos clients, partenaires et concurrents.",
    firstReflexTitle: "Le premier réflexe de tous",
    firstReflexText:
      "Un citoyen, un consommateur, un banquier, un collaborateur, ou un concurrent. Tous ont un premier réflexe avant de vous faire confiance :",
    firstReflexBold: "taper votre nom ou celui de votre marque sur internet",
    whatWillTheySeee: "Que vont-ils voir ?",
    whatWillTheySeeDesc: "Les premiers résultats qui apparaissent définissent votre image",
    whatWillTheyFeel: "Que vont-ils ressentir ?",
    whatWillTheyFeelDesc: "L'émotion transmise par vos contenus influence leur décision",
    whatWillTheyConclude: "Qu'en concluront-ils ?",
    whatWillTheyConcludeDesc: "Leur impression finale détermine s'ils vous font confiance",
    analysisTitle: "C'est exactement ce que nous analysons",
    methodologyTagline: "Une méthodologie unique, un algorithme robuste",
    analysisSubtitle:
      "Notre technologie scrute l'ensemble de votre écosystème digital pour vous révéler votre véritable image en ligne.",
    quintilianQuote:
      "« Aujourd'hui, quand on cherche une information, on ne se limite plus au moteur de recherche classique. On interroge aussi les grands modèles d'intelligence artificielle, qui deviennent une nouvelle porte d'entrée vers le savoir. Or, ces deux sources donnent des visions différentes : l'une reflète ce qui existe réellement en ligne, l'autre reflète ce qui est perçu et structuré dans sa mémoire. Quintilian combine les deux pour révéler ce que \"le web\" pense vraiment de vous. Le système délivre trois scores clairs : présence, sentiment et cohérence. »",
    searchEngines: "Moteurs de recherche",
    seo: "(SEO)",
    searchEnginesDesc: "Analyse complète de votre visibilité sur Google, Bing et autres moteurs de recherche",
    conversationalAI: "IA conversationnelles",
    gptOthers: "(GPT et autres)",
    conversationalAIDesc: "Évaluation de votre réputation auprès des intelligences artificielles",
    ctaButton: "Analyser ma réputation maintenant",
  },
  en: {
    backHome: "Back to home",
    heroTitle: "Discover the image you project online",
    heroSubtitle:
      "In a digital world where your reputation is built with every search, understand how you are perceived by your clients, partners and competitors.",
    firstReflexTitle: "Everyone's first reflex",
    firstReflexText:
      "A citizen, a consumer, a banker, a collaborator, or a competitor. They all have a first reflex before trusting you:",
    firstReflexBold: "type your name or your brand name on the internet",
    whatWillTheySeee: "What will they see?",
    whatWillTheySeeDesc: "The first results that appear define your image",
    whatWillTheyFeel: "What will they feel?",
    whatWillTheyFeelDesc: "The emotion conveyed by your content influences their decision",
    whatWillTheyConclude: "What will they conclude?",
    whatWillTheyConcludeDesc: "Their final impression determines whether they trust you",
    analysisTitle: "This is exactly what we analyze",
    methodologyTagline: "A unique methodology, a robust algorithm",
    analysisSubtitle: "Our technology scans your entire digital ecosystem to reveal your true online image.",
    quintilianQuote:
      '« Today, when we search for information, we no longer limit ourselves to classic search engines. We also query large artificial intelligence models, which are becoming a new gateway to knowledge. However, these two sources give different visions: one reflects what actually exists online, the other reflects what is perceived and structured in its memory. Quintilian combines both to reveal what "the web" really thinks of you. The system delivers three clear scores: presence, sentiment and coherence. »',
    searchEngines: "Search engines",
    seo: "(SEO)",
    searchEnginesDesc: "Complete analysis of your visibility on Google, Bing and other search engines",
    conversationalAI: "Conversational AI",
    gptOthers: "(GPT and others)",
    conversationalAIDesc: "Assessment of your reputation with artificial intelligences",
    ctaButton: "Analyze my reputation now",
  },
  es: {
    backHome: "Volver al inicio",
    heroTitle: "Descubre la imagen que proyectas en línea",
    heroSubtitle:
      "En un mundo digital donde tu reputación se construye con cada búsqueda, comprende cómo te perciben tus clientes, socios y competidores.",
    firstReflexTitle: "El primer reflejo de todos",
    firstReflexText:
      "Un ciudadano, un consumidor, un banquero, un colaborador o un competidor. Todos tienen un primer reflejo antes de confiar en ti:",
    firstReflexBold: "escribir tu nombre o el de tu marca en internet",
    whatWillTheySeee: "¿Qué verán?",
    whatWillTheySeeDesc: "Los primeros resultados que aparecen definen tu imagen",
    whatWillTheyFeel: "¿Qué sentirán?",
    whatWillTheyFeelDesc: "La emoción transmitida por tus contenidos influye en su decisión",
    whatWillTheyConclude: "¿Qué concluirán?",
    whatWillTheyConcludeDesc: "Su impresión final determina si confían en ti",
    analysisTitle: "Esto es exactamente lo que analizamos",
    methodologyTagline: "Una metodología única, un algoritmo robusto",
    analysisSubtitle:
      "Nuestra tecnología escanea todo tu ecosistema digital para revelarte tu verdadera imagen en línea.",
    quintilianQuote:
      '« Hoy, cuando buscamos información, ya no nos limitamos a los motores de búsqueda clásicos. También consultamos grandes modelos de inteligencia artificial, que se están convirtiendo en una nueva puerta de entrada al conocimiento. Sin embargo, estas dos fuentes dan visiones diferentes: una refleja lo que realmente existe en línea, la otra refleja lo que se percibe y estructura en su memoria. Quintilian combina ambas para revelar lo que "la web" realmente piensa de ti. El sistema entrega tres puntuaciones claras: presencia, sentimiento y coherencia. »',
    searchEngines: "Motores de búsqueda",
    seo: "(SEO)",
    searchEnginesDesc: "Análisis completo de tu visibilidad en Google, Bing y otros motores de búsqueda",
    conversationalAI: "IA conversacional",
    gptOthers: "(GPT y otros)",
    conversationalAIDesc: "Evaluación de tu reputación con las inteligencias artificiales",
    ctaButton: "Analizar mi reputación ahora",
  },
}

export default function ConceptPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "fr"
  const t = translations[locale as keyof typeof translations] || translations.fr

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${locale}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.backHome}
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t.heroTitle}</h1>
            <p className="text-xl text-gray-700 leading-relaxed">{t.heroSubtitle}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.firstReflexTitle}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t.firstReflexText} <strong className="text-blue-600">{t.firstReflexBold}</strong>.
              </p>
            </div>

            {/* Three Questions Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.whatWillTheySeee}</h3>
                  <p className="text-gray-600">{t.whatWillTheySeeDesc}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.whatWillTheyFeel}</h3>
                  <p className="text-gray-600">{t.whatWillTheyFeelDesc}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.whatWillTheyConclude}</h3>
                  <p className="text-gray-600">{t.whatWillTheyConcludeDesc}</p>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.analysisTitle}</h2>
                <p className="text-xl font-semibold text-blue-600 mb-4">{t.methodologyTagline}</p>
                <p className="text-lg text-gray-700">{t.analysisSubtitle}</p>
              </div>

              <div className="bg-white rounded-xl p-6 md:p-8 mb-8 border-l-4 border-blue-600">
                <p className="text-gray-800 leading-relaxed italic">{t.quintilianQuote}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{t.searchEngines}</h3>
                      <p className="text-gray-600">{t.seo}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{t.searchEnginesDesc}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{t.conversationalAI}</h3>
                      <p className="text-gray-600">{t.gptOthers}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{t.conversationalAIDesc}</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Link href={`/${locale}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  {t.ctaButton}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
