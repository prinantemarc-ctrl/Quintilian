"use client"

import { CreditDisplay } from "@/components/credits/credit-display"
import { CreditPackages } from "@/components/stripe/credit-packages"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Sparkles, Info } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function CreditsPage() {
  const [paymentStatus, setPaymentStatus] = useState<"success" | "canceled" | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      setPaymentStatus("success")
      setTimeout(() => {
        router.replace("/dashboard/credits")
        setPaymentStatus(null)
      }, 5000)
    } else if (canceled === "true") {
      setPaymentStatus("canceled")
      setTimeout(() => {
        router.replace("/dashboard/credits")
        setPaymentStatus(null)
      }, 5000)
    }
  }, [searchParams, router])

  return (
    <div className="space-y-6">
      {paymentStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Credits have been added to your account.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "canceled" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">Payment canceled. You can try again anytime.</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold text-foreground">Credits</h1>
        <p className="text-muted-foreground">Manage your search credits</p>
      </div>

      <Alert className="border-violet-200 bg-violet-50">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <AlertDescription className="text-violet-800">
          <strong>Test Mode:</strong> You have 5 free searches per month. Purchase credits to unlock unlimited access.
        </AlertDescription>
      </Alert>

      <CreditDisplay />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Get More Credits
          </CardTitle>
          <CardDescription>Purchase credits to continue using MAK-IA after your free searches</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditPackages />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Credits Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Free Test Period</h4>
              <p className="text-sm text-muted-foreground">You get 5 free searches per month to test MAK-IA.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Credits Usage</h4>
              <p className="text-sm text-muted-foreground">Each AI analysis consumes 1 credit. Credits never expire.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Volume Discounts</h4>
              <p className="text-sm text-muted-foreground">The more credits you purchase, the lower the unit price.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground">Contact support for questions about your credits.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
