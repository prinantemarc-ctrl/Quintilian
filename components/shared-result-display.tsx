"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedScoreDisplay } from "@/components/enhanced-score-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, FileText, BarChart3, Share2, Twitter, Facebook, Target, AlertCircle } from "lucide-react"
import type { SharedResult } from "@/lib/services/shared-results"
import Link from "next/link"

interface SharedResultDisplayProps {
  result: SharedResult
}

export function SharedResultDisplay({ result }: SharedResultDisplayProps) {
  const globalScore = Math.round(
    (result.results.presence_score + result.results.tone_score + result.results.coherence_score) / 3,
  )

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const tweetText = `🚀 Découvrez mon analyse SEO complète sur Quintilian !\n\n📊 ${result.brand} - Score: ${globalScore}/100\n✅ Présence: ${result.results.presence_score}/100\n💭 Sentiment: ${result.results.tone_score}/100\n🎯 Cohérence: ${result.results.coherence_score}/100\n\n#SEO #AnalyseSEO #Marketing`

  const facebookText = `Découvrez l'analyse SEO complète de ${result.brand} avec un score global de ${globalScore}/100 ! Analysez votre propre présence digitale sur Quintilian.`

  const handleShare = (platform: "twitter" | "facebook") => {
    let url = ""

    if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(facebookText)}`
    }

    window.open(url, "_blank", "width=600,height=400")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      fr: "Français",
      en: "Anglais",
      es: "Español",
    }
    return labels[lang] || lang
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Analyse SEO Partagée</h1>
        <p className="text-muted-foreground">
          Résultat d'analyse généré le {new Date(result.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Brand Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">{result.brand}</h2>
            <p className="text-muted-foreground">{result.message}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Langue: {getLanguageLabel(result.language)}</span>
              <span>•</span>
              <span>
                {result.view_count} vue{result.view_count > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{globalScore}</div>
            <div className="text-sm text-muted-foreground">Score global</div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Button onClick={() => handleShare("twitter")} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Twitter className="w-4 h-4 mr-2" />
          Partager sur Twitter
        </Button>
        <Button onClick={() => handleShare("facebook")} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Facebook className="w-4 h-4 mr-2" />
          Partager sur Facebook
        </Button>
        <Button onClick={copyToClipboard} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Copier le lien
        </Button>
      </div>

      {/* Scores */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold">Scores détaillés</h3>
        <EnhancedScoreDisplay
          presence_score={result.results.presence_score}
          tone_score={result.results.tone_score}
          coherence_score={result.results.coherence_score}
          tone_label={result.results.tone_label}
          animated={true}
          showTrends={false}
        />
      </div>

      {/* Analysis Content */}
      {(result.results.google_summary ||
        result.results.gpt_summary ||
        result.results.structured_conclusion ||
        result.results.detailed_analysis) && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Analyse Complète</h3>

          <Tabs defaultValue="summaries" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-1">
              <TabsTrigger
                value="summaries"
                className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">G</span>
                </div>
                Résumés
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                Analyse Détaillée
              </TabsTrigger>
              <TabsTrigger
                value="conclusion"
                className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                Conclusion
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex items-center gap-2 h-10 rounded-lg font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
              >
                <Target className="w-5 h-5" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summaries" className="space-y-4">
              {(result.results.google_summary || result.results.gpt_summary) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {result.results.google_summary && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">G</span>
                          </div>
                          Résumé de l'analyse SEO
                        </CardTitle>
                        <p className="text-xs text-blue-600">Basé sur les résultats de recherche Google</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {result.results.google_summary}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.results.gpt_summary && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">AI</span>
                          </div>
                          Résumé GPT
                        </CardTitle>
                        <p className="text-xs text-primary/70">Analyse IA avancée et contextuelle</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {result.results.gpt_summary}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {result.results.detailed_analysis ? (
                <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <FileText className="w-5 h-5" />
                      Analyse Détaillée des Données
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                      <div
                        className="markdown-content leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: (typeof result.results.detailed_analysis === "string"
                            ? result.results.detailed_analysis
                            : String(result.results.detailed_analysis || "")
                          )
                            .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>")
                            .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-primary mb-4 mt-6">$1</h1>')
                            .replace(
                              /^## (.*$)/gm,
                              '<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h2>',
                            )
                            .replace(
                              /^### (.*$)/gm,
                              '<h3 class="text-base font-medium text-foreground mt-4 mb-2">$1</h3>',
                            )
                            .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
                            .replace(/^---$/gm, '<hr class="my-6 border-border">')
                            .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
                            .replace(
                              /^(?!<[h|l|p])(.*$)/gm,
                              '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>',
                            )
                            .replace(/<p class="mb-4 text-muted-foreground leading-relaxed"><\/p>/g, ""),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : result.results.rationale ? (
                <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <FileText className="w-5 h-5" />
                      Analyse Détaillée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {result.results.rationale}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="conclusion" className="space-y-4">
              {result.results.structured_conclusion && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader>
                    <CardTitle className="text-primary">📊 Conclusion Détaillée</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                      <div
                        className="markdown-content leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: (typeof result.results.structured_conclusion === "string"
                            ? result.results.structured_conclusion
                            : String(result.results.structured_conclusion || "")
                          )
                            .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>")
                            .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-primary mb-4 mt-6">$1</h1>')
                            .replace(
                              /^## (.*$)/gm,
                              '<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h2>',
                            )
                            .replace(
                              /^### (.*$)/gm,
                              '<h3 class="text-base font-medium text-foreground mt-4 mb-2">$1</h3>',
                            )
                            .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
                            .replace(/^---$/gm, '<hr class="my-6 border-border">')
                            .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
                            .replace(
                              /^(?!<[h|l|p])(.*$)/gm,
                              '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>',
                            )
                            .replace(/<p class="mb-4 text-muted-foreground leading-relaxed"><\/p>/g, ""),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Performance Metrics */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <BarChart3 className="w-5 h-5" />
                      Métriques de Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{result.results.presence_score}</div>
                        <div className="text-xs text-blue-700">Présence</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-green-600">{result.results.tone_score}</div>
                        <div className="text-xs text-green-700">Sentiment</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{result.results.coherence_score}</div>
                        <div className="text-xs text-purple-700">Cohérence</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Score global</span>
                        <span className="font-semibold text-blue-800">{globalScore}/100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Niveau de performance</span>
                        <span className="font-semibold text-blue-800">
                          {globalScore >= 80
                            ? "Excellent"
                            : globalScore >= 60
                              ? "Bon"
                              : globalScore >= 40
                                ? "Moyen"
                                : "À améliorer"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Sentiment général</span>
                        <span className="font-semibold text-blue-800">{result.results.tone_label || "Neutre"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Details */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Target className="w-5 h-5" />
                      Détails de l'Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-green-700 mb-1">Sources analysées</div>
                        <div className="font-semibold text-green-800">
                          {result.results.sources?.length || 0} sources web
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-green-700 mb-1">Date d'analyse</div>
                        <div className="font-semibold text-green-800">
                          {new Date(result.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-green-700 mb-1">Langue d'analyse</div>
                        <div className="font-semibold text-green-800">{getLanguageLabel(result.language)}</div>
                      </div>

                      <div>
                        <div className="text-sm text-green-700 mb-1">Popularité du résultat</div>
                        <div className="font-semibold text-green-800">
                          {result.view_count} consultation{result.view_count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations for shared results */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="w-5 h-5" />
                    Recommandations Basées sur cette Analyse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.results.presence_score < 70 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-red-800">Améliorer la visibilité en ligne</div>
                          <div className="text-sm text-red-700">
                            Cette marque pourrait bénéficier d'une stratégie SEO plus agressive
                          </div>
                        </div>
                      </div>
                    )}
                    {result.results.tone_score < 70 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-yellow-800">Optimiser l'image de marque</div>
                          <div className="text-sm text-yellow-700">
                            Le sentiment associé à cette marque pourrait être amélioré
                          </div>
                        </div>
                      </div>
                    )}
                    {result.results.coherence_score < 70 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-blue-800">Harmoniser la communication</div>
                          <div className="text-sm text-blue-700">
                            Le message de cette marque manque de cohérence sur le web
                          </div>
                        </div>
                      </div>
                    )}
                    {globalScore >= 70 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-green-800">Excellente performance</div>
                          <div className="text-sm text-green-700">
                            Cette marque a une très bonne présence digitale à maintenir
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Sources */}
      {result.results.sources && result.results.sources.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Sources analysées</h3>
          <div className="grid gap-3">
            {result.results.sources.map((source: any, index: number) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium line-clamp-2 block"
                      >
                        {source.title}
                      </a>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{new URL(source.link).hostname}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center space-y-4 pt-8 border-t">
        <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border">
          <h4 className="font-bold text-primary mb-2">Vous voulez analyser votre propre présence digitale ?</h4>
          <p className="text-muted-foreground mb-4">
            Découvrez comment votre marque est perçue en ligne avec notre outil d'analyse SEO gratuit.
          </p>
          <Button asChild size="lg">
            <Link href="/">Faire mon analyse gratuite</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Analyse partagée • Powered by Quintilian</p>
      </div>
    </div>
  )
}
