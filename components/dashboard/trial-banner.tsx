"use client"

import { useState } from "react"
import { AlertTriangle, Clock, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrialBannerProps {
  subscriptionStatus: string
  trialDaysLeft: number
}

export function TrialBanner({ subscriptionStatus, trialDaysLeft }: TrialBannerProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  if (subscriptionStatus === "active") return null

  const isUrgent = subscriptionStatus === "trialing" && trialDaysLeft <= 3
  const isPastDue = subscriptionStatus === "past_due"

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium",
        isPastDue
          ? "bg-destructive text-destructive-foreground"
          : isUrgent
            ? "bg-amber-500 text-white"
            : "bg-primary text-primary-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        {isPastDue ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <Clock className="h-4 w-4 shrink-0" />
        )}
        {isPastDue ? (
          <span>Payment failed — your subscription is paused. Update your payment method to restore access.</span>
        ) : (
          <span>
            Free Trial —{" "}
            <strong>
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
            </strong>
            . Subscribe to keep your AI receptionist active after the trial.
          </span>
        )}
      </div>

      <button
        onClick={isPastDue ? handlePortal : handleCheckout}
        disabled={loading}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all",
          isPastDue
            ? "bg-white text-destructive hover:bg-white/90"
            : isUrgent
              ? "bg-white text-amber-600 hover:bg-white/90"
              : "bg-white/20 hover:bg-white/30 text-white"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CreditCard className="h-3.5 w-3.5" />
        )}
        {isPastDue ? "Update Payment" : "Subscribe to Pro"}
      </button>
    </div>
  )
}
