import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: userData } = await supabase.auth.getUser()
  let business = null
  let userProfile = null

  if (userData.user) {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userData.user.id)
      .single()

    userProfile = profile

    if (profile?.business_id) {
      const { data: b } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", profile.business_id)
        .single()
      business = b
    }
  }

  return (
    <SettingsClient
      business={business}
      profile={userProfile}
      email={userData.user?.email}
      billingStatus={params.billing}
    />
  )
}
