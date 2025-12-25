"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  MessageSquare,
  Shield,
  Target,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap,
  TrendingUp,
  Eye,
  Activity,
} from "lucide-react"
import Link from "next/link"

export default function RenseignementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">TAKE BACK CONTROL</h1>
              <p className="text-lg text-muted-foreground">
                Special operations to improve your presence, tone, and coherence scores.
              </p>
              <Link href="/#analysis-form">
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3">
                  Launch Operation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl p-8 border border-violet-500/30 shadow-2xl shadow-violet-500/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-500/10 rounded-lg border border-violet-500/20">
                      <Activity className="w-5 h-5 text-violet-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-wide">TACTICAL HQ</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500/60 animate-pulse delay-75" />
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500/30 animate-pulse delay-150" />
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* SEO Score Card */}
                  <div className="group relative bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl p-6 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-zinc-800"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.94)}`}
                            className="text-violet-500 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-black text-violet-500">94</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-violet-400 mb-1">SEO Score</div>
                        <div className="text-xs text-muted-foreground">Excellent visibility</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-300" />
                  </div>

                  {/* IA Analysis Card */}
                  <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-zinc-800"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.87)}`}
                            className="text-blue-500 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-black text-blue-500">87</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blue-400 mb-1">AI Analysis</div>
                        <div className="text-xs text-muted-foreground">Strong intelligence</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
                  </div>

                  {/* Reputation Card */}
                  <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-zinc-800"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.92)}`}
                            className="text-emerald-500 transition-all duration-1000"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-black text-emerald-500">92</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-emerald-400 mb-1">Reputation</div>
                        <div className="text-xs text-muted-foreground">Outstanding trust</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-300" />
                  </div>
                </div>

                {/* Activity Timeline - Modern bar chart */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Activity Timeline
                    </h4>
                    <span className="text-xs text-violet-500 font-medium">Last 7 days</span>
                  </div>
                  <div className="flex items-end justify-between gap-3 h-32">
                    {[70, 85, 60, 90, 75, 95, 80].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-gradient-to-t from-violet-500/80 via-violet-500/50 to-violet-500/20 rounded-t-lg relative overflow-hidden transition-all duration-500 hover:from-violet-400 hover:via-violet-400/50 hover:to-violet-400/20 cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">OUR WEAPONS</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A systematic approach to dominate your digital ecosystem and neutralize threats
            </p>
          </div>

          <Card className="border border-violet-500/20 bg-gradient-to-br from-zinc-900/50 to-background mb-16">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-violet-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-violet-500">Real-Time Tactical Dashboard</h3>
                  <p className="text-muted-foreground">Access your real-time reputation command center</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-sm font-semibold text-violet-500 uppercase tracking-wider mb-4">
                    Critical Metrics
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>AI Presence - Visibility in neural networks</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>SEO Presence - Google territory occupation</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Press Impact - Media coverage</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-violet-500 uppercase tracking-wider mb-4">
                    Behavioral Analysis
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Social Presence - Network strike force</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Sentiment - Tone and perception analysis</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span>Message Coherence - Narrative discipline</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 text-amber-500">
                <Zap className="w-4 h-4" />
                <span className="text-sm">24/7 monitoring with alerts and AI countermeasures</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">OUR 4 INTERVENTION MODULES</h2>
            <p className="text-lg text-muted-foreground">Operational solutions to transform digital reality</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border border-violet-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Globe className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module H - Mass Duplication</h3>
                    <p className="text-sm text-muted-foreground">
                      Lightning deployment of content on global network (103 countries, 35 languages)
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>GPT algorithm saturation</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Massive and immediate SEO impact</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Ghost site network</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Automated deployment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-violet-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module A - Social Iron Dome</h3>
                    <p className="text-sm text-muted-foreground">
                      Defense and promotion system on social networks (Focus X)
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Amplified social signal</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Real-time search influence</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Algorithmic manipulation</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Automated counterattack</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-violet-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module C - Legitimacy</h3>
                    <p className="text-sm text-muted-foreground">Authority site network for lasting anchoring</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Sustainable SEO</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Structural AI influence</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>High Authority Sites</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Institutional Credibility</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-violet-500/20 bg-gradient-to-br from-zinc-900/80 to-background">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Module P - Black Ops</h3>
                    <p className="text-sm text-muted-foreground">OSINT operators and advanced influence techniques</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Deep OSINT</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Psychological Warfare</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Targeted influence</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-muted-foreground/50" />
                    <span>Ghost Strategy</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight italic mb-4">WHY MAK-IA?</h2>
                <p className="text-lg text-muted-foreground">Intelligence expertise serving your reputation</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">VISUAL DOMINATION</h3>
                    <p className="text-muted-foreground">Total occupation of Google space</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">LOCKED REPUTATION</h3>
                    <p className="text-muted-foreground">Total control of the narrative</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide">MEASURABLE INFLUENCE</h3>
                    <p className="text-muted-foreground">Transparent ROI and tactical KPIs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-violet-500/20">
                <div className="flex flex-col items-center justify-center h-64">
                  <TrendingUp className="w-16 h-16 text-violet-500 mb-6" />
                  <h3 className="text-2xl font-bold text-foreground">Strategy</h3>
                  <p className="text-muted-foreground">360° Approach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
