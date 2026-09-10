import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const clientId = process.env.JOBBER_CLIENT_ID || process.env.NEXT_PUBLIC_JOBBER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/dashboard?error=Jobber_Not_Configured", origin));
  }

  const redirectUri = `${origin}/api/auth/jobber/callback`;
  const jobberAuthUrl = new URL("https://api.getjobber.com/api/oauth/authorize");
  jobberAuthUrl.searchParams.set("response_type", "code");
  jobberAuthUrl.searchParams.set("client_id", clientId);
  jobberAuthUrl.searchParams.set("redirect_uri", redirectUri);
  jobberAuthUrl.searchParams.set("state", user.id);

  return NextResponse.redirect(jobberAuthUrl);
}
