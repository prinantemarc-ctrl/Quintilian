"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Brain,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Globe,
  MessageCircle,
  Zap,
  Swords,
  Trophy,
  Target,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PreviewData {
  brand?: string
  global_score?: number
  presence_score?: number
  tone_score?: number
  coherence_score?: number
  tone_label?: string
  rationale?: string
  gpt_summary?: string
  detailed_analysis?: string
  sources_count?: number
}

interface DuelPreviewData {
  brand1: string
  brand2: string
  brand1_score?: number
  brand2_score?: number
  brand1_presence?: number
  brand2_presence?: number
  brand1_sentiment?: number
  brand2_sentiment?: number
  winner?: string
  verdict?: string
}

interface AuthGateModalProps {
  isOpen: boolean
  onAuthSuccess: () => void
  onClose: () => void
  analysisType: "simple" | "duel"
  previewData?: PreviewData
  duelPreviewData?: DuelPreviewData
}

function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

function ScorePreview({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  return (
    <div className="relative group">
      <div className="bg-zinc-900/80 border border-violet-900/30 rounded-lg p-3 text-center">
        <Icon className="w-4 h-4 text-violet-500 mx-auto mb-1" />
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-xs text-gray-500 uppercase">{label}</div>
      </div>
      {/* Subtle lock overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Lock className="w-3 h-3 text-violet-400" />
      </div>
    </div>
  )
}

function BlurredTextPreview({ text, label }: { text: string; label: string }) {
  const truncated = truncateText(text, 150)
  return (
    <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-4 relative overflow-hidden">
      <div className="text-xs text-violet-400 uppercase tracking-wider mb-2 font-medium">{label}</div>
      <p className="text-gray-400 text-sm leading-relaxed">
        {truncated.substring(0, 80)}
        <span className="blur-sm select-none">{truncated.substring(80)}</span>
      </p>
      {/* Gradient fade to indicate more content */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900 to-transparent" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1 text-xs text-violet-400">
          <Lock className="w-3 h-3" />
          <span>Contenu complet après inscription</span>
        </div>
      </div>
    </div>
  )
}

function DuelPreview({ data }: { data: DuelPreviewData }) {
  const winner =
    data.brand1_score && data.brand2_score
      ? data.brand1_score > data.brand2_score
        ? data.brand1
        : data.brand2_score > data.brand1_score
          ? data.brand2
          : null
      : null

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-violet-950/30 to-black p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-violet-900/20">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Duel terminé</span>
        </div>
        <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-1">
          {data.brand1} vs {data.brand2}
        </h2>
        <p className="text-gray-400 text-sm">Inscrivez-vous pour voir l'analyse comparative complète</p>
      </div>

      {/* Duel Score Comparison */}
      <div className="relative bg-zinc-900/60 border border-violet-900/30 rounded-xl p-4 mb-4">
        {/* Winner badge */}
        {winner && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-violet-600 rounded-full">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-white">Vainqueur</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mt-2">
          {/* Brand 1 */}
          <div className={`flex-1 text-center ${winner === data.brand1 ? "opacity-100" : "opacity-70"}`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-600/20 border-2 border-violet-500/50 flex items-center justify-center">
              <span className="text-xl font-bold text-violet-400">{data.brand1.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-sm font-medium text-white truncate px-2">{data.brand1}</div>
            <div className="text-3xl font-bold text-white mt-1">{data.brand1_score || "??"}</div>
            <div className="text-xs text-gray-500">Score Global</div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <Swords className="w-6 h-6 text-violet-500 mb-1" />
            <span className="text-sm font-bold text-violet-400">VS</span>
          </div>

          {/* Brand 2 */}
          <div className={`flex-1 text-center ${winner === data.brand2 ? "opacity-100" : "opacity-70"}`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-600/20 border-2 border-violet-500/50 flex items-center justify-center">
              <span className="text-xl font-bold text-violet-400">{data.brand2.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-sm font-medium text-white truncate px-2">{data.brand2}</div>
            <div className="text-3xl font-bold text-white mt-1">{data.brand2_score || "??"}</div>
            <div className="text-xs text-gray-500">Score Global</div>
          </div>
        </div>
      </div>

      {/* Metrics comparison preview (blurred) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-gray-400">Visibilité</span>
          </div>
          <div className="flex justify-between items-center blur-sm">
            <span className="text-lg font-bold text-white">{data.brand1_presence || 85}</span>
            <span className="text-lg font-bold text-white">{data.brand2_presence || 82}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="w-4 h-4 text-violet-400" />
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-gray-400">Sentiment</span>
          </div>
          <div className="flex justify-between items-center blur-sm">
            <span className="text-lg font-bold text-white">{data.brand1_sentiment || 72}</span>
            <span className="text-lg font-bold text-white">{data.brand2_sentiment || 68}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="w-4 h-4 text-violet-400" />
          </div>
        </div>
      </div>

      {/* Verdict preview */}
      {data.verdict && <BlurredTextPreview text={data.verdict} label="Verdict de l'analyse" />}

      {/* Teaser stats */}
      <div className="mt-4 pt-4 border-t border-violet-900/20">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Analyse comparative complète
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-violet-400" />
            Rapport verrouillé
          </span>
        </div>
      </div>
    </div>
  )
}

export function AuthGateModal({
  isOpen,
  onAuthSuccess,
  onClose,
  analysisType,
  previewData,
  duelPreviewData,
}: AuthGateModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const getRedirectUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    if (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL) {
      return process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
    }
    if (typeof window !== "undefined") {
      const origin = window.location.origin
      if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return origin
      }
    }
    return ""
  }

  const getErrorMessage = (err: any): string => {
    const errorMessage = err.message || err.error_description || String(err)
    console.log("[v0] Auth error:", errorMessage)
    if (errorMessage.includes("60 seconds") || errorMessage.includes("30 seconds")) {
      return "Trop de tentatives. Veuillez patienter 60 secondes avant de réessayer."
    }
    if (errorMessage.includes("Invalid login credentials")) {
      return "Email ou mot de passe incorrect."
    }
    if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
      return "Cet email est déjà utilisé. Essayez de vous connecter."
    }
    if (errorMessage.includes("Password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères."
    }
    if (errorMessage.includes("Invalid email")) {
      return "Format d'email invalide."
    }
    if (errorMessage.includes("Email not confirmed")) {
      return "Email non confirmé. Vérifiez votre boîte mail."
    }
    return errorMessage
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const supabase = createClient()

    try {
      if (mode === "signup") {
        console.log("[v0] Attempting signup...")
        const redirectUrl = getRedirectUrl()
        console.log("[v0] Redirect URL:", redirectUrl)

        const signUpOptions: any = {
          email,
          password,
        }

        if (redirectUrl) {
          signUpOptions.options = {
            emailRedirectTo: `${redirectUrl}/auth/callback`,
          }
        }

        const { data, error } = await supabase.auth.signUp(signUpOptions)
        if (error) throw error
        console.log("[v0] Signup successful:", data.user?.email)

        if (data.user && !data.user.email_confirmed_at) {
          setSuccessMessage(
            "✅ Compte créé ! Un email de confirmation vous a été envoyé. " +
              "Vérifiez votre boîte mail (et vos spams) puis cliquez sur le lien pour confirmer.",
          )
        } else {
          onAuthSuccess()
        }
      } else {
        console.log("[v0] Attempting login...")
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        console.log("[v0] Login successful")
        onAuthSuccess()
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    "Accès aux rapports d'analyse complets",
    "Historique de vos recherches",
    "Comparaisons et tendances",
    "Export des données",
  ]

  const hasPreview = previewData && (previewData.global_score || previewData.presence_score)
  const hasDuelPreview = duelPreviewData && (duelPreviewData.brand1_score || duelPreviewData.brand2_score)
  const hasAnyPreview = hasPreview || hasDuelPreview

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative min-h-full flex items-center justify-center p-4 py-8">
        <div
          className={`relative w-full mx-auto ${hasAnyPreview ? "max-w-6xl" : "max-w-5xl"} grid grid-cols-1 ${hasAnyPreview ? "lg:grid-cols-5" : "md:grid-cols-2"} gap-0 bg-zinc-950 border border-violet-900/30 rounded-2xl overflow-hidden shadow-2xl`}
        >
          {hasDuelPreview && duelPreviewData && <DuelPreview data={duelPreviewData} />}

          {hasPreview && !hasDuelPreview && previewData && (
            <div className="lg:col-span-2 bg-gradient-to-br from-violet-950/30 to-black p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-violet-900/20">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Analyse terminée</span>
                </div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-1">
                  Résultats pour "{previewData.brand}"
                </h2>
                <p className="text-gray-400 text-sm">
                  Aperçu de votre analyse — inscrivez-vous pour voir le rapport complet
                </p>
              </div>

              {/* Score Preview Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {previewData.global_score && (
                  <ScorePreview label="Score Global" score={previewData.global_score} icon={TrendingUp} />
                )}
                {previewData.presence_score && (
                  <ScorePreview label="Visibilité" score={previewData.presence_score} icon={Globe} />
                )}
                {previewData.tone_score && (
                  <ScorePreview label="Sentiment" score={previewData.tone_score} icon={MessageCircle} />
                )}
                {previewData.coherence_score && (
                  <ScorePreview label="Cohérence" score={previewData.coherence_score} icon={Zap} />
                )}
              </div>

              {/* Blurred Analysis Preview */}
              {previewData.rationale && (
                <BlurredTextPreview text={previewData.rationale} label="Synthèse de l'analyse" />
              )}

              {/* Teaser stats */}
              <div className="mt-4 pt-4 border-t border-violet-900/20">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{previewData.sources_count || 10}+ sources analysées</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-violet-400" />
                    Détails verrouillés
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Left Side - Benefits (adjusted for preview layout) */}
          <div
            className={`${hasAnyPreview ? "lg:col-span-1" : ""} bg-gradient-to-br from-violet-950/40 to-black p-5 sm:p-6 ${hasAnyPreview ? "lg:p-5" : "md:p-12"} flex flex-col justify-center border-b ${hasAnyPreview ? "lg:border-b-0 lg:border-r" : "md:border-b-0 md:border-r"} border-violet-900/20`}
          >
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full mb-3 sm:mb-4">
                <Lock className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">Accès Sécurisé</span>
              </div>

              <h2
                className={`font-heading ${hasAnyPreview ? "text-lg sm:text-xl" : "text-xl sm:text-3xl md:text-4xl"} font-bold text-white mb-2`}
              >
                {hasAnyPreview ? "Débloquez le Rapport" : "Votre Analyse est Prête"}
              </h2>
              <p className="text-gray-400 text-sm">
                {analysisType === "duel"
                  ? "Créez un compte gratuit pour accéder au rapport complet."
                  : "Inscription gratuite et instantanée."}
              </p>
            </div>

            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-300 text-xs sm:text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {!hasAnyPreview && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-violet-900/20">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base">Analyse IA Avancée</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Propulsée par les derniers modèles GPT</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div
            className={`${hasAnyPreview ? "lg:col-span-2" : ""} p-5 sm:p-6 ${hasAnyPreview ? "lg:p-6" : "md:p-12"} flex flex-col justify-center`}
          >
            <div className="mb-4 sm:mb-6">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1">
                {mode === "signup" ? "Créer un Compte" : "Se Connecter"}
              </h3>
              <p className="text-sm text-gray-400">
                {mode === "signup" ? "Gratuit et sans engagement" : "Accédez à vos analyses"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-900 border-white/10 focus:border-violet-500/50 h-10 sm:h-11 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="password" className="text-gray-300 text-sm">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-zinc-900 border-white/10 focus:border-violet-500/50 h-10 sm:h-11 text-sm"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 hover:text-violet-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-xs leading-relaxed">{successMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signup" ? "Voir le Rapport Complet" : "Se Connecter"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="ml-2 text-violet-500 hover:text-violet-400 font-medium"
                >
                  {mode === "login" ? "Créez-en un" : "Se connecter"}
                </button>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Vos données sont protégées et confidentielles</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-white transition-colors z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="sm:w-6 sm:h-6"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
