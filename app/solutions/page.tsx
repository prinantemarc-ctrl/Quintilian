"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, BarChart3, CheckCircle, ArrowRight, Target, TrendingUp, Globe, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"

export default function QuintilianSolutionsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/solutions" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground px-3 py-2 rounded-xl font-bold text-lg shadow-lg">
                    QS
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    {t("solutions.page_title")}
                  </span>
                  <span className="text-xs text-muted-foreground -mt-0.5 font-medium">
                    {t("solutions.page_subtitle")}
                  </span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#solutions"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200"
              >
                {t("solutions.nav_solutions")}
              </Link>
              <Link
                href="#methode"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200"
              >
                {t("solutions.nav_method")}
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200"
              >
                {t("solutions.nav_contact")}
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <LanguageSelector />
              <Link href="/#contact">
                <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold">
                  {t("solutions.demo_button")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance">{t("solutions.hero_main_title")}</h1>
              <p className="text-xl text-muted-foreground text-pretty">{t("solutions.hero_main_desc")}</p>
              <Link href="/#contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                >
                  {t("solutions.discover_button")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t("solutions.dashboard_title")}</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">94</div>
                      <div className="text-xs text-muted-foreground">SEO Score</div>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">87</div>
                      <div className="text-xs text-muted-foreground">IA Analysis</div>
                    </div>
                    <div className="bg-secondary/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-secondary">92</div>
                      <div className="text-xs text-muted-foreground">Reputation</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-lg flex items-end justify-around p-2">
                    <div className="w-4 bg-primary rounded-t h-16"></div>
                    <div className="w-4 bg-accent rounded-t h-24"></div>
                    <div className="w-4 bg-secondary rounded-t h-20"></div>
                    <div className="w-4 bg-primary rounded-t h-28"></div>
                    <div className="w-4 bg-accent rounded-t h-18"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("solutions.our_solutions")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t("solutions.systemic_approach")}
            </p>
          </div>

          <div className="mb-12">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/40 transition-colors group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {t("solutions.dashboard_analytics_title")}
                    </CardTitle>
                    <p className="text-muted-foreground text-lg">{t("solutions.dashboard_analytics_desc")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">{t("solutions.essential_metrics")}</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.ai_presence")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.seo_presence")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.press_impact")}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">{t("solutions.behavioral_analysis")}</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.social_presence")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.sentiment")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{t("solutions.message_coherence")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary font-medium">{t("solutions.monitoring_247")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4 mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-balance">{t("solutions.four_modules_title")}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t("solutions.four_modules_desc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Module H - Duplication Instantanée */}
            <Card className="border-2 hover:border-primary/20 transition-colors group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{t("solutions.module_h_title")}</CardTitle>
                    <p className="text-muted-foreground">{t("solutions.module_h_desc")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_h_feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_h_feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_h_feature3")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_h_feature4")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module A - Défense Sociale */}
            <Card className="border-2 hover:border-primary/20 transition-colors group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{t("solutions.module_a_title")}</CardTitle>
                    <p className="text-muted-foreground">{t("solutions.module_a_desc")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_a_feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_a_feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_a_feature3")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_a_feature4")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module C - Autorité Premium */}
            <Card className="border-2 hover:border-primary/20 transition-colors group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{t("solutions.module_c_title")}</CardTitle>
                    <p className="text-muted-foreground">{t("solutions.module_c_desc")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_c_feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_c_feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_c_feature3")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_c_feature4")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Module P - Sur Mesure */}
            <Card className="border-2 hover:border-primary/20 transition-colors group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{t("solutions.module_p_title")}</CardTitle>
                    <p className="text-muted-foreground">{t("solutions.module_p_desc")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_p_feature1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_p_feature2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_p_feature3")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{t("solutions.module_p_feature4")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="methode" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{t("solutions.why_us_title")}</h2>
                <p className="text-xl text-muted-foreground text-pretty">{t("solutions.why_us_desc")}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("solutions.increased_visibility")}</h3>
                    <p className="text-muted-foreground">{t("solutions.increased_visibility_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("solutions.controlled_reputation")}</h3>
                    <p className="text-muted-foreground">{t("solutions.controlled_reputation_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("solutions.measurable_influence")}</h3>
                    <p className="text-muted-foreground">{t("solutions.measurable_influence_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl transform rotate-6"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-xl transform -rotate-3"></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <TrendingUp className="w-16 h-16 text-primary mx-auto" />
                      <p className="font-semibold text-lg">{t("solutions.digital_strategy")}</p>
                      <p className="text-sm text-muted-foreground">{t("solutions.approach_360")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-balance">{t("solutions.final_cta_title")}</h2>
            <p className="text-xl text-white/90 text-pretty">{t("solutions.final_cta_desc")}</p>
            <Link href="/analyze">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
              >
                {t("solutions.take_contact")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground px-3 py-2 rounded-xl font-bold text-lg shadow-lg">
                  QS
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t("solutions.page_title")}
              </span>
            </div>

            <nav className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/legal/mentions" className="hover:text-primary transition-colors">
                {t("solutions.footer_legal")}
              </Link>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                {t("solutions.footer_privacy")}
              </Link>
              <Link href="#contact" className="hover:text-primary transition-colors">
                {t("solutions.footer_contact")}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
