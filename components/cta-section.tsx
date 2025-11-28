"use client"

import { Button } from "@/components/ui/button"

export function CTASection() {
  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">
              Ready to Take Control of Your Digital Reputation?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto text-pretty">
              Start your free analysis now and discover how you're perceived online
            </p>
          </div>

          <Button
            onClick={scrollToHero}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 h-auto"
          >
            Start Free Analysis
          </Button>
        </div>
      </div>
    </section>
  )
}
