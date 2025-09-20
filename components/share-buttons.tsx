"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Twitter, Facebook, Share2, Copy, Check, AlertCircle } from "lucide-react"
import { shareAnalysisResultClient } from "@/lib/services/shared-results"
import type { AnalysisHistoryItem } from "@/lib/history"

interface ShareButtonsProps {
  analysis: AnalysisHistoryItem
}

export function ShareButtons({ analysis }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    setIsSharing(true)
    setError(null)

    try {
      const sharedId = await shareAnalysisResultClient(analysis)

      if (sharedId) {
        const url = `${window.location.origin}/shared/${sharedId}`
        setShareUrl(url)
      } else {
        setError("La fonctionnalité de partage n'est pas encore disponible. La base de données doit être configurée.")
      }
    } catch (error) {
      console.error("[v0] Error sharing result:", error)
      setError("Une erreur est survenue lors de la création du lien de partage.")
    } finally {
      setIsSharing(false)
    }
  }

  const globalScore = Math.round(
    (analysis.results.presence_score + analysis.results.tone_score + analysis.results.coherence_score) / 3,
  )

  const tweetText = `🚀 Découvrez mon analyse SEO complète sur Quintilian !\n\n📊 ${analysis.brand} - Score: ${globalScore}/100\n✅ Présence: ${analysis.results.presence_score}/100\n💭 Sentiment: ${analysis.results.tone_score}/100\n🎯 Cohérence: ${analysis.results.coherence_score}/100\n\n#SEO #AnalyseSEO #Marketing`

  const facebookText = `Découvrez l'analyse SEO complète de ${analysis.brand} avec un score global de ${globalScore}/100 ! Analysez votre propre présence digitale sur Quintilian.`

  const handleSocialShare = (platform: "twitter" | "facebook") => {
    if (!shareUrl) return

    let url = ""

    if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(facebookText)}`
    }

    window.open(url, "_blank", "width=600,height=400")
  }

  const copyToClipboard = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
          if (!shareUrl && !error) {
            handleShare()
          }
        }}
        variant="outline"
        size="sm"
        className="text-primary border-primary hover:bg-primary/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Partager mon résultat
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partager votre résultat</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isSharing ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Création du lien de partage...</p>
              </div>
            ) : shareUrl ? (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{analysis.brand}</h4>
                  <p className="text-sm text-muted-foreground mb-2">Score global: {globalScore}/100</p>
                  <p className="text-xs text-muted-foreground break-all">{shareUrl}</p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSocialShare("twitter")}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Partager sur Twitter
                  </Button>

                  <Button
                    onClick={() => handleSocialShare("facebook")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Partager sur Facebook
                  </Button>

                  <Button onClick={copyToClipboard} variant="outline" className="w-full bg-transparent">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Lien copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleShare} variant="outline">
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Erreur lors de la création du lien de partage</p>
                <Button onClick={handleShare} className="mt-4">
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
