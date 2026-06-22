import { createAdminClient } from "@/lib/supabase/server"
import {
  addMinutes,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  parseISO,
  startOfDay,
  addDays,
} from "date-fns"
import { getTzOffsetMs, formatInTz } from "@/lib/timezone"

/**
 * Parses a time string like "09:00" as local business time and returns a UTC Date.
 */
function parseLocalTimeStr(date: Date, timeStr: string, timezone: string): Date {
  const offsetMs = getTzOffsetMs(timezone, date)
  const [hours, minutes] = timeStr.split(":").map(Number)
  const naive = setMinutes(setHours(startOfDay(date), hours), minutes)
  return new Date(naive.getTime() - offsetMs)
}

/**
 * Checks if a requested time slot conflicts with existing appointments.
 */
export function checkConflict(
  startSlot: Date,
  endSlot: Date,
  appointments: Array<{ start_time: string; end_time: string }>
): boolean {
  for (const appt of appointments) {
    const apptStart = new Date(appt.start_time)
    const apptEnd = new Date(appt.end_time)

    // Overlap condition: start < appt.end AND end > appt.start
    if (isBefore(startSlot, apptEnd) && isAfter(endSlot, apptStart)) {
      return true // Conflict found
    }
  }
  return false
}

/**
 * Gets available slots for a given service and date.
 * Checks business hours and existing appointments — no staff required.
 */
export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  dateStr: string
) {
  const supabase = createAdminClient()
  const date = parseISO(dateStr)
  const dayOfWeek = date.getDay() // 0 = Sunday, ..., 6 = Saturday

  // 1. Fetch Business Details
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("working_hours_start, working_hours_end, working_days, timezone")
    .eq("id", businessId)
    .single()

  if (bizError || !business) {
    throw new Error("Business not found")
  }

  // Check if business is open on this day
  if (!business.working_days.includes(dayOfWeek)) {
    return [] // Closed today
  }

  // 2. Fetch Service Details
  const { data: service, error: srvError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single()

  if (srvError || !service) {
    throw new Error("Service not found")
  }

  // 3. Fetch existing appointments for the given date and business
  // Query a wide enough UTC window to cover the full local business day
  const tz = (business as any).timezone || "UTC"
  const offsetMs = getTzOffsetMs(tz, date)
  const startOfDayUtc = new Date(startOfDay(date).getTime() - offsetMs).toISOString()
  const endOfDayUtc = new Date(startOfDay(addDays(date, 1)).getTime() - offsetMs).toISOString()

  const { data: appointments, error: apptError } = await supabase
    .from("appointments")
    .select("start_time, end_time")
    .eq("business_id", businessId)
    .gte("start_time", startOfDayUtc)
    .lt("start_time", endOfDayUtc)
    .neq("status", "cancelled")

  if (apptError) {
    throw new Error("Error fetching appointments")
  }

  // 4. Calculate available slots (calendar-level conflict check, no staff)
  const availableSlots: Array<{ time: string }> = []
  const duration = service.duration_minutes

  const startTime = parseLocalTimeStr(date, business.working_hours_start, tz)
  const endTime = parseLocalTimeStr(date, business.working_hours_end, tz)

  const stepMinutes = 15
  let currentSlot = startTime

  while (addMinutes(currentSlot, duration) <= endTime) {
    const slotStart = currentSlot
    const slotEnd = addMinutes(currentSlot, duration)

    // Don't suggest times in the past if checking for today
    if (isBefore(slotStart, new Date())) {
      currentSlot = addMinutes(currentSlot, stepMinutes)
      continue
    }

    const hasConflict = checkConflict(slotStart, slotEnd, appointments || [])

    if (!hasConflict) {
      availableSlots.push({ time: formatInTz(slotStart, tz) })
    }

    currentSlot = addMinutes(currentSlot, stepMinutes)
  }

  return availableSlots
}

/**
 * Creates an appointment with a pre-check for calendar conflicts.
 * No staff assignment — slot availability is checked at the business level.
 */
export async function createAppointmentSafely({
  businessId,
  customerId,
  serviceId,
  startTime,
  endTime,
  source,
}: {
  businessId: string
  customerId: string
  serviceId: string
  startTime: string // ISO string
  endTime: string // ISO string
  source: string
}) {
  const supabase = createAdminClient()

  // Pre-check: any non-cancelled appointment overlapping this slot
  const { data: existingAppts } = await supabase
    .from("appointments")
    .select("id")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .lt("start_time", endTime)
    .gt("end_time", startTime)

  if (existingAppts && existingAppts.length > 0) {
    throw new Error(
      "Time slot is no longer available. Please choose another time."
    )
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service_id: serviceId,
      start_time: startTime,
      end_time: endTime,
      status: "confirmed",
      source,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
