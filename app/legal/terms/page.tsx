"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Acceptance</h2>
              <p>By using this service, you accept these terms</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Service Description</h2>
              <p>Description of the services provided</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">User Obligations</h2>
              <p>What users must agree to when using the service</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Service Availability</h2>
              <p>Information about service uptime and availability</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Modifications</h2>
              <p>We reserve the right to modify these terms</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
