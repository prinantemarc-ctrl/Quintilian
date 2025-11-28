"use client"

import Link from "next/link"
import { BarChart3, Swords } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsive grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">MAK-IA</h3>
            <p className="text-sm opacity-90">
              Your digital intelligence tool to measure and compare your online reputation.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Our Analyses</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/analyze"
                  className="opacity-90 hover:opacity-100 transition-opacity flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Reputation Audit
                </Link>
              </li>
              <li>
                <Link href="/duel" className="opacity-90 hover:opacity-100 transition-opacity flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Confrontation Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/mentions" className="opacity-90 hover:opacity-100 transition-opacity">
                  Legal Notices
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="opacity-90 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="opacity-90 hover:opacity-100 transition-opacity">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="text-sm space-y-2">
              <p>
                <a href="mailto:contact@mak-ia.com" className="opacity-90 hover:opacity-100 transition-opacity">
                  contact@mak-ia.com
                </a>
              </p>
              <p className="opacity-90">24/7 support available</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm opacity-90">© 2025 MAK-IA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
