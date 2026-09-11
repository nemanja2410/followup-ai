import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_status, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = profile?.stripe_subscription_status ?? null;
  const configured = Boolean(process.env.STRIPE_PRICE_ID && process.env.STRIPE_SECRET_KEY);

  return NextResponse.json({
    configured,
    status,
    hasCustomer: Boolean(profile?.stripe_customer_id),
    active: status === "active" || status === "trialing",
  });
}
