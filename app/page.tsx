import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";
import { PrimaryCta, SIGN_UP_HREF } from "@/components/landing/cta-link";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FaqItem } from "@/components/landing/faq-item";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F1EC] text-zinc-900">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#F3F1EC]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="FollowUp AI home">
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              href="#how-it-works"
              className="hidden min-h-11 items-center whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900 md:inline-flex"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="hidden min-h-11 items-center whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900 md:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="hidden min-h-11 items-center whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900 sm:inline-flex"
            >
              FAQ
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-zinc-500 hover:text-zinc-900"
            >
              Sign in
            </Link>
            <span className="hidden sm:inline-flex">
              <PrimaryCta>Create a free account</PrimaryCta>
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            For HVAC, plumbing, electrical, and similar shops
          </p>
          <h1 className="mt-3 max-w-3xl text-[2rem] font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.12]">
            Stop losing jobs you already quoted.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            You already have the lead. You already sent the estimate. FollowUp AI shows which Jobber quotes still need a
            check-in, drafts a short email, and waits for you to send it.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <PrimaryCta>Create a free account</PrimaryCta>
            <Link href="#how-it-works" className="inline-flex min-h-11 items-center text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline">
              See how it works
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-500">No credit card. You approve every email.</p>

          <div className="mt-8 sm:mt-12">
            <DashboardPreview />
            <p className="mt-3 text-center text-xs text-zinc-400">Product preview — the real queue looks like this after you import sent quotes.</p>
          </div>
        </section>

        {/* ===== Problem ===== */}
        <section id="problem" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              The job did not die. The follow-up never happened.
            </h2>
            <ol className="mt-10 max-w-xl space-y-4 text-base leading-relaxed text-zinc-600">
              <li>A lead comes in.</li>
              <li>You send the quote.</li>
              <li>They say they will think about it.</li>
              <li>The day fills with calls, trucks, and the next estimate.</li>
              <li>Nobody follows up.</li>
            </ol>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-600">
              That is not a sales process problem. It is a busy-week problem. The quote is still sitting there.
            </p>
          </div>
        </section>

        {/* ===== Before / after ===== */}
        <section id="product" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Before and after</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Before</p>
                <p className="mt-3 text-lg font-semibold text-zinc-900">Quotes go quiet after you send them.</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  The estimate is in Jobber. You remember some of them. Others sit until the customer has already hired
                  someone else — or you assume they were not interested.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-white sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">After</p>
                <p className="mt-3 text-lg font-semibold">Follow-ups sit in one queue you can actually work.</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  Sent quotes show up with the amount and how long they have been waiting. After three days they are
                  marked follow-up due. You open a draft, edit it, and send it yourself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Three steps to get started</h2>
            <p className="mt-3 max-w-xl text-base text-zinc-600">
              Nothing emails a customer until you click Send.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-zinc-400">1</p>
                <h3 className="mt-2 text-base font-semibold">Connect Jobber</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Sign in and connect Jobber. Sent quotes import into FollowUp AI. You can also add one by hand while
                  you try it.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">2</p>
                <h3 className="mt-2 text-base font-semibold">See who needs a follow-up</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Open quotes wait three days. Then they move to follow-up due, with the estimate amount and how long it
                  has been sitting.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">3</p>
                <h3 className="mt-2 text-base font-semibold">Draft, edit, send</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  A short check-in is written for that quote. You change anything that sounds off. You send it. Replies
                  go to your login email.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Outcomes ===== */}
        <section id="outcomes" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What you get</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              <li className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="font-semibold text-zinc-900">Keep sent quotes from disappearing</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Due and waiting quotes sit in one list instead of only in Jobber and your memory.
                </p>
              </li>
              <li className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="font-semibold text-zinc-900">Spend less time figuring out what to say</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Open a draft built from the client name and estimate. Edit it before it goes out.
                </p>
              </li>
              <li className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="font-semibold text-zinc-900">Stay organized after you send estimates</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  See who is due, who is still waiting, and who you already followed up with.
                </p>
              </li>
              <li className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="font-semibold text-zinc-900">Give more prospects a reason to reply</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  A short check-in is often the difference between a quiet quote and a conversation. We do not promise
                  they will hire you.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Who it's for / not for ===== */}
        <section id="who" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for shops that live on quotes</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
                <h3 className="text-base font-semibold text-zinc-900">Who this is for</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600">
                  <li>HVAC businesses that send Jobber estimates</li>
                  <li>Plumbing businesses that wait on approvals</li>
                  <li>Electrical businesses with open quotes sitting in a busy week</li>
                  <li>Other small service shops that already use Jobber for quotes</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
                <h3 className="text-base font-semibold text-zinc-900">Who this is not for</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600">
                  <li>Teams that do not follow up on leads or quotes</li>
                  <li>Anyone looking for a full CRM or Jobber replacement</li>
                  <li>Companies that need auto-send, drip campaigns, or sales-team automation</li>
                  <li>Shops that do not use Jobber and do not want to add quotes by hand</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pricing</h2>
            <div className="mt-10 max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Early access</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">Free</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                FollowUp AI is free while we are in early access. There are no paid plans yet. We will not charge you
                without a clear upgrade.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-600">
                <li>Includes Jobber connect and quote import</li>
                <li>Includes a due queue after three days</li>
                <li>Includes drafts you edit and send yourself</li>
              </ul>
              <PrimaryCta className="mt-8">Create a free account</PrimaryCta>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="scroll-mt-20 border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Questions owners usually ask</h2>
            <div className="mt-8 max-w-3xl">
              <FaqItem question="Who is FollowUp AI for?">
                Small service businesses that send quotes in Jobber — HVAC, plumbing, electrical, and similar
                owner-operated shops. If follow-up is the part that slips when the week gets busy, this is for you.
              </FaqItem>
              <FaqItem question="What does FollowUp AI actually do?">
                It imports sent Jobber quotes, marks open ones as follow-up due after three days, writes a short email
                draft, and lets you send it. You can also add a quote by hand.
              </FaqItem>
              <FaqItem question="Does it replace Jobber or my CRM?">
                No. It does not replace Jobber, and it is not a CRM. It only helps you follow up on quotes you already
                sent.
              </FaqItem>
              <FaqItem question="Do I need to change how I currently get leads?">
                No. Keep taking calls and sending estimates the way you do now. FollowUp AI works after the quote is
                sent.
              </FaqItem>
              <FaqItem question="How does the draft help with follow-ups?">
                When you click Draft follow-up, a short check-in is written from the client name and estimate details.
                You can rewrite any of it. Sending always takes your click.
              </FaqItem>
              <FaqItem question="Can I use it for quote follow-ups?">
                Yes. That is the whole product: sent Jobber quotes, a due list, and an email you approve.
              </FaqItem>
              <FaqItem question="How much does it cost?">
                It is free during early access. There is no paid plan and no credit card to create an account.
              </FaqItem>
            </div>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Emails go out through Resend. Until you verify your own sending domain, delivery can be limited. FollowUp
              AI does not connect Gmail. See the{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-800">
                privacy note
              </Link>{" "}
              for what we store.
            </p>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="border-t border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Put last week&apos;s quiet quotes back in front of you.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
              Create an account, connect Jobber, and work the due list. You still decide what goes to the customer.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <PrimaryCta>Create a free account</PrimaryCta>
              <Link href="/login" className="inline-flex min-h-11 items-center text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline">
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-zinc-200/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
          <BrandMark />
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
            <Link href="#product" className="inline-flex min-h-11 items-center hover:text-zinc-800">
              Product
            </Link>
            <Link href="#pricing" className="inline-flex min-h-11 items-center hover:text-zinc-800">
              Pricing
            </Link>
            <Link href="#faq" className="inline-flex min-h-11 items-center hover:text-zinc-800">
              FAQ
            </Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-zinc-800">
              Privacy
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center hover:text-zinc-800">
              Sign in
            </Link>
            <Link href={SIGN_UP_HREF} className="inline-flex min-h-11 items-center hover:text-zinc-800">
              Create account
            </Link>
          </nav>
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} FollowUp AI</p>
        </div>
      </footer>
    </div>
  );
}
