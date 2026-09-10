import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { jobberGraphql } from "@/lib/jobber";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");

  if (!code || !stateUserId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=Missing_Code_or_State", request.url)
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateUserId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=Jobber_Auth_Mismatch", request.url)
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
      return NextResponse.redirect(
        new URL("/dashboard?error=Jobber_Auth_Failed", request.url)
      );
    }

    const data = JSON.parse(responseText);
    const admin = getSupabaseAdmin();

    let jobberAccountId: string | null = null;
    const accountResult = await jobberGraphql(
      data.access_token,
      `query { account { id name } }`
    );
    jobberAccountId =
      (accountResult.json.data as { account?: { id?: string } } | undefined)?.account?.id ??
      null;

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
      return NextResponse.redirect(
        new URL("/dashboard?error=Database_Save_Failed", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard?success=Jobber_Connected", request.url)
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=Server_Error", request.url)
    );
  }
}
