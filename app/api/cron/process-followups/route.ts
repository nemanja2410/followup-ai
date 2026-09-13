import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { FOLLOW_UP_AFTER_HOURS, markOpenLeadsDue } from "@/lib/followups";

const resend = new Resend(process.env.RESEND_API_KEY);

function dashboardUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/dashboard`;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}/dashboard`;
  return "http://localhost:3000/dashboard";
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function run(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("CRON_SECRET is not set");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { count, leads, error } = await markOpenLeadsDue(supabase);

    if (error) {
      console.error("Cron mark-due failed:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const byUser = new Map<string, { count: number; total: number }>();
    for (const lead of leads) {
      const stats = byUser.get(lead.user_id) ?? { count: 0, total: 0 };
      stats.count += 1;
      stats.total += Number(lead.quote_value || 0);
      byUser.set(lead.user_id, stats);
    }

    const from =
      process.env.RESEND_FROM_EMAIL || "FollowUp AI <onboarding@resend.dev>";
    const link = dashboardUrl();
    let notified = 0;

    for (const [userId, stats] of byUser) {
      const { data, error: userError } = await supabase.auth.admin.getUserById(userId);
      const email = data.user?.email;
      if (userError || !email) {
        console.error("Cron digest: no login email for user", userId, userError);
        continue;
      }

      const subject =
        stats.count === 1
          ? "1 quote needs a follow-up"
          : `${stats.count} quotes need a follow-up`;
      const body = [
        `${stats.count} quote${stats.count === 1 ? "" : "s"} ${stats.count === 1 ? "is" : "are"} due for a follow-up${stats.total > 0 ? ` (${money(stats.total)} in estimates)` : ""}.`,
        `Open your dashboard: ${link}`,
        "You still send every email yourself. FollowUp AI does not email your customers on its own.",
      ].join("\n\n");

      const sent = await resend.emails.send({
        from,
        to: email,
        subject,
        text: body,
      });

      if (sent.error) {
        console.error("Cron digest email failed:", sent.error);
        continue;
      }
      notified += 1;
    }

    return NextResponse.json({
      message: `Marked open quotes older than ${FOLLOW_UP_AFTER_HOURS} hours as due. Owner digest only — no customer emails.`,
      count,
      notified,
    });
  } catch (error) {
    console.error("Cron processing failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
