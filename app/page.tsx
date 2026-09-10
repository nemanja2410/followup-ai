import Link from "next/link";

function PreviewRow({
  name,
  amount,
  age,
  due,
}: {
  name: string;
  amount: string;
  age: string;
  due?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-900">{name}</p>
        <p className="text-xs text-zinc-500">{age}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium tabular-nums text-zinc-900">{amount}</p>
        {due ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
            Follow-up due
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
            Waiting
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F1EC] text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#F3F1EC]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight">FollowUp AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900">
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">For Jobber businesses</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.1]">
            Follow up on sent quotes before they go cold.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            FollowUp AI watches quotes you already sent in Jobber. After three days with no reply, it puts them in a
            queue, drafts a short email, and you click send.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login?mode=signup"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Create a free account
            </Link>
            <p className="text-sm text-zinc-500">No credit card. You approve every email.</p>
          </div>

          <div className="mt-14 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Needs attention</p>
            </div>
            <PreviewRow name="Sarah Jenkins" amount="$12,500" age="Sent 5 days ago" due />
            <PreviewRow name="Marcus Thorne" amount="$8,200" age="Sent 3 days ago" due />
            <PreviewRow name="Elena Rostova" amount="$3,400" age="Sent yesterday" />
          </div>
        </section>

        <section className="border-t border-zinc-200/80">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-zinc-400">1</p>
              <h2 className="mt-2 text-base font-semibold">Connect Jobber</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Sign in and connect your Jobber account. Sent quotes show up in FollowUp AI.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">2</p>
              <h2 className="mt-2 text-base font-semibold">See who is due</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                After three days, an open quote moves to follow-up due — with the estimate amount and how long it has
                been sitting.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">3</p>
              <h2 className="mt-2 text-base font-semibold">Draft, edit, send</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                AI writes a short check-in. You edit it. You send it. Nothing goes out without you.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/80">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">What this is — and is not</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <p className="text-sm font-medium text-zinc-900">Built for</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600">
                  <li>Home-service teams that already send quotes in Jobber</li>
                  <li>Owners who lose work because the follow-up never happened</li>
                  <li>A simple queue: due, draft, send</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <p className="text-sm font-medium text-zinc-900">Not built for</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600">
                  <li>Auto-sending emails to clients without your click</li>
                  <li>Gmail sync, calendars, lead scoring, or sales-team drip campaigns</li>
                  <li>Replacing Jobber — it only helps with quotes you already sent</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/80">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
              FollowUp AI is free while we are in early access. No paid plans yet — we will not charge you without a
              clear upgrade.
            </p>
            <Link
              href="/login?mode=signup"
              className="mt-6 inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Get started free
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200/80">
          <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
            <div>
              <h3 className="text-sm font-medium text-zinc-900">Will it email my clients by itself?</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                No. The app marks quotes as due and drafts a message. Sending always takes your click.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900">Whose inbox does the email come from?</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Emails are sent through Resend. Until you verify your own domain, delivery may be limited (often only
                to your own address). We do not connect Gmail.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900">What data do you store?</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Your login, Jobber connection tokens, and quote details needed to follow up (name, email, amount,
                status). See the{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  privacy note
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FollowUp AI</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-800">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-zinc-800">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
