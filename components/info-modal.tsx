"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Heart, Target } from "lucide-react"

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Analysis Methodology</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Digital Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Measure your online visibility and reach</p>
                <ul className="text-sm space-y-1">
                  <li>• Number of indexed sources</li>
                  <li>• Website authority</li>
                  <li>• Social media presence</li>
                  <li>• Search ranking</li>
                  <li>• Brand mentions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Understand how people perceive your brand</p>
                <ul className="text-sm space-y-1">
                  <li>• Positive mentions analysis</li>
                  <li>• Negative feedback detection</li>
                  <li>• Neutral content identification</li>
                  <li>• Overall sentiment score</li>
                  <li>• Tone consistency</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Coherence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Ensure message consistency across channels</p>
                <ul className="text-sm space-y-1">
                  <li>• Brand message alignment</li>
                  <li>• Cross-channel consistency</li>
                  <li>• Content quality assessment</li>
                  <li>• Value proposition clarity</li>
                  <li>• Communication effectiveness</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Score Scale</h3>
                <div className="flex justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span>Excellent (80-100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Good (60-79)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span>Needs improvement (0-59)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
