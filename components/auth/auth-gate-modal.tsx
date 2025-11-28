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
  CheckCircle2,
  Loader2,
  TrendingUp,
  Globe,
  MessageCircle,
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
          <span>Full content after signup</span>
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
          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Duel Complete</span>
        </div>
        <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-1">
          {data.brand1} vs {data.brand2}
        </h2>
        <p className="text-gray-400 text-sm">Sign up to see the complete comparative analysis</p>
      </div>

      {/* Duel Score Comparison */}
      <div className="relative bg-zinc-900/60 border border-violet-900/30 rounded-xl p-4 mb-4">
        {/* Winner badge */}
        {winner && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-violet-600 rounded-full">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-white">Winner</span>
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
            <div className="text-xs text-gray-500">Global Score</div>
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
            <div className="text-xs text-gray-500">Global Score</div>
          </div>
        </div>
      </div>

      {/* Metrics comparison preview (blurred) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-gray-400">Visibility</span>
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
      {data.verdict && <BlurredTextPreview text={data.verdict} label="Analysis Verdict" />}

      {/* Teaser stats */}
      <div className="mt-4 pt-4 border-t border-violet-900/20">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Complete comparative analysis
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-violet-400" />
            Report locked
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
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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
    setIsSubmitting(true)
    setError(null)

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
          // Handle email confirmation message
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
      setIsSubmitting(false)
    }
  }

  const benefits = [
    "Access to complete analysis reports",
    "History of your searches",
    "Comparisons and trends",
    "Data export",
  ]

  const hasPreview = previewData && (previewData.global_score || previewData.presence_score)
  const hasDuelPreview = duelPreviewData && (duelPreviewData.brand1_score || duelPreviewData.brand2_score)
  const hasAnyPreview = hasPreview || hasDuelPreview

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-violet-900/30 rounded-2xl shadow-2xl shadow-violet-500/20 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Preview */}
          <div className="p-8 border-r border-violet-900/30">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">ANALYSIS COMPLETE</span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-1">
                Results for {previewData?.brand || duelPreviewData?.brand1 || ""}
              </h2>
              <p className="text-gray-400 text-sm">Preview of your analysis – sign up to see the full report</p>
            </div>

            {/* Preview Content */}
            {analysisType === "simple" && previewData && (
              <div className="space-y-4">
                {/* Scores Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {previewData.global_score !== undefined && (
                    <ScorePreview label="GLOBAL SCORE" score={previewData.global_score} icon={TrendingUp} />
                  )}
                  {previewData.presence_score !== undefined && (
                    <ScorePreview label="VISIBILITY" score={previewData.presence_score} icon={Globe} />
                  )}
                  {previewData.tone_score !== undefined && (
                    <ScorePreview label="SENTIMENT" score={previewData.tone_score} icon={MessageCircle} />
                  )}
                </div>

                {/* Summary Preview */}
                {previewData.gpt_summary && <BlurredTextPreview text={previewData.gpt_summary} label="KEY SUMMARY" />}

                {/* Sources Count */}
                {previewData.sources_count && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{previewData.sources_count} sources analyzed</span>
                    <div className="flex items-center gap-1 text-violet-400">
                      <Shield className="w-4 h-4" />
                      <span>Details locked</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Duel Preview */}
            {analysisType === "duel" && duelPreviewData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{duelPreviewData.brand1_score || "?"}</div>
                    <div className="text-sm text-gray-400">{duelPreviewData.brand1}</div>
                  </div>
                  <Swords className="w-6 h-6 text-violet-500 mx-4" />
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{duelPreviewData.brand2_score || "?"}</div>
                    <div className="text-sm text-gray-400">{duelPreviewData.brand2}</div>
                  </div>
                </div>

                {/* Partial Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-3 relative">
                    <Globe className="w-4 h-4 text-violet-500 mb-1" />
                    <div className="text-sm text-gray-500 mb-1">VISIBILITY</div>
                    <div className="blur-sm text-xl font-bold text-white">85 vs 92</div>
                    <Lock className="w-3 h-3 text-violet-400 absolute top-2 right-2" />
                  </div>
                  <div className="bg-zinc-900/50 border border-violet-900/20 rounded-lg p-3 relative">
                    <MessageCircle className="w-4 h-4 text-violet-500 mb-1" />
                    <div className="text-sm text-gray-500 mb-1">SENTIMENT</div>
                    <div className="blur-sm text-xl font-bold text-white">78 vs 81</div>
                    <Lock className="w-3 h-3 text-violet-400 absolute top-2 right-2" />
                  </div>
                </div>

                {/* Verdict Preview */}
                {duelPreviewData.verdict && <BlurredTextPreview text={duelPreviewData.verdict} label="VERDICT" />}
              </div>
            )}
          </div>

          {/* Right side - Auth Form */}
          <div className="p-8 bg-black/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" />
                <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">SECURE ACCESS</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                {hasAnyPreview ? "Unlock Report" : "Your Analysis is Ready"}
              </h3>
              <p className="text-gray-400 text-sm">
                {analysisType === "duel"
                  ? "Create a free account to access the full report."
                  : "Free and instant signup."}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-2 mb-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === "signin" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === "signup" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 bg-zinc-900/50 border-violet-900/30 text-white placeholder:text-gray-600 focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-zinc-900/50 border-violet-900/30 text-white placeholder:text-gray-600 focus:border-violet-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 rounded-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === "signup" ? "See Full Report" : "Sign In"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-400">
                {mode === "signin" ? (
                  <>
                    No account yet?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Your data is protected and confidential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
