"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Settings() {
  const router = useRouter();
  const supabase = createClient();
  const [jobberConnected, setJobberConnected] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhooks/jobber`);
    supabase.auth.getUser().then(({ data }) => {
      setAccountEmail(data.user?.email ?? null);
    });
    fetch("/api/jobber/status")
      .then((res) => res.json())
      .then((data) => setJobberConnected(Boolean(data.connected)))
      .catch(() => setJobberConnected(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F1EC] text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-[#F3F1EC]/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            FollowUp AI
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Jobber, sending, and webhooks. No billing yet — get one real quote loop working first.
        </p>

        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-900">Jobber</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {jobberConnected
              ? "Connected. Reconnect if imports start failing (usually an expired login)."
              : "Not connected. Quotes will not import until you connect."}
          </p>
          <button
            onClick={() => {
              window.location.href = "/api/jobber/connect";
            }}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {jobberConnected ? "Reconnect Jobber" : "Connect Jobber"}
          </button>
        </section>

        <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-900">Webhook (so you stop clicking Import)</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            In the Jobber developer app, add this URL for <span className="font-medium text-zinc-700">QUOTE_SENT</span>.
            Jobber cannot reach localhost — this only works on your Vercel domain.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 truncate rounded-lg bg-[#F3F1EC] px-3 py-2 text-xs text-zinc-700">
              {webhookUrl || "…"}
            </code>
            <button
              type="button"
              onClick={async () => {
                if (!webhookUrl) return;
                await navigator.clipboard.writeText(webhookUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-900">Sending email</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Mail goes out through Resend when you click Send. Client replies go to{" "}
            <span className="font-medium text-zinc-700">{accountEmail || "your login email"}</span>.
            Verify your own domain in Resend so customers actually receive the first send (the test sender often only
            delivers to your Resend inbox).
          </p>
        </section>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="mt-8 text-sm text-zinc-500 hover:text-zinc-900"
        >
          Sign out
        </button>
      </main>
    </div>
  );
}
