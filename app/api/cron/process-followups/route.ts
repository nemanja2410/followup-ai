import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { FOLLOW_UP_AFTER_HOURS, markOpenLeadsDue } from "@/lib/followups";

async function run(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { count, error } = await markOpenLeadsDue(getSupabaseAdmin());

    if (error) {
      console.error("Cron mark-due failed:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
      message: `Marked open quotes older than ${FOLLOW_UP_AFTER_HOURS} hours as due. No emails sent.`,
      count,
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
