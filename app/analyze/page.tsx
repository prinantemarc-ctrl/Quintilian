import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalysisForm } from "@/components/analysis-form"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Analysez votre réputation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Découvrez en un instant comment Google et l'IA perçoivent votre nom ou votre marque : visibilité, tonalité
            et cohérence.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnalysisForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
