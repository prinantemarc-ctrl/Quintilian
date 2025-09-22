import Stripe from "stripe"

let stripe: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY) {
  console.log("[v0] STRIPE_SECRET_KEY: ✓ Found")
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  })
} else {
  console.log("[v0] STRIPE_SECRET_KEY: ✗ Missing")
  // Create a mock stripe instance for development
  stripe = null
}

export { stripe }

export function isStripeConfigured(): boolean {
  return stripe !== null
}

export const CREDIT_PACKAGES = [
  {
    id: "credits_10",
    name: "Pack Starter",
    credits: 10,
    price: 500, // 5€ en centimes
    description: "Parfait pour commencer",
    popular: false,
  },
  {
    id: "credits_50",
    name: "Pack Standard",
    credits: 50,
    price: 2000, // 20€ en centimes
    description: "Le plus populaire",
    popular: true,
  },
  {
    id: "credits_100",
    name: "Pack Premium",
    credits: 100,
    price: 3500, // 35€ en centimes
    description: "Pour les utilisateurs intensifs",
    popular: false,
  },
  {
    id: "credits_500",
    name: "Pack Entreprise",
    credits: 500,
    price: 15000, // 150€ en centimes
    description: "Pour les équipes",
    popular: false,
  },
] as const

export type CreditPackage = (typeof CREDIT_PACKAGES)[number]

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)
}
