import type { SupabaseClient } from "@supabase/supabase-js";

/** Quotes still `open` after this many hours become `due`. Customers are never emailed automatically. */
export const FOLLOW_UP_AFTER_HOURS = 72;

export function followUpCutoffIso(now = new Date()) {
  return new Date(now.getTime() - FOLLOW_UP_AFTER_HOURS * 60 * 60 * 1000).toISOString();
}

export function isPastFollowUpWindow(sentAt: string | null | undefined, now = new Date()) {
  if (!sentAt) return false;
  const sent = new Date(sentAt).getTime();
  if (Number.isNaN(sent)) return false;
  return sent <= now.getTime() - FOLLOW_UP_AFTER_HOURS * 60 * 60 * 1000;
}

export function withDueStatus(status: string, sentAt: string | null | undefined) {
  if (status === "open" && isPastFollowUpWindow(sentAt)) return "due";
  return status;
}

export type DueLeadRow = {
  id: string;
  user_id: string;
  quote_value: number | null;
};

export async function markOpenLeadsDue(client: SupabaseClient) {
  const { data, error } = await client
    .from("leads")
    .update({ status: "due" })
    .eq("status", "open")
    .lte("quote_sent_at", followUpCutoffIso())
    .select("id, user_id, quote_value");

  return { count: data?.length ?? 0, leads: (data ?? []) as DueLeadRow[], error };
}
