"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Lock, ArrowRight, CreditCard } from "lucide-react"
import { registerFreeTestAction, createRazorpayOrderAction, verifyPaymentAndRegisterAction } from "@/actions/registration-actions"

declare global {
  interface Window {
    Razorpay?: any
  }
}

export function TestRegistrationButton({
  testSeriesId,
  isFree,
  priceInRupees,
  isRegistered,
  isSignedIn,
}: {
  testSeriesId: string
  isFree: boolean
  priceInRupees: number
  isRegistered: boolean
  isSignedIn: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isSignedIn) {
    return (
      <Button
        onClick={() => router.push(`/signin?callbackUrl=/tests/${testSeriesId}`)}
        className="w-full bg-primary hover:bg-hover-accent text-primary-foreground font-semibold text-sm h-12 rounded-xl"
      >
        Sign In to Register
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-chart-3/30 bg-chart-3/10 p-3.5 text-xs font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-3" />
          <span>You have active access to this test series.</span>
        </div>
        <Button
          onClick={() => router.push(`/student/tests/${testSeriesId}`)}
          className="w-full bg-primary hover:bg-hover-accent text-primary-foreground font-semibold text-sm h-12 rounded-xl"
        >
          Go To Test
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  async function handleFreeRegistration() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerFreeTestAction(testSeriesId)
      if (!result.success) {
        setError(result.error || "Failed to register.")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Registered successfully!")
      setLoading(false)
      setTimeout(() => {
        router.push(`/student/tests/${testSeriesId}`)
        router.refresh()
      }, 1200)
    } catch {
      setError("An unexpected error occurred during registration.")
      setLoading(false)
    }
  }

  async function handlePaidCheckout() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const orderResult = await createRazorpayOrderAction(testSeriesId)
      if (!orderResult.success || !orderResult.data) {
        setError(orderResult.error || "Failed to generate payment order.")
        setLoading(false)
        return
      }

      const { orderId, amount, currency, keyId, testTitle } = orderResult.data

      // If Razorpay SDK is loaded in browser
      if (typeof window !== "undefined" && window.Razorpay && keyId && !keyId.includes("placeholder")) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "Verityra",
          description: testTitle,
          order_id: orderId,
          handler: async function (response: any) {
            const verifyResult = await verifyPaymentAndRegisterAction({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              testSeriesId,
            })

            if (verifyResult.success) {
              setSuccess("Payment successful! Access granted.")
              setTimeout(() => {
                router.push(`/student/tests/${testSeriesId}`)
                router.refresh()
              }, 1200)
            } else {
              setError(verifyResult.error || "Payment verification failed.")
            }
          },
          theme: {
            color: "#2A6AED",
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
      } else if (orderId.startsWith("order_dev_mock_") || keyId.includes("placeholder")) {
        // Development-only simulation for explicitly marked mock orders.
        const verifyResult = await verifyPaymentAndRegisterAction({
          razorpayOrderId: orderId,
          razorpayPaymentId: "pay_simulated_" + Date.now(),
          razorpaySignature: "sig_simulated_" + Date.now(),
          testSeriesId,
        })

        if (verifyResult.success) {
          setSuccess("Payment verified in development mode! Access unlocked.")
          setTimeout(() => {
            router.push(`/student/tests/${testSeriesId}`)
            router.refresh()
          }, 1200)
        } else {
          setError(verifyResult.error || "Payment failed.")
        }
        setLoading(false)
      } else {
        setError("Razorpay Checkout could not load. Please refresh the page and try again.")
        setLoading(false)
      }
    } catch {
      setError("An error occurred during payment processing.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-3 text-sm rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-xl border-chart-3/50 bg-chart-3/10 py-3 text-sm text-foreground">
          <CheckCircle2 className="mr-2 h-4 w-4 text-chart-3" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isFree ? (
        <Button
          onClick={handleFreeRegistration}
          disabled={loading}
          className="w-full bg-primary hover:bg-hover-accent text-primary-foreground font-semibold text-sm h-12 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Register for Free Test
        </Button>
      ) : (
        <Button
          onClick={handlePaidCheckout}
          disabled={loading}
          className="w-full bg-primary hover:bg-hover-accent text-primary-foreground font-semibold text-sm h-12 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-1" />
          )}
          Unlock Test Series — ₹{priceInRupees}
        </Button>
      )}
    </div>
  )
}
