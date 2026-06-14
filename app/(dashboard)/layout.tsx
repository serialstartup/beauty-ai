import { createClient } from "@/lib/supabase/server"
import { DashboardLayoutWrapper } from "@/components/dashboard/dashboard-layout-wrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  let profile = null
  let subscription = null

  if (userData.user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userData.user.id)
      .single()
    profile = data

    if (profile?.business_id) {
      const { data: business } = await supabase
        .from("businesses")
        .select("name, subscription_status, trial_ends_at, cancel_at_period_end")
        .eq("id", profile.business_id)
        .single()

      if (business) {
        const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
        const trialDaysLeft = trialEndsAt
          ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0

        subscription = {
          status: business.subscription_status || "trialing",
          trialDaysLeft,
          businessName: business.name,
        }
      }
    }
  }

  return (
    <DashboardLayoutWrapper profile={profile} subscription={subscription}>
      {children}
    </DashboardLayoutWrapper>
  )
}
