"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
} from "lucide-react"
import {
  registerFreeTestAction,
  createRazorpayOrderAction,
  verifyPaymentAndRegisterAction,
} from "@/actions/registration-actions"
import { BRAND_CONFIG } from "@/lib/brand"

declare global {
  interface Window {
    Razorpay?: any
  }
}

const SCRIPT_LOAD_TIMEOUT_MS = 6000

function appendFreshScript(onComplete: (success: boolean) => void) {
  try {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => onComplete(true)
    script.onerror = () => {
      script.setAttribute("data-failed", "true")
      onComplete(false)
    }
    document.body.appendChild(script)
  } catch {
    onComplete(false)
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).Razorpay) {
    return Promise.resolve(true)
  }
  if (typeof document === "undefined") {
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: boolean) => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve(result)
      }
    }

    const timer = setTimeout(() => {
      finish(Boolean((window as any).Razorpay))
    }, SCRIPT_LOAD_TIMEOUT_MS)

    const existing = document.querySelector(
      'script[src*="checkout.razorpay.com"]'
    )
    if (existing) {
      if ((window as any).Razorpay) {
        finish(true)
        return
      }
      if (existing.getAttribute("data-failed") === "true") {
        existing.remove()
      } else {
        existing.addEventListener("load", () => finish(true), { once: true })
        existing.addEventListener(
          "error",
          () => {
            existing.setAttribute("data-failed", "true")
            existing.remove()
            appendFreshScript(finish)
          },
          { once: true }
        )
        return
      }
    }

    appendFreshScript(finish)
  })
}

export function TestRegistrationButton({
  testSeriesId,
  isFree,
  priceInRupees,
  isRegistered,
  isSignedIn,
  ctaLabel,
  freeCtaLabel,
  enrolledLabel,
}: {
  ctaLabel?: string
  freeCtaLabel?: string
  enrolledLabel?: string
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
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  function scheduleRedirect() {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    redirectTimerRef.current = setTimeout(() => {
      router.push(`/student/tests/${testSeriesId}`)
      router.refresh()
    }, 1200)
  }

  if (!isSignedIn) {
    return (
      <Button
        onClick={() =>
          router.push(`/signin?callbackUrl=/tests/${testSeriesId}`)
        }
        className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-hover-accent"
      >
        Sign In to Register
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 rounded-md border border-chart-3/30 bg-chart-3/10 p-3.5 text-xs font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-3" />
          <span>{enrolledLabel ?? "You have active access to this test series."}</span>
        </div>
        <Button
          onClick={() => router.push(`/student/tests/${testSeriesId}`)}
          className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-hover-accent"
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
      scheduleRedirect()
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

      const {
        orderId,
        amount,
        currency,
        keyId,
        testTitle,
        userName,
        userEmail,
        alreadyCompleted,
      } = orderResult.data

      setPendingOrderId(orderId)

      if (alreadyCompleted) {
        setSuccess(orderResult.message || "Payment verified! Access granted.")
        setLoading(false)
        scheduleRedirect()
        return
      }

      // Ensure Razorpay SDK is loaded in browser
      let hasRazorpay =
        typeof window !== "undefined" && Boolean(window.Razorpay)
      if (!hasRazorpay && typeof window !== "undefined") {
        hasRazorpay = await loadRazorpayScript()
      }

      if (
        hasRazorpay &&
        window.Razorpay &&
        keyId &&
        !keyId.includes("placeholder")
      ) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: BRAND_CONFIG.name,
          description: testTitle,
          order_id: orderId,
          prefill: {
            name: userName || "",
            email: userEmail || "",
          },
          modal: {
            ondismiss: () => {
              setLoading(false)
            },
          },
          handler: async function (response: any) {
            setLoading(true)
            const verifyResult = await verifyPaymentAndRegisterAction({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              testSeriesId,
            })

            if (verifyResult.success) {
              setSuccess("Payment successful! Access granted.")
              setLoading(false)
              scheduleRedirect()
              return
            }

            // Fallback recovery: query the server recovery endpoint before failing
            let recovered = false
            for (let attempt = 1; attempt <= 3; attempt++) {
              await new Promise((res) => setTimeout(res, 2000))
              try {
                const res = await fetch("/api/payments/verify-status", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: response.razorpay_order_id }),
                })
                const data = await res.json()
                if (data.completed || data.status === "COMPLETED") {
                  recovered = true
                  setSuccess("Payment verified! Access granted.")
                  setLoading(false)
                  scheduleRedirect()
                  break
                }
              } catch (pollErr) {
                console.warn("[Recovery Poll Error]", pollErr)
              }
            }

            if (!recovered) {
              setError(
                verifyResult.error ||
                  "Payment captured by gateway, but registration confirmation is taking longer than expected. Please click 'Check Payment Status' below."
              )
              setLoading(false)
            }
          },
          theme: {
            color: "#2A6AED",
          },
        }

        const rzp = new window.Razorpay(options)
        if (typeof rzp.on === "function") {
          rzp.on("payment.failed", (response: any) => {
            setError(
              response?.error?.description ||
                "Payment was declined or interrupted. Please try again or use another payment method."
            )
            setLoading(false)
          })
        }
        rzp.open()
      } else if (
        orderId.startsWith("order_dev_mock_") ||
        keyId.includes("placeholder")
      ) {
        // Development-only simulation for explicitly marked mock orders.
        const verifyResult = await verifyPaymentAndRegisterAction({
          razorpayOrderId: orderId,
          razorpayPaymentId: "pay_simulated_" + Date.now(),
          razorpaySignature: "sig_simulated_" + Date.now(),
          testSeriesId,
        })

        if (verifyResult.success) {
          setSuccess("Payment verified in development mode! Access unlocked.")
          scheduleRedirect()
        } else {
          setError(verifyResult.error || "Payment failed.")
        }
        setLoading(false)
      } else {
        setError(
          "Razorpay Checkout could not load. Please refresh the page and try again."
        )
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
        <Alert variant="destructive" className="rounded-md py-3 text-sm">
          <AlertDescription>
            {error}
            {pendingOrderId && (
              <div className="mt-2 pt-2 border-t border-destructive/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setLoading(true)
                    setError(null)
                    try {
                      const res = await fetch("/api/payments/verify-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: pendingOrderId }),
                      })
                      const data = await res.json()
                      if (data.completed || data.status === "COMPLETED") {
                        setSuccess("Payment verified! Access granted.")
                        scheduleRedirect()
                      } else {
                        setError(
                          data.error ||
                            "Payment is still being processed by the bank. Please retry in a moment."
                        )
                      }
                    } catch {
                      setError("Could not check payment status. Please refresh.")
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="h-8 text-xs font-medium"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : null}
                  Check Payment Status
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-md border-chart-3/50 bg-chart-3/10 py-3 text-sm text-foreground">
          <CheckCircle2 className="mr-2 h-4 w-4 text-chart-3" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isFree ? (
        <Button
          onClick={handleFreeRegistration}
          disabled={loading}
          className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-hover-accent"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {freeCtaLabel ?? "Register for Free Test"}
        </Button>
      ) : (
        <Button
          onClick={handlePaidCheckout}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-hover-accent"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-1 h-4 w-4" />
          )}
          {ctaLabel ?? `Unlock Test Series — ₹${priceInRupees}`}
        </Button>
      )}
    </div>
  )
}
