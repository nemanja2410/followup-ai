"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Settings() {
  const router = useRouter();
  const supabase = createClient();
  const [jobberConnected, setJobberConnected] = useState(false);

  useEffect(() => {
    fetch("/api/jobber/status")
      .then((res) => res.json())
      .then((data) => setJobberConnected(Boolean(data.connected)))
      .catch(() => setJobberConnected(false));
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
        <p className="mt-2 text-sm text-zinc-500">Account and Jobber. Billing is not enabled yet.</p>

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
          <h2 className="text-sm font-medium text-zinc-900">Sending email</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Follow-ups send through Resend when you click Send. Until a sending domain is verified, messages may only
            arrive at the inbox tied to your Resend account. We do not offer Stripe billing or Gmail sync yet.
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
