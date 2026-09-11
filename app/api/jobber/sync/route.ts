import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  LIST_QUOTES_QUERY,
  LIST_QUOTES_QUERY_FALLBACK,
  jobberGraphqlWithRefresh,
  isJobberAuthFailure,
  loadIntegrationByUserId,
  mapQuoteStatus,
  upsertLeadFromQuote,
  type JobberQuote,
} from "@/lib/jobber";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  getSupabaseAdmin();

  const integration = await loadIntegrationByUserId(user.id);
  if (!integration) {
    return NextResponse.json({ error: "Jobber not connected", reconnect: true }, { status: 401 });
  }

  let result = await jobberGraphqlWithRefresh(integration, LIST_QUOTES_QUERY);
  if (result.json.errors) {
    console.error("Jobber sorted query failed, retrying without sort:", result.json.errors);
    result = await jobberGraphqlWithRefresh(integration, LIST_QUOTES_QUERY_FALLBACK);
  }
  const quotes = (result.json.data as { quotes?: { nodes?: JobberQuote[] } } | undefined)?.quotes
    ?.nodes;

  if (result.json.errors || !quotes) {
    console.error("Jobber full response:", JSON.stringify(result.json, null, 2));
    return NextResponse.json(
      {
        error: result.json.errors?.[0]?.message || "Could not load quotes from Jobber",
        reconnect: isJobberAuthFailure(result) || result.status === 401,
      },
      { status: 502 }
    );
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const quote of quotes) {
    if (mapQuoteStatus(quote.quoteStatus) === "skip") {
      skipped += 1;
      continue;
    }

    const outcome = await upsertLeadFromQuote(user.id, quote);
    if (outcome.error) {
      console.error("Supabase insert error:", outcome.error, {
        jobberQuoteId: quote.id,
        quoteNumber: quote.quoteNumber,
      });
      failures.push(outcome.error);
      continue;
    }
    if (outcome.skipped) {
      skipped += 1;
    } else if (outcome.created) {
      imported += 1;
    } else {
      updated += 1;
    }
  }

  if (failures.length > 0) {
    return NextResponse.json(
      {
        error: failures[0],
        imported,
        updated,
        skipped,
        failed: failures.length,
        total: quotes.length,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    imported,
    updated,
    skipped,
    total: quotes.length,
  });
}
