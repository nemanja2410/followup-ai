import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  JOBBER_OAUTH_COOKIE,
  createJobberOAuthState,
  jobberOAuthCookieOptions,
} from "@/lib/jobber-oauth-state";

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
  const { state, nonce } = createJobberOAuthState(user.id);
  const jobberAuthUrl = new URL("https://api.getjobber.com/api/oauth/authorize");
  jobberAuthUrl.searchParams.set("response_type", "code");
  jobberAuthUrl.searchParams.set("client_id", clientId);
  jobberAuthUrl.searchParams.set("redirect_uri", redirectUri);
  jobberAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(jobberAuthUrl);
  response.cookies.set(JOBBER_OAUTH_COOKIE, nonce, jobberOAuthCookieOptions());
  return response;
}
