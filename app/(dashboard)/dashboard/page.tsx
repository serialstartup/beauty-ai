import { TopBar } from "@/components/dashboard/top-bar"
import { StatsCard } from "@/components/ui/stats-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { createClient } from "@/lib/supabase/server"
import { getServerT } from "@/lib/i18n/server"
import {
  CalendarCheck,
  Clock,
  Users,
  DollarSign,
  Calendar,
  User,
} from "lucide-react"

export default async function DashboardPage() {
  const [supabase, t] = await Promise.all([createClient(), getServerT()])

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: appointments },
    { data: customers },
    { data: userData },
    { data: allAppts },
    { data: weekAppts },
  ] = await Promise.all([
    supabase.from("appointments").select("id, start_time, status, service_id, services(name), customers(name)").order("start_time", { ascending: true }),
    supabase.from("customers").select("id, name, created_at, phone").order("created_at", { ascending: false }).limit(5),
    supabase.auth.getUser(),
    supabase.from("appointments").select("services(price)"),
    supabase.from("appointments").select("start_time, status").gte("start_time", sevenDaysAgo),
  ])

  const { data: userProfile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", userData.user?.id)
    .single()

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userData.user?.id)
    .single()

  let onboardingSteps: { id: string; label: string; description: string; done: boolean; href: string }[] = []
  if (userProfile?.business_id) {
    const [
      { count: servicesCount },
      { count: integrationsCount },
      { data: bizInfo },
    ] = await Promise.all([
      supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", userProfile.business_id),
      supabase.from("business_integrations").select("id", { count: "exact", head: true }).eq("business_id", userProfile.business_id),
      supabase.from("businesses").select("phone, website, ai_instructions").eq("id", userProfile.business_id).single(),
    ])

    onboardingSteps = [
      {
        id: "business_info",
        label: t("onboarding.fillBusiness"),
        description: t("onboarding.fillBusinessDesc"),
        done: !!bizInfo?.phone,
        href: "/settings",
      },
      {
        id: "services",
        label: t("onboarding.addServices"),
        description: t("onboarding.addServicesDesc"),
        done: (servicesCount ?? 0) > 0,
        href: "/services",
      },
      {
        id: "ai_settings",
        label: t("onboarding.configureAI"),
        description: t("onboarding.configureAIDesc"),
        done: !!(bizInfo?.ai_instructions && bizInfo.ai_instructions.trim().length > 10),
        href: "/ai-settings",
      },
      {
        id: "whatsapp",
        label: t("onboarding.connectWhatsApp"),
        description: t("onboarding.connectWhatsAppDesc"),
        done: (integrationsCount ?? 0) > 0,
        href: "/integrations",
      },
    ]
  }

  const totalRevenue = allAppts?.reduce((acc, appt) => {
    const service = Array.isArray(appt.services) ? appt.services[0] : appt.services
    return acc + (service?.price || 0)
  }, 0) || 0

  const appts = appointments || []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayAppts = appts.filter(a => {
    const d = new Date(a.start_time)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })

  const upcomingAppts = appts.filter(a => new Date(a.start_time) > today)

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeklyMap: Record<string, { confirmed: number; suggested: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    weeklyMap[dayLabels[d.getDay()]] = { confirmed: 0, suggested: 0 }
  }
  for (const appt of weekAppts ?? []) {
    const label = dayLabels[new Date(appt.start_time).getDay()]
    if (weeklyMap[label]) {
      if (appt.status === "confirmed" || appt.status === "completed") {
        weeklyMap[label].confirmed++
      } else {
        weeklyMap[label].suggested++
      }
    }
  }
  const weeklyData = Object.entries(weeklyMap).map(([day, v]) => ({ day, ...v }))

  const statusLabel: Record<string, string> = {
    scheduled: t("appointments.statusScheduled"),
    confirmed: t("appointments.statusConfirmed"),
    completed: t("appointments.statusCompleted"),
    cancelled: t("appointments.statusCancelled"),
    "no-show": t("appointments.statusNoShow"),
  }

  return (
    <div>
      <TopBar
        title={t("nav.dashboard")}
        searchPlaceholder={t("dashboard.searchPh")}
        profile={profile}
      />

      {onboardingSteps.length > 0 && (
        <OnboardingChecklist steps={onboardingSteps} />
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t("dashboard.todayAppts")}
            value={todayAppts.length}
            icon={CalendarCheck}
            trend={{ value: t("dashboard.basedOnRealData"), positive: true }}
          />
          <StatsCard
            title={t("dashboard.upcoming")}
            value={upcomingAppts.length}
            icon={Clock}
            subtitle={t("dashboard.upcomingDesc")}
          />
          <StatsCard
            title={t("dashboard.recentCustomers")}
            value={customers?.length || 0}
            icon={Users}
            subtitle={t("dashboard.totalCustomersAdded")}
          />
          <StatsCard
            title={t("dashboard.totalRevenue")}
            value={`₺${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: t("dashboard.allTimeEarnings"), positive: true }}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t("dashboard.weeklyAppts")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.weeklyDesc")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{t("dashboard.confirmed")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary/30" />
                  <span className="text-muted-foreground">{t("dashboard.aiSuggested")}</span>
                </div>
              </div>
            </div>

            <WeeklyChart data={weeklyData} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6 flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{t("dashboard.nextUp")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.nextUpDesc")}
                </p>
              </div>

              {upcomingAppts.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppts.slice(0, 4).map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {apt.services?.name || "Service"}
                          </p>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {statusLabel[apt.status] || apt.status}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {apt.customers?.name || t("appointments.unknownCustomer")}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {new Date(apt.start_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium text-foreground">{t("dashboard.noUpcoming")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.scheduleEmpty")}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{t("dashboard.recentCustomers")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.latestSignups")}
                </p>
              </div>

              {customers && customers.length > 0 ? (
                <div className="space-y-4">
                  {customers.map((cust: any) => (
                    <div
                      key={cust.id}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {cust.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {cust.phone || t("common.noPhone")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium text-foreground">{t("dashboard.noCustomers")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.addFirst")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
