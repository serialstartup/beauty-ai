"use client"

import { TopBar } from "@/components/dashboard/top-bar"
import { cn } from "@/lib/utils"
import { Bot, Clock, MessageCircle, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { updateAISettings } from "@/app/(dashboard)/actions"
import { useLanguage } from "@/lib/i18n"

type SettingsTab = "personality" | "scheduling"

interface Business {
  name?: string | null
  location?: string | null
  phone?: string | null
  website?: string | null
  working_hours_start?: string | null
  working_hours_end?: string | null
  working_days?: number[] | null
  ai_instructions: string | null
  ai_tone: string | null
  ai_language: string | null
  ai_emoji_enabled: boolean | null
  ai_enabled: boolean | null
}

interface AISettingsClientProps {
  profile: any
  business: Business | null
}

export function AISettingsClient({ profile, business }: AISettingsClientProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<SettingsTab>("personality")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [instructions, setInstructions] = useState(
    business?.ai_instructions ?? "You are a friendly AI receptionist. Help clients book appointments, answer questions about services, and represent the business professionally."
  )
  const [tone, setTone] = useState(business?.ai_tone ?? "friendly")
  const [language, setLanguage] = useState(business?.ai_language ?? "en")
  const [emojiEnabled, setEmojiEnabled] = useState(business?.ai_emoji_enabled ?? true)
  const [aiEnabled, setAiEnabled] = useState(business?.ai_enabled ?? true)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateAISettings({
        ai_instructions: instructions,
        ai_tone: tone,
        ai_language: language,
        ai_emoji_enabled: emojiEnabled,
        ai_enabled: aiEnabled,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: any) {
      setSaveError(e.message ?? "Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <TopBar
        title={t("aiSettings.title")}
        subtitle={t("aiSettings.subtitle")}
        profile={profile}
      />

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("aiSettings.aiConfig")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("aiSettings.aiConfigDesc")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("aiSettings.aiReceptionist")}</span>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={cn("relative h-6 w-11 rounded-full transition-colors focus:outline-none", aiEnabled ? "bg-primary" : "bg-muted")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", aiEnabled ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("aiSettings.saving") : saveSuccess ? t("aiSettings.saved") : t("aiSettings.saveChanges")}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border mb-6">
          {(
            [
              { key: "personality", label: t("aiSettings.personalityTone") },
              { key: "scheduling", label: t("aiSettings.schedulingRules") },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SettingsTab)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "personality" ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{t("aiSettings.businessContext")}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("aiSettings.businessContextDesc")}{" "}
                    <Link href="/settings" className="text-primary underline hover:no-underline">
                      {t("aiSettings.editInSettings")}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
                {[
                  { label: t("aiSettings.name"), value: business?.name },
                  { label: t("aiSettings.location"), value: business?.location },
                  { label: t("aiSettings.phone"), value: business?.phone },
                  { label: t("aiSettings.website"), value: business?.website },
                  {
                    label: t("aiSettings.hours"),
                    value:
                      business?.working_hours_start && business?.working_hours_end
                        ? `${business.working_hours_start} – ${business.working_hours_end}`
                        : null,
                  },
                  {
                    label: t("aiSettings.openDays"),
                    value:
                      business?.working_days && business.working_days.length > 0
                        ? business.working_days
                            .slice()
                            .sort((a, b) => a - b)
                            .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                            .join(", ")
                        : null,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5 py-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={value ? "font-medium text-foreground" : "italic text-muted-foreground/50"}>
                      {value || t("aiSettings.notSet")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{t("aiSettings.knowledgeBase")}</h3>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">{t("aiSettings.systemInstructions")}</p>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="h-40 w-full resize-none rounded-lg border border-border bg-background p-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {t("aiSettings.sysInstructionsHint")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{t("aiSettings.voiceInteraction")}</h3>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5">{t("aiSettings.commTone")}</p>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="friendly">{t("aiSettings.friendly")}</option>
                    <option value="professional">{t("aiSettings.professional")}</option>
                    <option value="luxury">{t("aiSettings.luxury")}</option>
                    <option value="energetic">{t("aiSettings.energetic")}</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5">{t("aiSettings.primaryLanguage")}</p>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="tr">Türkçe</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <p className="mt-1.5 text-xs text-muted-foreground">{t("aiSettings.languageHint")}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("aiSettings.emojiUsage")}</p>
                    <p className="text-xs text-muted-foreground">{t("aiSettings.emojiDesc")}</p>
                  </div>
                  <button
                    onClick={() => setEmojiEnabled(!emojiEnabled)}
                    className={cn("relative h-6 w-11 rounded-full transition-colors focus:outline-none", emojiEnabled ? "bg-primary" : "bg-muted")}
                  >
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", emojiEnabled ? "right-0.5" : "left-0.5")} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{t("aiSettings.calendarRules")}</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5">{t("aiSettings.bufferTime")}</p>
                  <select className="w-32 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                    <option value="0">{t("aiSettings.none")}</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15" defaultValue="15">15 min</option>
                    <option value="30">30 min</option>
                  </select>
                  <p className="mt-1.5 text-xs text-muted-foreground">{t("aiSettings.bufferDesc")}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5">{t("aiSettings.maxAdvanceBooking")}</p>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                    <option>14 Days</option>
                    <option defaultValue="30 Days">30 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50 mt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("aiSettings.requireApproval")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("aiSettings.requireApprovalDesc")}</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-muted transition-colors focus:outline-none">
                    <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{t("aiSettings.businessHours")}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("aiSettings.businessHoursDesc")}{" "}
                <a href="/settings" className="text-primary underline underline-offset-2">
                  Settings
                </a>
                .
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                  <div key={d} className="flex justify-between border-b border-border/40 py-1.5 last:border-0">
                    <span className="font-medium text-foreground">{d}</span>
                    <span>{i < 6 ? "09:00 – 18:00" : t("aiSettings.closed")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
