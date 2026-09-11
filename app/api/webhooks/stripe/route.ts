import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = subscription.metadata?.supabase_user_id || null;
  const admin = getSupabaseAdmin();

  const row = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.status === "canceled" ? null : subscription.id,
    stripe_subscription_status: subscription.status,
  };

  if (userId) {
    const { error } = await admin.from("profiles").update(row).eq("user_id", userId);
    if (error) console.error("Stripe webhook profile update failed:", error);
    return;
  }

  const { error } = await admin.from("profiles").update(row).eq("stripe_customer_id", customerId);
  if (error) console.error("Stripe webhook profile update failed:", error);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          String(session.subscription)
        );
        if (session.client_reference_id && !subscription.metadata?.supabase_user_id) {
          await getStripe().subscriptions.update(subscription.id, {
            metadata: { supabase_user_id: session.client_reference_id },
          });
          subscription.metadata = {
            ...subscription.metadata,
            supabase_user_id: session.client_reference_id,
          };
        }
        await syncSubscription(subscription);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
