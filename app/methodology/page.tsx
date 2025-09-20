import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, Target, Zap, BarChart3, Search, Brain, CheckCircle } from "lucide-react"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
              <BarChart3 className="w-4 h-4" />
              Méthodologie
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Comment nous calculons vos scores
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez la science derrière l'analyse Quintilian Index : une méthode rigoureuse combinant recherche
              Google et intelligence artificielle avancée.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-12 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-primary" />
                Vue d'ensemble
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">
                Notre algorithme analyse votre réputation digitale selon <strong>3 dimensions clés</strong>, chacune
                notée sur 100 points. Le score final est la moyenne pondérée de ces trois composantes.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Présence Digitale</div>
                  <div className="text-sm text-muted-foreground">Visibilité & Quantité</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Sentiment Global</div>
                  <div className="text-sm text-muted-foreground">Perception & Tonalité</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold">Cohérence Message</div>
                  <div className="text-sm text-muted-foreground">Alignement & Pertinence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scoring */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">Détail des scores</h2>

            {/* Presence Score */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Score de Présence Digitale</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Mesure votre visibilité sur les moteurs de recherche
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      Critères d'évaluation
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Nombre de résultats :</strong> Quantité de pages mentionnant votre nom/marque
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Qualité des sources :</strong> Autorité et crédibilité des sites web
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Diversité des plateformes :</strong> Présence sur différents types de sites
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Fraîcheur du contenu :</strong> Récence des mentions et actualités
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Barème de notation</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          80-100
                        </Badge>
                        <span className="text-sm">Excellente visibilité, présence dominante</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          60-79
                        </Badge>
                        <span className="text-sm">Bonne présence, quelques améliorations possibles</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          40-59
                        </Badge>
                        <span className="text-sm">Présence modérée, travail nécessaire</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          0-39
                        </Badge>
                        <span className="text-sm">Faible visibilité, action urgente requise</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">Exemple de calcul</h5>
                  <p className="text-sm text-blue-800">
                    Une marque avec 50 000 résultats Google, présente sur des sites d'autorité (Wikipedia, presse
                    nationale) et avec du contenu récent obtiendrait un score de présence de 85/100.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Score */}
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Score de Sentiment Global</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Analyse la tonalité des mentions vous concernant
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Analyse IA avancée
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Analyse sémantique :</strong> Compréhension du contexte et des nuances
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Détection d'émotions :</strong> Identification des sentiments positifs/négatifs
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Pondération par source :</strong> Impact selon l'autorité de la source
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Analyse temporelle :</strong> Évolution du sentiment dans le temps
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Classification des sentiments</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Très Positif
                        </Badge>
                        <span className="text-sm">90-100 points</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                          Positif
                        </Badge>
                        <span className="text-sm">70-89 points</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          Neutre
                        </Badge>
                        <span className="text-sm">50-69 points</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Négatif
                        </Badge>
                        <span className="text-sm">30-49 points</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Très Négatif
                        </Badge>
                        <span className="text-sm">0-29 points</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <h5 className="font-semibold text-pink-900 mb-2">Exemple d'analyse</h5>
                  <p className="text-sm text-pink-800">
                    "Apple révolutionne l'industrie avec son innovation" = Sentiment très positif (95/100). "Apple fait
                    face à des critiques sur ses prix" = Sentiment négatif (35/100).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Coherence Score */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Score de Cohérence Message</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Mesure l'alignement entre votre message et votre réalité digitale
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Méthode de comparaison
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Analyse sémantique :</strong> Comparaison des concepts clés de votre message
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Correspondance thématique :</strong> Alignement des sujets et domaines d'expertise
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Validation factuelle :</strong> Vérification des affirmations dans votre message
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Cohérence temporelle :</strong> Évolution de votre positionnement dans le temps
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Niveaux de cohérence</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Parfaite
                        </Badge>
                        <span className="text-sm">90-100 : Message totalement aligné</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                          Excellente
                        </Badge>
                        <span className="text-sm">80-89 : Très bonne cohérence</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Bonne
                        </Badge>
                        <span className="text-sm">60-79 : Cohérence acceptable</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Faible
                        </Badge>
                        <span className="text-sm">40-59 : Décalage notable</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Incohérente
                        </Badge>
                        <span className="text-sm">0-39 : Message non aligné</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">Exemple pratique</h5>
                  <p className="text-sm text-green-800">
                    Message : "Leader de l'innovation technologique" pour Apple = Cohérence parfaite (98/100) car
                    confirmé par de nombreuses sources. Même message pour une petite startup = Cohérence faible
                    (25/100).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Process */}
          <Card className="mt-12 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Processus technique</CardTitle>
              <CardDescription className="text-center">
                Notre pipeline d'analyse en 4 étapes pour des résultats précis et fiables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold">Collecte de données</h4>
                  <p className="text-sm text-muted-foreground">
                    Recherche Google avancée avec filtres de qualité et de pertinence
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold">Analyse IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Traitement par GPT-4 pour l'analyse sémantique et sentimentale
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold">Calcul des scores</h4>
                  <p className="text-sm text-muted-foreground">
                    Algorithmes propriétaires pour la notation sur 100 points
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold">Synthèse</h4>
                  <p className="text-sm text-muted-foreground">
                    Génération du rapport final avec recommandations personnalisées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-center">Questions fréquentes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pourquoi mon score varie-t-il ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Les scores évoluent en temps réel selon les nouvelles publications, actualités et changements dans
                    votre écosystème digital. Une analyse mensuelle est recommandée.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comment améliorer mes scores ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Créez du contenu de qualité, optimisez votre SEO, gérez votre e-réputation et alignez votre
                    communication avec votre réalité business.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quelle est la fiabilité ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Notre algorithme analyse des milliers de sources avec une précision de 94%. Les résultats sont
                    validés par des experts en réputation digitale.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Puis-je contester un résultat ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Oui, contactez notre équipe avec des éléments factuels. Nous révisons l'analyse si nécessaire et
                    ajustons nos algorithmes pour plus de précision.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
