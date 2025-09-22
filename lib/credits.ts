import { prisma } from "@/lib/prisma"

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: "purchase" | "usage" | "refund"
  description: string
  createdAt: Date
}

export interface UserCredits {
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
}

export class CreditManager {
  static async getUserCredits(userId: string): Promise<UserCredits> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user) {
      throw new Error("Utilisateur non trouvé")
    }

    const usedCredits = await prisma.creditLedger.aggregate({
      where: {
        userId,
        type: "usage",
      },
      _sum: {
        amount: true,
      },
    })

    const purchasedCredits = await prisma.creditLedger.aggregate({
      where: {
        userId,
        type: "purchase",
      },
      _sum: {
        amount: true,
      },
    })

    const totalCredits = purchasedCredits._sum.amount || 0
    const used = Math.abs(usedCredits._sum.amount || 0)
    const remaining = totalCredits - used

    return {
      userId,
      totalCredits,
      usedCredits: used,
      remainingCredits: Math.max(0, remaining),
    }
  }

  static async addCredits(userId: string, amount: number, description: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Ajouter les crédits à l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
      })

      // Enregistrer la transaction
      await tx.creditLedger.create({
        data: {
          userId,
          amount,
          type: "purchase",
          description,
        },
      })
    })
  }

  static async useCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId)

    if (userCredits.remainingCredits < amount) {
      return false
    }

    await prisma.$transaction(async (tx) => {
      // Décrémenter les crédits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount,
          },
        },
      })

      // Enregistrer l'utilisation
      await tx.creditLedger.create({
        data: {
          userId,
          amount: -amount,
          type: "usage",
          description,
        },
      })
    })

    return true
  }

  static async getCreditHistory(userId: string): Promise<CreditTransaction[]> {
    const transactions = await prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      amount: t.amount,
      type: t.type as "purchase" | "usage" | "refund",
      description: t.description,
      createdAt: t.createdAt,
    }))
  }

  static async hasCreditsForSearch(userId: string): Promise<boolean> {
    const credits = await this.getUserCredits(userId)
    return credits.remainingCredits > 0
  }
}
