import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("business_id")
      .eq("id", userData.user.id)
      .single()

    if (!user?.business_id) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const { phone_number_id, access_token } = await request.json()

    if (!phone_number_id?.trim() || !access_token?.trim()) {
      return NextResponse.json({ error: "Phone Number ID and Access Token are required" }, { status: 400 })
    }

    // Ensure no other business already owns this phone_number_id
    const admin = createAdminClient()
    const { data: existing } = await admin
      .from("business_integrations")
      .select("business_id")
      .eq("wa_phone_number_id", phone_number_id.trim())
      .eq("is_active", true)
      .neq("business_id", user.business_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "This phone number is already connected to another account." },
        { status: 409 }
      )
    }

    // Verify credentials against Meta Graph API
    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${phone_number_id.trim()}?fields=display_phone_number,verified_name,quality_rating&access_token=${access_token.trim()}`
    )

    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}))
      const message = err?.error?.message || "Invalid credentials"
      return NextResponse.json({ error: `Meta API error: ${message}` }, { status: 400 })
    }

    const phoneData = await metaRes.json()

    const { error: upsertError } = await admin
      .from("business_integrations")
      .upsert(
        {
          business_id: user.business_id,
          platform: "whatsapp",
          wa_phone_number: phoneData.display_phone_number || phone_number_id.trim(),
          wa_phone_number_id: phone_number_id.trim(),
          wa_access_token: access_token.trim(),
          is_active: true,
          verified_at: new Date().toISOString(),
          verification_code: null,
          verification_expires_at: null,
        },
        { onConflict: "business_id,platform" }
      )

    if (upsertError) {
      console.error("Upsert error:", upsertError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      display_phone_number: phoneData.display_phone_number,
      verified_name: phoneData.verified_name,
    })
  } catch (error) {
    console.error("WhatsApp Setup Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
