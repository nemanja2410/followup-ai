import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  LIST_QUOTES_QUERY,
  jobberGraphqlWithRefresh,
  loadIntegrationByUserId,
  mapQuoteStatus,
  upsertLeadFromQuote,
} from "@/lib/jobber";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await loadIntegrationByUserId(user.id);
  if (!integration) {
    return NextResponse.json({ error: "Jobber not connected" }, { status: 401 });
  }

  const result = await jobberGraphqlWithRefresh(integration, LIST_QUOTES_QUERY);
  const quotes = (result.json.data as { quotes?: { nodes?: unknown[] } } | undefined)?.quotes
    ?.nodes as
    | Parameters<typeof upsertLeadFromQuote>[1][]
    | undefined;

  if (result.json.errors || !quotes) {
    console.error("Jobber sync query failed:", error);
    return NextResponse.json(
      { error: result.json.errors?.[0]?.message || "Could not load quotes from Jobber" },
      { status: 502 }
    );
  }

  let imported = 0;
  let skipped = 0;

  for (const quote of quotes) {
    if (mapQuoteStatus(quote.quoteStatus) === "skip") {
      skipped += 1;
      continue;
    }
    const outcome = await upsertLeadFromQuote(user.id, quote);
    if (outcome.error) {
      console.error("Quote import failed:", outcome.error);
    } else if (outcome.skipped) {
      skipped += 1;
    } else {
      imported += 1;
    }
  }

  return NextResponse.json({ success: true, imported, skipped, total: quotes.length });
}
