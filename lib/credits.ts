import { createClient } from "@/lib/supabase/server"

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
    const supabase = await createClient()

    const { data: user, error } = await supabase.from("User").select("credits").eq("id", userId).single()

    if (error || !user) {
      throw new Error("Utilisateur non trouvé")
    }

    const { data: usedCreditsData } = await supabase
      .from("CreditLedger")
      .select("delta")
      .eq("userId", userId)
      .like("reason", "%usage%")

    const { data: purchasedCreditsData } = await supabase
      .from("CreditLedger")
      .select("delta")
      .eq("userId", userId)
      .like("reason", "%purchase%")

    const totalCredits = purchasedCreditsData?.reduce((sum, record) => sum + (record.delta || 0), 0) || 0
    const used = Math.abs(usedCreditsData?.reduce((sum, record) => sum + (record.delta || 0), 0) || 0)
    const remaining = totalCredits - used

    return {
      userId,
      totalCredits,
      usedCredits: used,
      remainingCredits: Math.max(0, remaining),
    }
  }

  static async addCredits(userId: string, amount: number, description: string): Promise<void> {
    const supabase = await createClient()

    const { data: currentUser } = await supabase.from("User").select("credits").eq("id", userId).single()

    const newCredits = (currentUser?.credits || 0) + amount

    const { error: updateError } = await supabase.rpc("add_user_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
    })

    if (updateError) {
      // Fallback to manual transaction
      await supabase.from("User").update({ credits: newCredits }).eq("id", userId)
      await supabase.from("CreditLedger").insert({
        userId,
        delta: amount,
        reason: `purchase: ${description}`,
      })
    }
  }

  static async useCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId)

    if (userCredits.remainingCredits < amount) {
      return false
    }

    const supabase = await createClient()

    const newCredits = userCredits.remainingCredits - amount

    const { error: updateError } = await supabase.from("User").update({ credits: newCredits }).eq("id", userId)

    if (updateError) throw updateError

    const { error: ledgerError } = await supabase.from("CreditLedger").insert({
      userId,
      delta: -amount,
      reason: `usage: ${description}`,
    })

    if (ledgerError) throw ledgerError

    return true
  }

  static async getCreditHistory(userId: string): Promise<CreditTransaction[]> {
    const supabase = await createClient()

    const { data: transactions, error } = await supabase
      .from("CreditLedger")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(50)

    if (error) throw error

    return (transactions || []).map((t) => ({
      id: t.id,
      userId: t.userId,
      amount: t.delta,
      type: t.reason.includes("purchase") ? "purchase" : t.reason.includes("usage") ? "usage" : "refund",
      description: t.reason,
      createdAt: new Date(t.createdAt),
    }))
  }

  static async hasCreditsForSearch(userId: string): Promise<boolean> {
    const credits = await this.getUserCredits(userId)
    return credits.remainingCredits > 0
  }
}
