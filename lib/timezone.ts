/**
 * Returns the UTC offset in milliseconds for a timezone at a given instant.
 * Positive value means the timezone is ahead of UTC (e.g., UTC+3 → +10800000).
 */
export function getTzOffsetMs(timezone: string, at: Date = new Date()): number {
  const utcStr = at.toLocaleString("en-US", { timeZone: "UTC" })
  const tzStr = at.toLocaleString("en-US", { timeZone: timezone })
  return new Date(tzStr).getTime() - new Date(utcStr).getTime()
}

/**
 * Parses a naive datetime string (YYYY-MM-DDTHH:mm) as local business time
 * and returns a UTC Date.
 */
export function localToUTC(naiveDatetime: string, timezone: string): Date {
  const offsetMs = getTzOffsetMs(timezone)
  const naive = new Date(naiveDatetime + ":00") // treats as server-local (UTC on Vercel)
  return new Date(naive.getTime() - offsetMs)
}

/**
 * Formats a UTC Date as HH:mm in the given timezone.
 */
export function formatInTz(utcDate: Date, timezone: string): string {
  return utcDate.toLocaleString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}
