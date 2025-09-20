import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ExampleSection } from "@/components/example-section"
import { CTASection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { DuelAnnouncement } from "@/components/duel-announcement"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <DuelAnnouncement />
        <FeaturesSection />
        <ExampleSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
