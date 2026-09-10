import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { withDueStatus } from "@/lib/followups";

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";
const JOBBER_GRAPHQL_VERSION = "2025-04-16";
const JOBBER_TOKEN_URL = "https://api.getjobber.com/api/oauth/token";

export type JobberIntegration = {
  user_id: string;
  jobber_account_id: string | null;
  jobber_access_token: string;
  jobber_refresh_token: string | null;
  token_expires_at: string | null;
};

export const GET_QUOTE_QUERY = `
  query GetQuote($id: EncodedId!) {
    quote(id: $id) {
      id
      quoteNumber
      quoteStatus
      sentAt
      amounts { total }
      client {
        name
        firstName
        lastName
        emails {
          address
        }
      }
    }
  }
`;

export const LIST_QUOTES_QUERY = `
  query ListQuotes {
    quotes(first: 50, sort: { key: CREATED_AT, direction: DESCENDING }) {
      nodes {
        id
        quoteNumber
        quoteStatus
        sentAt
        createdAt
        amounts { total }
        client {
          name
          firstName
          lastName
          emails {
            address
          }
        }
      }
    }
  }
`;

export const LIST_QUOTES_QUERY_FALLBACK = `
  query ListQuotes {
    quotes(first: 50) {
      nodes {
        id
        quoteNumber
        quoteStatus
        sentAt
        createdAt
        amounts { total }
        client {
          name
          firstName
          lastName
          emails {
            address
          }
        }
      }
    }
  }
`;

type GraphqlResult = {
  status: number;
  json: {
    data?: Record<string, unknown>;
    errors?: { message?: string }[];
  };
};

export async function jobberGraphql(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphqlResult> {
  const response = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-JOBBER-GRAPHQL-VERSION": JOBBER_GRAPHQL_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json().catch(() => ({}))) as GraphqlResult["json"];
  return { status: response.status, json };
}

function tokenLooksExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() - 60_000 <= Date.now();
}

function isAuthFailure(result: GraphqlResult) {
  if (result.status === 401) return true;
  const message = JSON.stringify(result.json.errors || "");
  return /invalid token|unauthorized|expired/i.test(message);
}

