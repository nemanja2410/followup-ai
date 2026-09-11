import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import {
  GET_QUOTE_QUERY,
  jobberGraphqlWithRefresh,
  loadIntegrationByUserId,
  mapQuoteStatus,
} from "@/lib/jobber";

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_CHANGED_ERROR =
  "This quote was already accepted or declined. Refresh the list — a follow-up is no longer needed.";

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

    const { leadId, email, name, message } = await request.json();

    if (!leadId || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required." },
        { status: 400 }
      );
    }

    const { data: lead } = await supabase
      .from("leads")
      .select("id, status, jobber_quote_id")
      .eq("id", leadId)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Quote not found." },
        { status: 404 }
      );
    }

    if (lead.status === "won" || lead.status === "lost") {
      return NextResponse.json(
        { success: false, error: STATUS_CHANGED_ERROR },
        { status: 409 }
      );
    }

    if (lead.jobber_quote_id) {
      const integration = await loadIntegrationByUserId(user.id);
      if (integration) {
        const jobberData = await jobberGraphqlWithRefresh(integration, GET_QUOTE_QUERY, {
          id: lead.jobber_quote_id,
        });
        const quote = (
          jobberData.json.data as { quote?: { quoteStatus?: string } } | undefined
        )?.quote;

        if (quote) {
          const mapped = mapQuoteStatus(quote.quoteStatus);
          if (mapped === "won" || mapped === "lost") {
            await supabase.from("leads").update({ status: mapped }).eq("id", lead.id);
            return NextResponse.json(
              { success: false, error: STATUS_CHANGED_ERROR },
              { status: 409 }
            );
          }
        }
      }
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
