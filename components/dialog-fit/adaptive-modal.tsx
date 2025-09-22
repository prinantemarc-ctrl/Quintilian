"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Maximize2, Minimize2, Copy, Share2, Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export type DialogFitSize = "sm" | "md" | "lg" | "xl" | "fullscreen"

export interface DialogFitContent {
  title: string
  content?: string
  tabs?: {
    id: string
    label: string
    content: string
  }[]
  metadata?: {
    processingTime?: number
    totalResults?: number
    query?: string
  }
}

export interface DialogFitProps {
  isOpen: boolean
  onClose: () => void
  content: DialogFitContent
  variant?: DialogFitSize
  autoSize?: boolean
  showToolbar?: boolean
  showProgress?: boolean
  allowFullscreen?: boolean
  navigation?: {
    onPrevious?: () => void
    onNext?: () => void
    hasPrevious?: boolean
    hasNext?: boolean
  }
  loading?: boolean
  error?: string
  className?: string
}

function useAdaptiveSize(content: DialogFitContent, autoSize = true): DialogFitSize {
  const [size, setSize] = useState<DialogFitSize>("md")

  useEffect(() => {
    if (!autoSize) return

    const totalContent = [content.content || "", ...(content.tabs?.map((tab) => tab.content) || [])].join(" ")

    const wordCount = totalContent.split(/\s+/).length
    const hasTabsOrTables = content.tabs && content.tabs.length > 0

    if (wordCount > 800 || hasTabsOrTables) {
      setSize("xl")
    } else if (wordCount > 350) {
      setSize("lg")
    } else {
      setSize("md")
    }
  }, [content, autoSize])

  return size
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const element = contentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight

      if (scrollHeight > 0) {
        const progressValue = (scrollTop / scrollHeight) * 100
        setProgress(Math.min(100, Math.max(0, progressValue)))
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
      return () => element.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return { progress, contentRef }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

export function AdaptiveModal({
  isOpen,
  onClose,
  content,
  variant,
  autoSize = true,
  showToolbar = true,
  showProgress = true,
  allowFullscreen = true,
  navigation,
  loading = false,
  error,
  className,
}: DialogFitProps) {
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const adaptiveSize = useAdaptiveSize(content, autoSize)
  const finalSize = variant || adaptiveSize
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState(content.tabs?.[0]?.id || "")
  const { progress, contentRef } = useReadingProgress()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "f":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setIsFullscreen(!isFullscreen)
          }
          break
        case "ArrowLeft":
          if (e.altKey && navigation?.onPrevious && navigation.hasPrevious) {
            e.preventDefault()
            navigation.onPrevious()
          }
          break
        case "ArrowRight":
          if (e.altKey && navigation?.onNext && navigation.hasNext) {
            e.preventDefault()
            navigation.onNext()
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isFullscreen, navigation, onClose])

  const handleCopy = useCallback(async () => {
    const textToCopy = content.tabs
      ? content.tabs.map((tab) => `${tab.label}:\n${tab.content}`).join("\n\n")
      : content.content || ""

    try {
      await navigator.clipboard.writeText(textToCopy)
      // TODO: Ajouter une notification toast
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [content])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.content?.substring(0, 200) + "...",
          url: window.location.href,
        })
      } catch (err) {
        console.error("Failed to share:", err)
      }
    }
  }, [content])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const getSizeClasses = (size: DialogFitSize, fullscreen: boolean) => {
    if (fullscreen) {
      return "max-w-screen-2xl w-[98vw] h-[95vh]"
    }

    switch (size) {
      case "sm":
        return "max-w-md w-[90vw] max-h-[70vh]"
      case "md":
        return "max-w-2xl w-[90vw] max-h-[80vh]"
      case "lg":
        return "max-w-4xl w-[95vw] max-h-[85vh]"
      case "xl":
        return "max-w-6xl w-[98vw] max-h-[90vh]"
      case "fullscreen":
        return "max-w-screen-2xl w-[98vw] h-[95vh]"
      default:
        return "max-w-2xl w-[90vw] max-h-[80vh]"
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Chargement en cours...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Erreur</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )
    }

    if (content.tabs && content.tabs.length > 0) {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {content.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {content.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{
                    maxWidth: "75ch",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: tab.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/### (.*?)$/gm, '<h4 class="font-semibold mt-4 mb-2">$1</h4>')
                      .replace(/## (.*?)$/gm, '<h3 class="font-bold mt-5 mb-3">$1</h3>')
                      .replace(/# (.*?)$/gm, '<h2 class="font-bold text-lg mt-6 mb-3">$1</h2>')
                      .replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )
    }

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div
          className="whitespace-pre-wrap leading-relaxed"
          style={{
            maxWidth: "75ch",
            lineHeight: "1.6",
          }}
          dangerouslySetInnerHTML={{
            __html: (content.content || "")
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/### (.*?)$/gm, '<h4 class="font-semibold mt-4 mb-2">$1</h4>')
              .replace(/## (.*?)$/gm, '<h3 class="font-bold mt-5 mb-3">$1</h3>')
              .replace(/# (.*?)$/gm, '<h2 class="font-bold text-lg mt-6 mb-3">$1</h2>')
              .replace(/\n/g, "<br>"),
          }}
        />
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="text-left">{content.title}</SheetTitle>
            {showProgress && progress > 0 && <Progress value={progress} className="h-1 mt-2" />}
          </SheetHeader>

          {showToolbar && (
            <div className="flex items-center justify-between py-2 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                {navigation?.hasPrevious && (
                  <Button variant="ghost" size="sm" onClick={navigation.onPrevious}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                {navigation?.hasNext && (
                  <Button variant="ghost" size="sm" onClick={navigation.onNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 px-1" ref={contentRef}>
            <div className="py-4">{renderContent()}</div>
          </ScrollArea>

          {content.metadata && (
            <div className="flex-shrink-0 pt-2 border-t text-xs text-muted-foreground text-center">
              {content.metadata.processingTime && <span>Traité en {content.metadata.processingTime}ms</span>}
              {content.metadata.totalResults && (
                <span className="ml-2">• {content.metadata.totalResults} résultats</span>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(getSizeClasses(finalSize, isFullscreen), "flex flex-col gap-0 p-0", className)}
        showCloseButton={false}
      >
        {/* Header sticky */}
        <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-xl font-semibold leading-tight">{content.title}</DialogTitle>
                {content.metadata?.query && (
                  <p className="text-sm text-muted-foreground mt-1">Recherche : "{content.metadata.query}"</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {allowFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 p-0"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {showProgress && progress > 0 && <Progress value={progress} className="h-1 mx-6" />}

          {showToolbar && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                {navigation?.hasPrevious && (
                  <Button variant="ghost" size="sm" onClick={navigation.onPrevious} className="h-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>
                )}
                {navigation?.hasNext && (
                  <Button variant="ghost" size="sm" onClick={navigation.onNext} className="h-8">
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="h-8">
                  <Share2 className="w-4 h-4 mr-1" />
                  Partager
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="h-8">
                  <Printer className="w-4 h-4 mr-1" />
                  Imprimer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Body scrollable */}
        <ScrollArea className="flex-1 min-h-0" ref={contentRef}>
          <div className="p-6 pt-4">{renderContent()}</div>
        </ScrollArea>

        {/* Footer sticky */}
        {content.metadata && (
          <div className="flex-shrink-0 border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {content.metadata.processingTime && <span>Traité en {content.metadata.processingTime}ms</span>}
                {content.metadata.totalResults && <span>{content.metadata.totalResults} résultats analysés</span>}
              </div>
              <Badge variant="outline" className="text-xs">
                DialogFit v1.0
              </Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
