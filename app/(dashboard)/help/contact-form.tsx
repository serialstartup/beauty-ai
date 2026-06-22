"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"

const SUBJECT_KEYS = ["techIssue", "billingQ", "featureReq", "other"] as const
type SubjectKey = typeof SUBJECT_KEYS[number]

export function ContactForm() {
  const { t } = useLanguage()
  const [subjectKey, setSubjectKey] = useState<SubjectKey>("techIssue")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: t(`help.${subjectKey}`), message }),
      })
      if (!res.ok) throw new Error()
      toast.success(t("help.messageSent"))
      setMessage("")
    } catch {
      toast.error(t("help.failedSend"))
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("help.subject")}
        </label>
        <select
          value={subjectKey}
          onChange={(e) => setSubjectKey(e.target.value as SubjectKey)}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        >
          {SUBJECT_KEYS.map((k) => (
            <option key={k} value={k}>{t(`help.${k}`)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("help.message")}
        </label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("help.messagePh")}
          className="w-full resize-y rounded-lg border border-border bg-background p-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {sending ? t("help.sending") : t("help.sendMessage")}
      </button>
    </form>
  )
}