export async function refreshJobberAccessToken(
  integration: JobberIntegration
): Promise<string | null> {
  if (!integration.jobber_refresh_token) return null;

  const response = await fetch(JOBBER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.JOBBER_CLIENT_ID!,
      client_secret: process.env.JOBBER_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: integration.jobber_refresh_token,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("Jobber refresh failed:", text);
    return null;
  }

  const data = JSON.parse(text) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) return null;

  const expiresAt = data.expires_in
    ? new Date(Date.now() + Number(data.expires_in) * 1000).toISOString()
    : null;

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("integrations")
    .update({
      jobber_access_token: data.access_token,
      jobber_refresh_token: data.refresh_token ?? integration.jobber_refresh_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", integration.user_id);

  if (error) {
    console.error("Failed to save refreshed Jobber tokens:", error);
    return null;
  }

  integration.jobber_access_token = data.access_token;
  if (data.refresh_token) integration.jobber_refresh_token = data.refresh_token;
  integration.token_expires_at = expiresAt;

  return data.access_token;
}

export async function jobberGraphqlWithRefresh(
  integration: JobberIntegration,
  query: string,
  variables?: Record<string, unknown>
) {
  if (tokenLooksExpired(integration.token_expires_at)) {
    await refreshJobberAccessToken(integration);
  }

  let result = await jobberGraphql(integration.jobber_access_token, query, variables);

  if (isAuthFailure(result)) {
    const refreshed = await refreshJobberAccessToken(integration);
    if (refreshed) {
      result = await jobberGraphql(refreshed, query, variables);
    }
  }

  return result;
}

export async function loadIntegrationByUserId(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("integrations")
    .select(
      "user_id, jobber_account_id, jobber_access_token, jobber_refresh_token, token_expires_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.jobber_access_token) return null;
  return data as JobberIntegration;
}

export async function loadIntegrationByAccountId(accountId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("integrations")
    .select(
      "user_id, jobber_account_id, jobber_access_token, jobber_refresh_token, token_expires_at"
    )
    .eq("jobber_account_id", accountId)
    .maybeSingle();

  if (error || !data?.jobber_access_token) return null;
  return data as JobberIntegration;
}

export async function clearIntegrationByAccountId(accountId: string) {
  const admin = getSupabaseAdmin();
  await admin
    .from("integrations")
    .update({
      jobber_access_token: null,
      jobber_refresh_token: null,
      token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("jobber_account_id", accountId);
}

export type JobberQuote = {
  id?: string;
  quoteNumber?: string;
  quoteStatus?: string;
  sentAt?: string | null;
  createdAt?: string | null;
  amounts?: { total?: number | string | null };
  client?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    emails?: { nodes?: { address?: string }[] } | { address?: string }[];
  };
};

export function firstClientEmail(client: JobberQuote["client"]) {
  const emails = client?.emails;
  if (!emails) return null;
  if (Array.isArray(emails)) {
    const address = emails[0]?.address;
    return typeof address === "string" && address.trim() ? address.trim() : null;
  }
  const address = emails.nodes?.[0]?.address;
  return typeof address === "string" && address.trim() ? address.trim() : null;
}

function clientDisplayName(client: JobberQuote["client"]) {
  const name = client?.name?.trim();
  if (name) return name;
  const combined = [client?.firstName, client?.lastName].filter(Boolean).join(" ").trim();
  return combined || "Unknown client";
}

function quoteValue(total: unknown) {
  if (typeof total === "number") return Number.isFinite(total) ? total : null;
  if (total == null) return null;
  const n = Number(total);
  return Number.isFinite(n) ? n : null;
}

export function mapQuoteStatus(quoteStatus?: string): "open" | "won" | "lost" | "skip" {
  const status = (quoteStatus || "").toUpperCase();
  if (status === "DRAFT") return "skip";
  if (status === "APPROVED" || status === "CONVERTED") return "won";
  if (status === "REJECTED" || status === "ARCHIVED") return "lost";
  return "open";
}

export async function upsertLeadFromQuote(
  userId: string,
  quote: JobberQuote,
  options?: { forceStatus?: "open" | "won" | "lost" }
) {
  const jobberQuoteId = quote.id;
  if (!jobberQuoteId) return { error: "Missing quote id" };

  const mapped = withDueStatus(
    options?.forceStatus || mapQuoteStatus(quote.quoteStatus),
    quote.sentAt
  );
  if (mapped === "skip") return { skipped: true };

  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("leads")
    .select("id, status")
    .eq("user_id", userId)
    .eq("jobber_quote_id", jobberQuoteId)
    .maybeSingle();

  const keepExisting =
    existing &&
    ["followed_up", "won", "lost"].includes(existing.status) &&
    mapped === "open";

  const status = keepExisting ? existing.status : mapped;

  const row: Record<string, unknown> = {
    user_id: userId,
    jobber_quote_id: String(jobberQuoteId),
    client_name: clientDisplayName(quote.client),
    client_email: firstClientEmail(quote.client),
    quote_value: quoteValue(quote.amounts?.total),
    status,
    notes: `Imported from Jobber. Quote #${quote.quoteNumber ?? ""}.`.trim(),
  };

  if (quote.sentAt) {
    row.quote_sent_at = quote.sentAt;
  } else if (!existing) {
    row.quote_sent_at = quote.createdAt || new Date().toISOString();
  }

  const { data, error } = await admin
    .from("leads")
    .upsert(row, { onConflict: "user_id,jobber_quote_id" })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Supabase insert error:", error);
    if (error.code === "42P10") {
      const inserted = await admin.from("leads").insert(row).select("id").maybeSingle();
      if (inserted.error) {
        console.error("Supabase insert error:", inserted.error);
        return { error: inserted.error.message };
      }
      if (!inserted.data?.id) {
        return { error: "Insert returned no row. Check service role key and leads columns." };
      }
      return { ok: true, status, created: true };
    }
    return { error: error.message };
  }

  if (!data?.id) {
    console.error("Supabase insert error: upsert returned no row", row);
    return { error: "Upsert returned no row. Check SUPABASE_SERVICE_ROLE_KEY and RLS." };
  }

  return { ok: true, status, created: !existing };
}
