import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/dashboard?error=Missing_Code_or_State", request.url));
  }

  try {
    // 1. Exchange the code for the Jobber Access Token
    const redirectUri = `${origin}/api/auth/jobber/callback`; // We MUST include this!

    const response = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.JOBBER_CLIENT_ID!,
        client_secret: process.env.JOBBER_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri, // Fixed: Added the missing redirect_uri
      }),
    });

    // Safer error handling: read as text first
    const responseText = await response.text();

    if (!response.ok) {
      console.error("Jobber Token Error:", responseText);
      return NextResponse.redirect(new URL("/dashboard?error=Jobber_Auth_Failed", request.url));
    }

    // Now it is safe to parse the JSON
    const data = JSON.parse(responseText);

    // 2. Save the tokens securely in Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from("integrations")
      .upsert({
        user_id: userId,
        jobber_access_token: data.access_token,
        jobber_refresh_token: data.refresh_token,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=Database_Save_Failed", request.url));
    }

    // 3. Success! Redirect the user back to their dashboard
    return NextResponse.redirect(new URL("/dashboard?success=Jobber_Connected", request.url));

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=Server_Error", request.url));
  }
}