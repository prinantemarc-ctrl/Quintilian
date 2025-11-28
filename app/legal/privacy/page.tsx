"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Collection</h2>
              <p>Information about what data we collect and how</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Usage</h2>
              <p>How we use your data</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cookies</h2>
              <p>Information about cookie usage</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p>User rights regarding their data</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p>Contact information for privacy concerns</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
