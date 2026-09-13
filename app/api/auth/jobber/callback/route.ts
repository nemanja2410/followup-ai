import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { jobberGraphql } from "@/lib/jobber";
import {
  JOBBER_OAUTH_COOKIE,
  parseJobberOAuthState,
} from "@/lib/jobber-oauth-state";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieNonce = (await cookies()).get(JOBBER_OAUTH_COOKIE)?.value ?? null;

  const clearAuthCookie = (response: NextResponse) => {
    response.cookies.set(JOBBER_OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  };

  if (!code || !state) {
    return clearAuthCookie(
      NextResponse.redirect(new URL("/dashboard?error=Missing_Code_or_State", request.url))
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !parseJobberOAuthState(state, cookieNonce, user.id)) {
    return clearAuthCookie(
      NextResponse.redirect(new URL("/dashboard?error=Jobber_Auth_Mismatch", request.url))
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/jobber/callback`;

    const response = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.JOBBER_CLIENT_ID!,
        client_secret: process.env.JOBBER_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Jobber Token Error:", responseText);
      return clearAuthCookie(
        NextResponse.redirect(new URL("/dashboard?error=Jobber_Auth_Failed", request.url))
      );
    }

    const data = JSON.parse(responseText);
    const admin = getSupabaseAdmin();

    let jobberAccountId: string | null = null;
    const accountResult = await jobberGraphql(
      data.access_token,
      `query { account { id name } }`
    );
    const account = (accountResult.json.data as { account?: { id?: string; name?: string } } | undefined)
      ?.account;
    jobberAccountId = account?.id ?? null;
    const jobberAccountName = account?.name?.trim() || "";

    if (!jobberAccountId) {
      console.error("Could not load Jobber account id:", accountResult.json);
    }

    const expiresAt = data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000).toISOString()
      : null;

    const { error } = await admin.from("integrations").upsert(
      {
        user_id: user.id,
        jobber_access_token: data.access_token,
        jobber_refresh_token: data.refresh_token,
        jobber_account_id: jobberAccountId,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Database Error:", error);
      return clearAuthCookie(
        NextResponse.redirect(new URL("/dashboard?error=Database_Save_Failed", request.url))
      );
    }

    if (jobberAccountName) {
      const { data: profile } = await admin
        .from("profiles")
        .select("business_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.business_name?.trim()) {
        const { error: profileError } = await admin
          .from("profiles")
          .update({ business_name: jobberAccountName })
          .eq("user_id", user.id);
        if (profileError) {
          console.error("Could not save Jobber account name to profile:", profileError);
        }
      }
    }

    return clearAuthCookie(
      NextResponse.redirect(new URL("/dashboard?success=Jobber_Connected", request.url))
    );
  } catch (error) {
    console.error("Server Error:", error);
    return clearAuthCookie(
      NextResponse.redirect(new URL("/dashboard?error=Server_Error", request.url))
    );
  }
}
