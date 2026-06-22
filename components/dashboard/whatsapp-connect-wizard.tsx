"use client"

import { useState } from "react"
import {
  MessageCircle,
  X,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Clock,
  CalendarCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"

interface WhatsAppConnectWizardProps {
  onClose: () => void
  onSuccess: (displayPhone: string) => void
}

type Step = "welcome" | "guide" | "credentials" | "success"

export function WhatsAppConnectWizard({ onClose, onSuccess }: WhatsAppConnectWizardProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>("welcome")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedPhone, setConnectedPhone] = useState("")

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/integrations/whatsapp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: phoneNumberId, access_token: accessToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Connection failed. Check your credentials.")
        return
      }

      const display = data.display_phone_number || phoneNumberId
      setConnectedPhone(display)
      setStep("success")
      onSuccess(display)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl">
        {step !== "success" && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {step !== "success" && (
          <div className="flex gap-1.5 px-6 pt-5">
            {(["welcome", "guide", "credentials"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  step === s
                    ? "bg-[#25D366]"
                    : ["welcome", "guide", "credentials"].indexOf(step) > i
                    ? "bg-[#25D366]/60"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === "welcome" && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366]/10">
              <MessageCircle className="h-8 w-8 text-[#25D366]" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t("wizard.welcome.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("wizard.welcome.subtitle")}</p>

            <div className="mt-8 space-y-3 text-left">
              {[
                { icon: Zap, labelKey: "wizard.welcome.instantAI", descKey: "wizard.welcome.instantAIDesc" },
                { icon: CalendarCheck, labelKey: "wizard.welcome.autoBooking", descKey: "wizard.welcome.autoBookingDesc" },
                { icon: Clock, labelKey: "wizard.welcome.availability", descKey: "wizard.welcome.availabilityDesc" },
              ].map(({ icon: Icon, labelKey, descKey }) => (
                <div key={labelKey} className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10">
                    <Icon className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(labelKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("guide")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#25D366]/90"
            >
              {t("wizard.welcome.getStarted")} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Guide */}
        {step === "guide" && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-foreground">{t("wizard.guide.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("wizard.guide.subtitle")}</p>

            <div className="mt-6 space-y-4">
              {[
                { num: "1", titleKey: "wizard.guide.step1Title", descKey: "wizard.guide.step1Desc" },
                { num: "2", titleKey: "wizard.guide.step2Title", descKey: "wizard.guide.step2Desc" },
                { num: "3", titleKey: "wizard.guide.step3Title", descKey: "wizard.guide.step3Desc" },
              ].map(({ num, titleKey, descKey }) => (
                <div key={num} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(titleKey)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("wizard.guide.openPortal")} <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={() => setStep("credentials")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t("wizard.guide.iHaveCredentials")} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 3: Credentials */}
        {step === "credentials" && (
          <form onSubmit={handleConnect} className="p-8">
            <h2 className="text-xl font-bold text-foreground">{t("wizard.credentials.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("wizard.credentials.subtitle")}</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("wizard.credentials.phoneNumberId")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("wizard.credentials.accessToken")}
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showToken ? "text" : "password"}
                    placeholder="EAAxxxxx..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#25D366]/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("wizard.credentials.testing")}
                </>
              ) : (
                <>
                  {t("wizard.credentials.testAndConnect")} <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("guide")}
              className="mt-2 w-full rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("wizard.credentials.back")}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366]/10">
              <CheckCircle2 className="h-8 w-8 text-[#25D366]" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t("wizard.success.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("wizard.success.subtitle")}{" "}
              <strong className="text-foreground">{connectedPhone}</strong>.
            </p>

            <div className="mt-6 rounded-xl bg-[#25D366]/10 p-4 text-left">
              <p className="text-sm font-semibold text-[#25D366]">{t("wizard.success.whatNext")}</p>
              <ul className="mt-2 space-y-1.5">
                {[
                  t("wizard.success.incomingAnswered"),
                  t("wizard.success.bookViaChat"),
                  t("wizard.success.manualTakeover"),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-foreground/70">
                    <span className="h-1 w-1 rounded-full bg-[#25D366]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onClose}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t("wizard.success.goToDashboard")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
