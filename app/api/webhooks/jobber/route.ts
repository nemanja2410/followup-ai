import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  GET_QUOTE_QUERY,
  clearIntegrationByAccountId,
  jobberGraphqlWithRefresh,
  loadIntegrationByAccountId,
  upsertLeadFromQuote,
} from "@/lib/jobber";

function verifyWithSecret(payload: string, signature: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyJobberWebhook(payload: string, signature: string) {
  const secrets = [process.env.JOBBER_CLIENT_SECRET, process.env.JOBBER_WEBHOOK_SECRET].filter(
    (value, index, all): value is string => Boolean(value) && all.indexOf(value) === index
  );

  return secrets.some((secret) => verifyWithSecret(payload, signature, secret));
}

function extractWebhookEvent(body: Record<string, unknown>) {
  const nested = body?.data as { webHookEvent?: Record<string, unknown> } | undefined;
  const event =
    nested?.webHookEvent ||
    (body?.webHookEvent as Record<string, unknown> | undefined) ||
    {};

  return {
    topic: String(event.topic || "").toUpperCase(),
    itemId: String(event.itemId || ""),
    accountId: event.accountId ? String(event.accountId) : null,
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-jobber-hmac-sha256");

    if (!signature || !verifyJobberWebhook(rawBody, signature)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const { topic, itemId, accountId } = extractWebhookEvent(body);

    if (!topic) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (topic === "APP_DISCONNECT") {
      if (accountId) await clearIntegrationByAccountId(accountId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const isQuoteSent = topic.includes("QUOTE") && topic.includes("SENT");
    const isQuoteApproved = topic.includes("QUOTE") && topic.includes("APPROVED");

    if (!isQuoteSent && !isQuoteApproved) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!itemId || !accountId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const integration = await loadIntegrationByAccountId(accountId);
    if (!integration) {
      console.error("Webhook: no matching Jobber integration for account", accountId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const jobberData = await jobberGraphqlWithRefresh(integration, GET_QUOTE_QUERY, {
      id: itemId,
    });

    const quote = (jobberData.json.data as { quote?: Parameters<typeof upsertLeadFromQuote>[1] } | undefined)
      ?.quote;

    if (!quote) {
      console.error("Webhook: Jobber quote fetch failed", jobberData.json);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const outcome = await upsertLeadFromQuote(integration.user_id, quote, {
      forceStatus: isQuoteApproved ? "won" : "open",
    });

    if (outcome.error) {
      console.error("Webhook: lead upsert failed", outcome.error);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
