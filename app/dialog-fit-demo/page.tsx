"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdaptiveModal, useModal, type DialogFitContent } from "@/components/dialog-fit"
import { useLanguage } from "@/contexts/language-context"

export default function DialogFitDemoPage() {
  const { t } = useLanguage()
  const modal = useModal()

  const demoContents: { [key: string]: DialogFitContent } = {
    short: {
      title: "Analyse Courte - Test DialogFit",
      content: `Ceci est un exemple d'analyse courte avec moins de 350 mots.

**Résumé :** Votre marque présente une bonne visibilité digitale avec quelques points d'amélioration.

**Score global :** 75/100

**Recommandations :**
- Améliorer la cohérence du message
- Optimiser la présence sur les réseaux sociaux
- Renforcer l'engagement client

Cette analyse démontre l'efficacité du système DialogFit pour les contenus courts qui s'affichent automatiquement en taille "md".`,
      metadata: {
        processingTime: 1250,
        totalResults: 15,
        query: "Test DialogFit Court",
      },
    },

    medium: {
      title: "Analyse Moyenne - Réputation Digitale",
      content: `Cette analyse de taille moyenne contient entre 350 et 800 mots pour tester le redimensionnement automatique.

**Contexte de l'analyse :**
Votre marque a été analysée à travers 45 sources différentes incluant les réseaux sociaux, les articles de presse, les forums de discussion et les sites web spécialisés. L'analyse couvre une période de 6 mois pour obtenir une vision complète de votre réputation digitale.

**Résultats détaillés :**

**Présence Digitale (Score: 82/100)**
Votre présence digitale est excellente avec une forte visibilité sur les moteurs de recherche. Vous apparaissez dans les premiers résultats pour vos mots-clés principaux. Votre site web est bien optimisé et vos contenus sont régulièrement indexés.

**Sentiment Global (Score: 68/100)**
Le sentiment associé à votre marque est globalement positif mais présente quelques variations selon les plateformes. Les réseaux sociaux montrent un sentiment plus positif (75%) que les forums spécialisés (62%).

**Cohérence du Message (Score: 71/100)**
Votre message est cohérent sur la plupart des canaux mais présente quelques divergences sur certaines plateformes. Il serait bénéfique d'harmoniser la communication sur tous les supports.

**Analyse Comparative :**
Par rapport à vos concurrents directs, vous vous situez dans la moyenne haute du secteur. Vos points forts incluent l'innovation et la qualité de service, tandis que la communication pourrait être renforcée.

**Recommandations Stratégiques :**
1. Développer une stratégie de contenu plus cohérente
2. Améliorer la gestion de la réputation sur les forums
3. Renforcer la présence sur LinkedIn
4. Mettre en place un système de veille concurrentielle

Cette analyse de taille moyenne devrait s'afficher automatiquement en taille "lg" grâce au système adaptatif de DialogFit.`,
      metadata: {
        processingTime: 2840,
        totalResults: 45,
        query: "Réputation Digitale Moyenne",
      },
    },

    long: {
      title: "Analyse Complète - Réputation Mondiale",
      tabs: [
        {
          id: "resume",
          label: "Résumés",
          content: `**Résumé Exécutif**

Cette analyse complète de votre réputation mondiale révèle une présence digitale solide avec des opportunités d'amélioration significatives dans certaines régions géographiques.

**Points Clés :**
- Score global : 74/100
- Meilleure région : Europe (82/100)
- Région à améliorer : Asie-Pacifique (61/100)
- Sentiment général : Positif (71%)

**Résumé Google :**
Basé sur l'analyse de 1,247 résultats de recherche dans 18 pays, votre marque bénéficie d'une excellente visibilité en Europe et en Amérique du Nord. Les résultats montrent une forte association avec l'innovation et la qualité, mais révèlent des lacunes en Asie où la concurrence locale domine.

**Résumé GPT :**
L'analyse IA révèle que votre marque est perçue comme premium et innovante dans les marchés occidentaux, mais souffre d'un manque de localisation culturelle dans les marchés émergents. Les conversations en ligne montrent un fort engagement des clients existants mais une faible pénétration dans les nouveaux segments.`,
        },
        {
          id: "analyse",
          label: "Analyse Détaillée",
          content: `**Analyse Géographique Détaillée**

**Europe (Score: 82/100)**
- Présence digitale excellente (89/100)
- Sentiment très positif (84/100)
- Cohérence du message forte (73/100)

Votre marque jouit d'une excellente réputation en Europe, particulièrement en France, Allemagne et Royaume-Uni. Les consommateurs associent votre marque à la qualité et à l'innovation. Les médias spécialisés vous mentionnent régulièrement de manière positive.

**Amérique du Nord (Score: 78/100)**
- Présence digitale forte (81/100)
- Sentiment positif (79/100)
- Cohérence du message bonne (74/100)

Aux États-Unis et au Canada, votre marque est bien établie avec une forte reconnaissance. Les réseaux sociaux montrent un engagement élevé et les influenceurs parlent positivement de vos produits.

**Asie-Pacifique (Score: 61/100)**
- Présence digitale moyenne (58/100)
- Sentiment neutre (62/100)
- Cohérence du message faible (63/100)

Cette région présente le plus grand potentiel d'amélioration. La concurrence locale est forte et votre message n'est pas suffisamment adapté aux cultures locales. Il y a un besoin urgent de localisation.

**Amérique Latine (Score: 69/100)**
- Présence digitale correcte (71/100)
- Sentiment positif (72/100)
- Cohérence du message moyenne (64/100)

Marché émergent avec un potentiel intéressant. Votre marque commence à être reconnue, particulièrement au Brésil et au Mexique.

**Analyse Sectorielle**

**Concurrence Directe :**
Vos principaux concurrents (Concurrent A, B, C) ont des scores moyens de 71, 68 et 73 respectivement. Vous vous situez légèrement au-dessus de la moyenne sectorielle.

**Tendances du Marché :**
- Croissance de 15% des mentions positives sur 6 mois
- Augmentation de 23% de la visibilité sur LinkedIn
- Baisse de 8% des mentions sur Twitter (à surveiller)

**Analyse des Mots-Clés :**
Vos mots-clés principaux génèrent 2.3M d'impressions mensuelles avec un CTR moyen de 3.2%. Les termes "innovation" et "qualité" sont fortement associés à votre marque.`,
        },
        {
          id: "conclusion",
          label: "Conclusion",
          content: `**Conclusion Stratégique**

**Forces Identifiées :**
1. **Excellence Européenne :** Votre position dominante en Europe constitue une base solide pour l'expansion
2. **Innovation Reconnue :** L'association forte avec l'innovation vous différencie de la concurrence
3. **Qualité Perçue :** Les consommateurs reconnaissent la qualité de vos produits/services
4. **Engagement Client :** Forte fidélité et engagement des clients existants

**Défis à Relever :**
1. **Pénétration Asiatique :** Nécessité d'une stratégie de localisation approfondie
2. **Cohérence Globale :** Harmonisation du message sur tous les marchés
3. **Présence Mobile :** Optimisation pour les plateformes mobiles dominantes en Asie
4. **Concurrence Locale :** Adaptation aux spécificités culturelles locales

**Plan d'Action Recommandé :**

**Phase 1 (0-6 mois) - Consolidation**
- Maintenir l'excellence européenne
- Renforcer la présence nord-américaine
- Audit complet de la cohérence du message

**Phase 2 (6-12 mois) - Expansion Asiatique**
- Développement d'une stratégie de localisation pour l'Asie
- Partenariats avec des influenceurs locaux
- Adaptation du contenu aux plateformes locales (WeChat, LINE, etc.)

**Phase 3 (12-18 mois) - Optimisation Globale**
- Déploiement de la stratégie globale harmonisée
- Mesure et ajustement des performances
- Expansion vers de nouveaux marchés émergents

**ROI Attendu :**
- Amélioration du score global de 74 à 85+ sur 18 mois
- Augmentation de 40% de la visibilité en Asie-Pacifique
- Croissance de 25% de l'engagement global

**Investissement Recommandé :**
Budget estimé de 500K€ sur 18 mois pour la mise en œuvre complète de cette stratégie, avec un ROI attendu de 300% sur 3 ans.

Cette analyse complète démontre les capacités avancées du système DialogFit pour gérer des contenus longs et complexes avec navigation par onglets.`,
        },
      ],
      metadata: {
        processingTime: 5420,
        totalResults: 1247,
        query: "Réputation Mondiale Complète",
      },
    },

    error: {
      title: "Test d'Erreur - DialogFit",
      content: "Ce contenu ne devrait pas s'afficher car nous testons l'état d'erreur.",
    },

    loading: {
      title: "Test de Chargement - DialogFit",
      content: "Ce contenu ne devrait pas s'afficher car nous testons l'état de chargement.",
    },
  }

  const showShortContent = () => {
    modal.openModal(demoContents.short, { autoSize: true })
  }

  const showMediumContent = () => {
    modal.openModal(demoContents.medium, { autoSize: true })
  }

  const showLongContent = () => {
    modal.openModal(demoContents.long, { autoSize: true })
  }

  const showLoadingState = () => {
    modal.showLoading("Analyse en cours...")
    // Simuler un chargement de 3 secondes puis afficher le contenu
    setTimeout(() => {
      modal.updateContent(demoContents.short)
    }, 3000)
  }

  const showErrorState = () => {
    modal.showError(
      "Erreur de Connexion",
      "Impossible de se connecter au serveur d'analyse. Veuillez réessayer plus tard.",
    )
  }

  const showFullscreenContent = () => {
    modal.openModal(demoContents.long, {
      variant: "fullscreen",
      allowFullscreen: true,
    })
  }

  const showWithNavigation = () => {
    modal.openModal(demoContents.medium, {
      navigation: {
        onPrevious: () => console.log("Navigation précédente"),
        onNext: () => console.log("Navigation suivante"),
        hasPrevious: true,
        hasNext: true,
      },
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">DialogFit - Système de Modal Adaptatif</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Démonstration du nouveau système de modals adaptatifs qui remplace tous les pop-ups du site. DialogFit
          s'adapte automatiquement au contenu et offre une expérience optimisée sur tous les appareils.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline">Auto-sizing</Badge>
          <Badge variant="outline">Mobile-first</Badge>
          <Badge variant="outline">Accessible</Badge>
          <Badge variant="outline">Internationalisé</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test de taille automatique */}
        <Card>
          <CardHeader>
            <CardTitle>🔄 Taille Automatique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              DialogFit détecte automatiquement la taille optimale basée sur le contenu.
            </p>
            <div className="space-y-2">
              <Button onClick={showShortContent} variant="outline" className="w-full bg-transparent">
                Contenu Court (→ md)
              </Button>
              <Button onClick={showMediumContent} variant="outline" className="w-full bg-transparent">
                Contenu Moyen (→ lg)
              </Button>
              <Button onClick={showLongContent} variant="outline" className="w-full bg-transparent">
                Contenu Long (→ xl)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test des états */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ États du Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Gestion des états de chargement, d'erreur et de contenu normal.
            </p>
            <div className="space-y-2">
              <Button onClick={showLoadingState} variant="outline" className="w-full bg-transparent">
                État Chargement
              </Button>
              <Button onClick={showErrorState} variant="outline" className="w-full bg-transparent">
                État Erreur
              </Button>
              <Button onClick={showShortContent} variant="outline" className="w-full bg-transparent">
                État Normal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test des fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>🛠️ Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Barre d'outils, navigation, plein écran et autres fonctionnalités.
            </p>
            <div className="space-y-2">
              <Button onClick={showFullscreenContent} variant="outline" className="w-full bg-transparent">
                Mode Plein Écran
              </Button>
              <Button onClick={showWithNavigation} variant="outline" className="w-full bg-transparent">
                Avec Navigation
              </Button>
              <Button
                onClick={() => modal.openModal(demoContents.long, { showToolbar: false })}
                variant="outline"
                className="w-full"
              >
                Sans Barre d'Outils
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test de contenu avec onglets */}
        <Card>
          <CardHeader>
            <CardTitle>📑 Contenu à Onglets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Système d'onglets intégré pour organiser le contenu complexe.
            </p>
            <Button onClick={showLongContent} className="w-full">
              Analyse avec Onglets
            </Button>
          </CardContent>
        </Card>

        {/* Test responsive */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Design Responsive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sur mobile, DialogFit se transforme automatiquement en Sheet avec gestes de glissement.
            </p>
            <Button onClick={showMediumContent} className="w-full">
              Tester sur Mobile
            </Button>
            <p className="text-xs text-muted-foreground">Réduisez la largeur de votre navigateur pour voir l'effet</p>
          </CardContent>
        </Card>

        {/* Raccourcis clavier */}
        <Card>
          <CardHeader>
            <CardTitle>⌨️ Raccourcis Clavier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              DialogFit supporte les raccourcis clavier pour une navigation rapide.
            </p>
            <div className="text-xs space-y-1">
              <div>
                <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> - Fermer
              </div>
              <div>
                <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+F</kbd> - Plein écran
              </div>
              <div>
                <kbd className="px-1 py-0.5 bg-muted rounded">Alt+←/→</kbd> - Navigation
              </div>
            </div>
            <Button onClick={showWithNavigation} className="w-full">
              Tester les Raccourcis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informations techniques */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🔧 Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Tailles Automatiques :</h4>
              <ul className="space-y-1 text-xs">
                <li>• &lt;350 mots → md (max-w-2xl)</li>
                <li>• 350-800 mots → lg (max-w-4xl)</li>
                <li>• &gt;800 mots ou onglets → xl (max-w-6xl)</li>
                <li>• Mode plein écran disponible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Fonctionnalités :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Barre de progression de lecture</li>
                <li>• Actions : Copier, Partager, Imprimer</li>
                <li>• Navigation précédent/suivant</li>
                <li>• Responsive mobile (Sheet)</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-300">
            <p className="text-xs">
              DialogFit remplace tous les anciens modals du site (AnalysisModal, DuelModal, WorldReputationModal, etc.)
              avec une interface unifiée et des performances optimisées.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal DialogFit */}
      <AdaptiveModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        content={modal.content!}
        variant={modal.options.defaultSize}
        autoSize={modal.options.autoSize}
        showToolbar={modal.options.showToolbar}
        showProgress={modal.options.showProgress}
        allowFullscreen={modal.options.allowFullscreen}
        navigation={modal.options.navigation}
        loading={modal.loading}
        error={modal.error}
      />
    </div>
  )
}
