import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

export async function POST() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", userData.user.id)
    .single()

  if (!profile?.business_id) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const { data: business } = await createAdminClient()
    .from("businesses")
    .select("stripe_customer_id")
    .eq("id", profile.business_id)
    .single()

  if (!business?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Please subscribe first." },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://receptionist-os.vercel.app"

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${appUrl}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
