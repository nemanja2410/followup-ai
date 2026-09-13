import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import {
  GET_QUOTE_QUERY,
  jobberGraphqlWithRefresh,
  loadIntegrationByUserId,
  mapQuoteStatus,
} from "@/lib/jobber";
import {
  parseFollowupDraft,
  renderFollowupHtml,
  renderFollowupText,
  resolveCompanyName,
} from "@/lib/followup-email";

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_CHANGED_ERROR =
  "This quote was already accepted or declined. Refresh the list — a follow-up is no longer needed.";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

    const { leadId, message, subject: subjectFromClient, cta: ctaFromClient } = await request.json();

    if (!leadId || !message) {
      return NextResponse.json(
        { success: false, error: "A quote and message are required." },
        { status: 400 }
      );
    }

    const { data: lead } = await supabase
      .from("leads")
      .select("id, status, jobber_quote_id, client_email, client_name")
      .eq("id", leadId)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Quote not found." },
        { status: 404 }
      );
    }

    const to = lead.client_email?.trim() ?? "";
    if (!to || !looksLikeEmail(to)) {
      return NextResponse.json(
        { success: false, error: "This quote has no valid email address." },
        { status: 400 }
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const draft = parseFollowupDraft(
      JSON.stringify({
        subject: typeof subjectFromClient === "string" ? subjectFromClient : "",
        body: message,
        cta: typeof ctaFromClient === "string" ? ctaFromClient : "",
      })
    );
    const companyName = resolveCompanyName({
      businessName: profile?.business_name,
      fromHeader: from,
    });
    const replyEmail = user.email ?? "";
    const html = renderFollowupHtml({
      body: draft.body,
      cta: draft.cta,
      companyName,
      replyEmail,
    });
    const text = renderFollowupText({
      body: draft.body,
      cta: draft.cta,
      companyName,
      replyEmail,
    });

    const data = await resend.emails.send({
      from,
      to,
      replyTo: user.email ?? undefined,
      subject: draft.subject,
      text,
      html,
    });

    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error.message },
        { status: 500 }
      );
    }

    const lastFollowedUpAt = new Date().toISOString();
    const { error: statusError } = await supabase
      .from("leads")
      .update({
        status: "followed_up",
        last_followed_up_at: lastFollowedUpAt,
      })
      .eq("id", lead.id);

    if (statusError) {
      console.error("Send succeeded but could not mark followed_up:", statusError);
      return NextResponse.json(
        {
          success: true,
          warning: "Email sent, but the quote status did not update. Refresh the list.",
          to,
          last_followed_up_at: lastFollowedUpAt,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, to, last_followed_up_at: lastFollowedUpAt },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send email failed:", error);
    return NextResponse.json(
      { success: false, error: "Sending the email failed." },
      { status: 500 }
    );
  }
}
