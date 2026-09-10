import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadIntegrationByUserId } from "@/lib/jobber";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await loadIntegrationByUserId(user.id);

  return NextResponse.json({
    connected: Boolean(integration?.jobber_access_token),
  });
}
