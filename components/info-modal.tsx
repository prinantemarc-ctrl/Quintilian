"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Heart, Target } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t("info.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  {t("info.presence_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("info.presence_desc")}</p>
                <ul className="text-sm space-y-1">
                  <li>• {t("info.presence_item1")}</li>
                  <li>• {t("info.presence_item2")}</li>
                  <li>• {t("info.presence_item3")}</li>
                  <li>• {t("info.presence_item4")}</li>
                  <li>• {t("info.presence_item5")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  {t("info.tone_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("info.tone_desc")}</p>
                <ul className="text-sm space-y-1">
                  <li>• {t("info.tone_item1")}</li>
                  <li>• {t("info.tone_item2")}</li>
                  <li>• {t("info.tone_item3")}</li>
                  <li>• {t("info.tone_item4")}</li>
                  <li>• {t("info.tone_item5")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t("info.coherence_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("info.coherence_desc")}</p>
                <ul className="text-sm space-y-1">
                  <li>• {t("info.coherence_item1")}</li>
                  <li>• {t("info.coherence_item2")}</li>
                  <li>• {t("info.coherence_item3")}</li>
                  <li>• {t("info.coherence_item4")}</li>
                  <li>• {t("info.coherence_item5")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">{t("info.scale_title")}</h3>
                <div className="flex justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span>{t("info.excellent")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>{t("info.good")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span>{t("info.improve")}</span>
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
