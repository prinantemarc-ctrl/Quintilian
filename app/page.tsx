import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { DuelCTASection } from "@/components/duel-cta-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { ExampleSection } from "@/components/example-section"
import { CTASection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DuelCTASection />
        <UseCasesSection />
        <ExampleSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
