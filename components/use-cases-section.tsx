"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Newspaper, User, Megaphone } from "lucide-react"

export function UseCasesSection() {
  const useCases = [
    {
      icon: Building2,
      title: "Companies",
      description: "Monitor and optimize your online reputation to attract customers and partners.",
    },
    {
      icon: Newspaper,
      title: "Media",
      description: "Analyze your visibility and impact in the digital information ecosystem.",
    },
    {
      icon: User,
      title: "Individuals",
      description: "Control your personal digital footprint for career and networking purposes.",
    },
    {
      icon: Megaphone,
      title: "Agencies",
      description: "Offer advanced reputation analysis services to your clients.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">Who is Quintilian For?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tailored solutions for every digital presence challenge
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-3">
                  <useCase.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-pretty">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
