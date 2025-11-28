"use client"

import { Button } from "@/components/ui/button"
import { Swords, ArrowRight } from "lucide-react"
import Link from "next/link"

export function DuelAnnouncement() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-center flex-wrap">
          <Swords className="h-6 w-6 text-white/90" />
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-lg font-bold mb-1">Confrontation Mode Available</h3>
            <p className="text-sm opacity-90">
              Compare your reputation to your competitors and identify your competitive advantages.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
          >
            <Link href="/duel">
              Start confrontation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
