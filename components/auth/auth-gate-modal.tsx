"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Brain, CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AuthGateModalProps {
  isOpen: boolean
  onAuthSuccess: () => void
  onClose: () => void
  analysisType: "simple" | "duel"
}

export function AuthGateModal({ isOpen, onAuthSuccess, onClose, analysisType }: AuthGateModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239,68,68,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative min-h-full flex items-center justify-center p-4 py-8">
        <div className="relative w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 bg-zinc-950 border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Side - Benefits */}
          <div className="bg-gradient-to-br from-red-950/40 to-black p-5 sm:p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-red-900/20">
            <div className="mb-4 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4 sm:mb-6">
                <Lock className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Accès Sécurisé</span>
              </div>

              <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
                Votre Analyse est Prête
              </h2>
              <p className="text-gray-400 text-sm sm:text-lg">
                {analysisType === "duel"
                  ? "Créez un compte gratuit pour accéder au rapport de confrontation complet."
                  : "Créez un compte gratuit pour accéder au rapport d'intelligence complet."}
              </p>
            </div>

            <div className="space-y-2 sm:space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  </div>
                  <span className="text-gray-300 text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-red-900/20">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">Analyse IA Avancée</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Propulsée par les derniers modèles GPT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-4 sm:mb-8">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                {mode === "signup" ? "Créer un Compte" : "Se Connecter"}
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                {mode === "signup" ? "Gratuit et sans engagement" : "Accédez à vos analyses"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-11 bg-zinc-900 border-white/10 focus:border-red-500/50 h-10 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 relative">
                <Label htmlFor="password" className="text-gray-300 text-sm">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-11 pr-10 sm:pr-11 bg-zinc-900 border-white/10 focus:border-red-500/50 h-10 sm:h-12 text-sm sm:text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-red-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 sm:p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 sm:p-4 bg-green-950/30 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-xs sm:text-sm leading-relaxed">{successMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-12 bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <>
                    {mode === "signup" ? "Créer mon Compte" : "Se Connecter"}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="ml-2 text-red-500 hover:text-red-400 font-medium"
                >
                  {mode === "login" ? "Créez-en un" : "Se connecter"}
                </button>
              </p>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
