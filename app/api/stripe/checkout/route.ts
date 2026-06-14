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

  const admin = createAdminClient()
  const { data: business } = await admin
    .from("businesses")
    .select("id, name, email, stripe_customer_id")
    .eq("id", profile.business_id)
    .single()

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const stripe = getStripe()
  let customerId = business.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: business.email || userData.user.email,
      name: business.name,
      metadata: { business_id: business.id },
    })
    customerId = customer.id

    await admin
      .from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", business.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://receptionist-os.vercel.app"

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/settings?billing=cancelled`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
