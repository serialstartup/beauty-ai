"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Lock } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface SubscriptionGateProps {
  businessName?: string
}

export function SubscriptionGate({ businessName }: SubscriptionGateProps) {
  const { t } = useLanguage()
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>

        <h2 className="text-xl font-bold text-foreground">
          {businessName ? `${businessName} —` : ""} {t("gate.trialEnded")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("gate.desc")}
        </p>

        <div className="mt-6 space-y-2.5 text-left">
          {[
            "AI Receptionist (WhatsApp + Instagram)",
            "Unlimited automated conversations",
            "Appointment booking automation",
            "CRM, campaigns & analytics",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? t("gate.opening") : t("gate.subscribeToPro")}
        </button>

        <p className="mt-3 text-xs text-muted-foreground">
          {t("gate.securePayment")}
        </p>
      </div>
    </div>
  )
}
