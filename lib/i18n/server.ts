import { cookies } from "next/headers"
import { translations, type Lang } from "./translations"

export async function getServerT() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "tr"
  const dict = translations[lang] as Record<string, any>
  return function t(key: string): string {
    const parts = key.split(".")
    let val: any = dict
    for (const p of parts) {
      val = val?.[p]
      if (val === undefined) return key
    }
    return typeof val === "string" ? val : key
  }
}
