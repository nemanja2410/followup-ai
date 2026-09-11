"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markOpenLeadsDue } from "@/lib/followups";

type Lead = {
  id: string;
  client_name: string;
  client_email: string | null;
  status: string;
  notes: string | null;
  quote_value: number | null;
  quote_sent_at: string | null;
  last_followed_up_at: string | null;
};

type QueueFilter = "attention" | "all";

function money(value: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function daysSince(iso: string | null) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

function ageLabel(iso: string | null) {
  const days = daysSince(iso);
  if (days === null) return "Date unknown";
  if (days === 0) return "Sent today";
  if (days === 1) return "Sent yesterday";
  return `Sent ${days} days ago`;
}

function statusRank(status: string) {
  if (status === "due") return 0;
  if (status === "open") return 1;
  if (status === "followed_up") return 2;
  if (status === "won") return 3;
  if (status === "lost") return 4;
  return 5;
}

function sortLeads(leads: Lead[]) {
  return [...leads].sort((a, b) => {
    const rank = statusRank(a.status) - statusRank(b.status);
    if (rank !== 0) return rank;
    const aTime = a.quote_sent_at ? new Date(a.quote_sent_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.quote_sent_at ? new Date(b.quote_sent_at).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    due: {
      label: "Follow-up due",
      className: "bg-amber-50 text-amber-800 ring-amber-200",
    },
    open: {
      label: "Waiting",
      className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    },
    followed_up: {
      label: "Followed up",
      className: "bg-sky-50 text-sky-800 ring-sky-200",
    },
    won: {
      label: "Won",
      className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    },
    lost: {
      label: "Lost",
      className: "bg-zinc-50 text-zinc-400 ring-zinc-200",
    },
  };
  const item = map[status] ?? map.open;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${item.className}`}
    >
      {item.label}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [jobberConnected, setJobberConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<QueueFilter>("attention");

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [aiMessage, setAiMessage] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "Jobber_Connected") {
      showToast("Jobber connected.", "success");
      window.history.replaceState({}, document.title, "/dashboard");
    } else if (params.get("error")) {
      showToast("Could not connect Jobber. Try again.", "error");
      window.history.replaceState({}, document.title, "/dashboard");
    }

    fetchLeads();
    fetchJobberStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = async () => {
    setIsFetching(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    await markOpenLeadsDue(supabase);

    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
    setIsFetching(false);
  };

  const fetchJobberStatus = async () => {
    try {
      const response = await fetch("/api/jobber/status");
      const data = await response.json();
      setJobberConnected(Boolean(data.connected));
    } catch {
      setJobberConnected(false);
    }
  };

  const handleConnectJobber = () => {
    window.location.href = "/api/jobber/connect";
  };

  const handleImportQuotes = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/jobber/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || "Could not import quotes.", "error");
        return;
      }
      showToast(
        data.imported === 0 && data.updated > 0
          ? `Jobber quotes were already in FollowUp AI (${data.updated} updated). Draft quotes are skipped until sent.`
          : data.imported === 0
            ? data.skipped
              ? `No new sent quotes. ${data.skipped} draft(s) skipped until you send them in Jobber.`
              : "No new sent quotes to import."
            : `Imported ${data.imported} new quote${data.imported === 1 ? "" : "s"}.`,
        "success"
      );
      await fetchLeads();
    } catch {
      showToast("Network error.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast("You must be signed in.", "error");
      setIsSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("leads").insert([
      {
        client_name: newName,
        client_email: newEmail,
        status: "open",
        notes: newNotes,
        user_id: user.id,
        quote_sent_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      showToast("Could not add the quote.", "error");
    } else {
      setNewName("");
      setNewEmail("");
      setNewNotes("");
      setIsAddModalOpen(false);
      showToast("Quote added.", "success");
      fetchLeads();
    }
    setIsSaving(false);
  };

  const handleDraftFollowup = async (lead: Lead) => {
    setActiveLead(lead);
    setIsPanelOpen(true);
    setIsGenerating(true);
    setAiMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.client_name,
          notes: lead.notes || "No extra context.",
          quoteValue: lead.quote_value,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAiMessage("");
        if (response.status === 401) {
          showToast("Your session expired. Sign in again.", "error");
        } else if (response.status === 503) {
          showToast("The draft service is busy. Try again in a moment.", "error");
        } else {
          showToast("Could not generate a draft. Try again.", "error");
        }
        return;
      }

      setAiMessage(data.message || "Could not generate a draft.");
    } catch {
      setAiMessage("");
      showToast("Could not reach the draft service.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // POPRAVLJENA FUNKCIJA OVDJE
  const handleSendEmail = async () => {
    if (!activeLead) return;
    
    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeLead.id,
          email: activeLead.client_email,
          name: activeLead.client_name,
          message: aiMessage,
        }),
      });

      const data = await response.json();
      if (response.status === 409) {
        showToast(data.error || "This quote is no longer waiting on a follow-up. Refresh the list.", "error");
        setIsPanelOpen(false);
        fetchLeads();
        return;
      }
      if (response.ok && data.success) {
        await supabase
          .from("leads")
          .update({
            status: "followed_up",
            last_followed_up_at: new Date().toISOString(),
          })
          .eq("id", activeLead.id);

        fetchLeads();
        setIsPanelOpen(false);
        showToast(`Sent to ${activeLead.client_email}`, "success");
      } else {
        showToast(data.error || "Could not send the email.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const dueLeads = leads.filter((l) => l.status === "due");
  const openLeads = leads.filter((l) => l.status === "open");
  const attentionLeads = leads.filter((l) => l.status === "due" || l.status === "open");
  const dueValue = dueLeads.reduce((sum, l) => sum + Number(l.quote_value || 0), 0);
  const openValue = openLeads.reduce((sum, l) => sum + Number(l.quote_value || 0), 0);

  const visibleLeads = useMemo(() => {
    const source = filter === "attention" ? attentionLeads : leads;
    return sortLeads(source);
  }, [filter, leads, attentionLeads]);

  const canDraft = (status: string) => status === "due" || status === "open" || status === "followed_up";

  return (
    <div className="min-h-screen">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-sm ${toast.type === "success"
            ? "border-emerald-200 bg-white text-emerald-900"
            : "border-red-200 bg-white text-red-800"
            }`}
        >
          {toast.message}
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#F3F1EC]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">FollowUp AI</span>
          </div>

          <div className="flex items-center gap-3">
            {jobberConnected ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Jobber connected
              </span>
            ) : null}
            <Link href="/settings" className="text-sm text-zinc-500 transition hover:text-zinc-900">
              Settings
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
              className="text-sm text-zinc-500 transition hover:text-zinc-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Today</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.75rem]">
              {dueLeads.length > 0
                ? `${dueLeads.length} quote${dueLeads.length === 1 ? "" : "s"} need a follow-up`
                : attentionLeads.length > 0
                  ? "Nothing overdue yet — waiting quotes become due after 3 days"
                  : "No quotes waiting"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              {dueLeads.length > 0
                ? `${money(dueValue)} in estimates has gone quiet. Review a draft, then send.`
                : "Quotes still waiting after 3 days show up as follow-up due. You always send the email yourself."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {jobberConnected && (
              <button
                onClick={handleImportQuotes}
                disabled={isSyncing}
                className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
              >
                {isSyncing ? "Importing…" : "Import from Jobber"}
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
            >
              Add manually
            </button>
          </div>
        </div>

        {!jobberConnected && (
          <div className="mb-8 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Connect Jobber to fill this list</p>
              <p className="mt-1 text-sm text-zinc-500">
                Sent quotes appear here automatically. You can also add one by hand while you test.
              </p>
            </div>
            <button
              onClick={handleConnectJobber}
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Connect Jobber
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Follow-up due</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{dueLeads.length}</p>
            <p className="mt-1 text-xs text-zinc-500">{money(dueValue)} sitting</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">Waiting on a reply</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{openLeads.length}</p>
            <p className="mt-1 text-xs text-zinc-500">{money(openValue)} still open</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500">In FollowUp AI</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{leads.length}</p>
            <p className="mt-1 text-xs text-zinc-500">Including followed up and closed</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
              <button
                onClick={() => setFilter("attention")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filter === "attention" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                Needs attention
                <span className="ml-1.5 text-zinc-400">{attentionLeads.length}</span>
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${filter === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                All quotes
                <span className="ml-1.5 text-zinc-400">{leads.length}</span>
              </button>
            </div>
          </div>

          {isFetching ? (
            <div className="px-4 py-16 text-center text-sm text-zinc-500">Loading quotes…</div>
          ) : visibleLeads.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-zinc-900">
                {filter === "attention" && leads.length > 0
                  ? "Nothing needs a follow-up right now"
                  : "No quotes yet"}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
                {filter === "attention" && leads.length > 0
                  ? "Switch to All quotes to see followed-up and closed work."
                  : jobberConnected
                    ? "Import sent quotes from Jobber, or add one manually."
                    : "Connect Jobber, or add a quote manually to try a draft."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Estimate</th>
                    <th className="px-4 py-3 font-medium">Age</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-zinc-900">{lead.client_name}</div>
                        <div className="text-xs text-zinc-500">
                          {lead.client_email || "No email on file"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums text-zinc-900">
                        {money(lead.quote_value)}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600">{ageLabel(lead.quote_sent_at)}</td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={lead.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {canDraft(lead.status) ? (
                          <button
                            onClick={() => handleDraftFollowup(lead)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${lead.status === "due"
                              ? "bg-zinc-900 text-white hover:bg-zinc-800"
                              : "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                              }`}
                          >
                            {lead.status === "followed_up" ? "Draft again" : "Draft follow-up"}
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAddLead}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-base font-semibold text-zinc-900">Add a quote manually</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Useful for testing. Use an inbox you can actually receive (often your Resend account email).
            </p>
            <div className="mt-5 space-y-3">
              <input
                required
                placeholder="Client name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-2"
              />
              <input
                required
                type="email"
                placeholder="Client email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-2"
              />
              <textarea
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-2"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-sm text-zinc-500">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isPanelOpen && activeLead && (
        <>
          <div
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[2px]"
            onClick={() => setIsPanelOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Follow-up</p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-900">{activeLead.client_name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {money(activeLead.quote_value)} · {ageLabel(activeLead.quote_sent_at)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {activeLead.client_email || "Add an email before sending"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-sm text-zinc-400 hover:text-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <label className="text-xs font-medium text-zinc-500">Message</label>
              {isGenerating ? (
                <p className="mt-4 text-sm text-zinc-500">Writing a short draft…</p>
              ) : (
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="mt-2 h-56 w-full resize-none rounded-xl border border-zinc-200 bg-[#FBFBF9] p-4 text-sm leading-relaxed text-zinc-800 outline-none focus:border-zinc-400"
                />
              )}
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Edit anything that sounds off. Replies go to your FollowUp AI login email, not Jobber.
              </p>
            </div>

            <div className="border-t border-zinc-100 px-6 py-4">
              <button
                onClick={handleSendEmail}
                disabled={isGenerating || isSending || !aiMessage || !activeLead.client_email}
                className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? "Sending…" : "Send follow-up"}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}