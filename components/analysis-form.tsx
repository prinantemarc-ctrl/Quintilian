"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, MessageSquare, Globe } from "lucide-react"
import { AnalysisAdapter } from "@/components/dialog-fit/analysis-adapter"

export function AnalysisForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    language: "",
  })

  const languageOptions = [
    { value: "fr", label: "French", icon: <span>🇫🇷</span> },
    { value: "en", label: "English", icon: <span>🇺🇸</span> },
    { value: "es", label: "Spanish", icon: <span>🇪🇸</span> },
    { value: "de", label: "German", icon: <span>🇩🇪</span> },
    { value: "it", label: "Italian", icon: <span>🇮🇹</span> },
    { value: "pt", label: "Portuguese", icon: <span>🇵🇹</span> },
    { value: "nl", label: "Dutch", icon: <span>🇳🇱</span> },
    { value: "ru", label: "Russian", icon: <span>🇷🇺</span> },
    { value: "zh", label: "Chinese", icon: <span>🇨🇳</span> },
    { value: "ja", label: "Japanese", icon: <span>🇯🇵</span> },
    { value: "ar", label: "Arabic", icon: <span>🇸🇦</span> },
    { value: "hi", label: "Hindi", icon: <span>🇮🇳</span> },
    { value: "ko", label: "Korean", icon: <span>🇰🇷</span> },
    { value: "sv", label: "Swedish", icon: <span>🇸🇪</span> },
    { value: "no", label: "Norwegian", icon: <span>🇳🇴</span> },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsAnalyzing(true)
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Start Your Analysis</CardTitle>
          <CardDescription>Enter your search query to analyze online presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Search Query
              </Label>
              <Input
                id="name"
                placeholder="Enter a name, brand, or topic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-primary/30 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Additional Context (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Add any specific context or details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="border-primary/30 focus:border-primary min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Search Language
              </Label>
              <SimpleSelect
                options={languageOptions}
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                placeholder="Select language zone"
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              disabled={isAnalyzing || !formData.name.trim()}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Now"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnalysisAdapter
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchTerm={formData.name}
        message={formData.message}
        language={formData.language}
      />
    </>
  )
}
