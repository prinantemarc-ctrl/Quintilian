"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold mb-8">Legal Notice</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Publisher Information</h2>
              <p>
                <strong>MAK-IA</strong>
              </p>
              <p>Company address information</p>
              <p>Email: contact@mak-ia.com</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Hosting Information</h2>
              <p>Hosting details and provider information</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
              <p>All content on this site is protected by intellectual property rights.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Liability</h2>
              <p>Liability disclaimer content</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
