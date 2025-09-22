import { CreditManager } from "@/lib/credits"

export interface PaywallConfig {
  feature: string
  requiredCredits: number
  description: string
  benefits?: string[]
}

export const PAYWALL_FEATURES = {
  ADVANCED_SEARCH: {
    feature: "Recherche avancée",
    requiredCredits: 2,
    description: "Accédez à des recherches plus précises et détaillées",
    benefits: ["Recherche dans plusieurs sources", "Filtres avancés", "Résultats prioritaires"],
  },
  AI_ANALYSIS: {
    feature: "Analyse IA",
    requiredCredits: 3,
    description: "Obtenez des analyses approfondies générées par l'IA",
    benefits: ["Analyse de sentiment", "Résumés automatiques", "Recommandations personnalisées"],
  },
  BULK_OPERATIONS: {
    feature: "Opérations en lot",
    requiredCredits: 5,
    description: "Traitez plusieurs éléments simultanément",
    benefits: ["Traitement par lots", "Export en masse", "Automatisation avancée"],
  },
  PREMIUM_SUPPORT: {
    feature: "Support premium",
    requiredCredits: 1,
    description: "Accès au support prioritaire",
    benefits: ["Réponse sous 2h", "Support par chat", "Assistance personnalisée"],
  },
} as const

export type PaywallFeature = keyof typeof PAYWALL_FEATURES

export class PaywallManager {
  static async checkAccess(userId: string, feature: PaywallFeature): Promise<boolean> {
    const config = PAYWALL_FEATURES[feature]
    const credits = await CreditManager.getUserCredits(userId)
    return credits.remainingCredits >= config.requiredCredits
  }

  static async consumeCreditsForFeature(
    userId: string,
    feature: PaywallFeature,
  ): Promise<{ success: boolean; message: string }> {
    const config = PAYWALL_FEATURES[feature]
    const success = await CreditManager.useCredits(userId, config.requiredCredits, `Utilisation de ${config.feature}`)

    return {
      success,
      message: success
        ? `${config.feature} activé avec succès`
        : `Crédits insuffisants pour ${config.feature}. ${config.requiredCredits} crédits requis.`,
    }
  }

  static getFeatureConfig(feature: PaywallFeature) {
    return PAYWALL_FEATURES[feature]
  }
}
