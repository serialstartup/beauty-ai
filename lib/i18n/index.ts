"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import React from "react"
import { translations, type Lang } from "./translations"

export type { Lang }
export { translations }

// ── Context ──────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null
    if (saved === "tr" || saved === "en") {
      setLangState(saved)
      document.cookie = `lang=${saved};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("lang", l)
    document.cookie = `lang=${l};path=/;max-age=31536000;SameSite=Lax`
  }

  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, any>
    const parts = key.split(".")
    let val: any = dict
    for (const p of parts) {
      val = val?.[p]
      if (val === undefined) return key
    }
    return typeof val === "string" ? val : key
  }

  return React.createElement(LanguageContext.Provider, { value: { lang, setLang, t } }, children)
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider")
  return ctx
}
