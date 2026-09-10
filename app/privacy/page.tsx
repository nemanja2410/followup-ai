import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F3F1EC] text-zinc-900">
      <header className="border-b border-zinc-200/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            FollowUp AI
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy note</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated September 2026. This is a short, plain-language note — not a substitute for a lawyer-reviewed policy if you scale.</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <p>
            FollowUp AI helps home-service businesses follow up on Jobber quotes. We store the minimum needed to run
            that product.
          </p>
          <p>
            <strong className="font-medium text-zinc-900">Account.</strong> Email and password are handled by Supabase
            Auth.
          </p>
          <p>
            <strong className="font-medium text-zinc-900">Jobber.</strong> If you connect Jobber, we store access tokens
            so we can read quotes, plus quote fields such as client name, email, amount, and sent date.
          </p>
          <p>
            <strong className="font-medium text-zinc-900">Email.</strong> When you click send, the message is delivered
            through Resend to the client address on that quote.
          </p>
          <p>
            <strong className="font-medium text-zinc-900">AI drafts.</strong> Quote context (name, notes, amount) is sent
            to Google Gemini to generate a draft. We do not use that to auto-email anyone.
          </p>
          <p>
            We do not sell your data. We do not run ads on it. You can ask us to delete your account and related quote
            rows.
          </p>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-zinc-500 hover:text-zinc-900">
          ← Back
        </Link>
      </main>
    </div>
  );
}
