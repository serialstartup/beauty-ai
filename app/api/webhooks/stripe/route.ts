import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(request: Request) {
  const rawBody = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== "subscription" || !session.subscription) break

      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      )

      await admin
        .from("businesses")
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq("stripe_customer_id", subscription.customer as string)

      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription

      await admin
        .from("businesses")
        .update({
          subscription_status: subscription.status,
          current_period_end: new Date(
            subscription.items.data[0].current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq("stripe_customer_id", subscription.customer as string)

      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      await admin
        .from("businesses")
        .update({
          subscription_status: "canceled",
          stripe_subscription_id: null,
          cancel_at_period_end: false,
        })
        .eq("stripe_customer_id", subscription.customer as string)

      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice

      await admin
        .from("businesses")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", invoice.customer as string)

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
