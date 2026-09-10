import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email, name, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required." },
        { status: 400 }
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL || "FollowUp AI <onboarding@resend.dev>";

    const data = await resend.emails.send({
      from,
      to: email,
      replyTo: user.email ?? undefined,
      subject: `Checking in regarding your estimate${name ? `, ${name}` : ""}`,
      text: message,
    });

    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Send email failed:", error);
    return NextResponse.json(
      { success: false, error: "Sending the email failed." },
      { status: 500 }
    );
  }
}
