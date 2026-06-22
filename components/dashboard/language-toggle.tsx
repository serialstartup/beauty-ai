"use client"

import { useLanguage, type Lang } from "@/lib/i18n"

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex h-9 items-center rounded-lg border border-border bg-background p-0.5 text-xs font-semibold">
      {(["tr", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={
            lang === l
              ? "rounded-md bg-primary px-2.5 py-1 text-primary-foreground transition-all"
              : "rounded-md px-2.5 py-1 text-muted-foreground transition-all hover:text-foreground"
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
