"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";
import { PrimaryCta, SIGN_UP_HREF } from "@/components/landing/cta-link";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FaqItem } from "@/components/landing/faq-item";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [headline, setHeadline] = useState(
    "Stop losing jobs you already quoted."
  );
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);

  useEffect(() => {
    // 1. UTM Detection for dynamic headlines
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    if (source === "reddit") {
      setHeadline("Stop losing jobs while you're busy in the truck.");
    } else if (source === "paid") {
      setHeadline("The easiest way to close open Jobber quotes.");
    }

    // 2. Exit Intent Popup Logic (triggers on mouse leave top of screen)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !popupDismissed) {
        setShowExitPopup(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // 3. Fallback 60-second timer for popup
    const timer = setTimeout(() => {
      if (!popupDismissed) setShowExitPopup(true);
    }, 60000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [popupDismissed]);

  const closePopup = () => {
    setShowExitPopup(false);
    setPopupDismissed(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-200 relative">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            aria-label="FollowUp AI home"
            className="transition-opacity hover:opacity-80"
          >
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-6 md:gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                How it works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                Pricing
              </Link>
              <Link href="#faq" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                FAQ
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
                Sign in
              </Link>
              <span className="hidden sm:inline-flex">
                <PrimaryCta>Create a free account</PrimaryCta>
              </span>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32 lg:px-8 lg:pb-16 flex flex-col items-center text-center border-b border-neutral-100">
          <div className="mx-auto max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-8">
              For HVAC, plumbing & electrical shops
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-7xl min-h-[120px] sm:min-h-[160px]">
              {headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-500">
              You already have the lead. You already sent the estimate. FollowUp
              AI shows which Jobber quotes still need a check-in, drafts a short
              email, and waits for you to send it.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <PrimaryCta>Start 14-Day Free Trial</PrimaryCta>
              <Link
                href="#how-it-works"
                className="text-sm font-semibold leading-6 text-neutral-900 flex items-center gap-2 group"
              >
                See how it works{" "}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
            {/* Risk Reversal under CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-neutral-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Cancel anytime. No questions asked.
              </span>
              <span className="hidden sm:block text-neutral-300">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                No credit card required.
              </span>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl sm:mt-24 w-full">
            <div className="rounded-2xl bg-neutral-50/50 p-2 ring-1 ring-inset ring-neutral-200/50 lg:rounded-3xl lg:p-4">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
                <DashboardPreview />
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-neutral-400">
              Product preview — the real queue looks like this after you import
              sent quotes.
            </p>
          </div>
        </section>

        {/* ===== Trust Signals ===== */}
        <section className="py-10 bg-neutral-50 border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
              Enterprise-grade security & integrations
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale text-neutral-700">
              <div className="flex items-center gap-2 font-bold"><span className="text-xl">🔒</span> 256-Bit SSL</div>
              <div className="flex items-center gap-2 font-bold"><span className="text-xl">🛡️</span> Data Privacy</div>
              <div className="flex items-center gap-2 font-bold"><span className="text-xl">⚡</span> Jobber Integrated</div>
            </div>
          </div>
        </section>

        {/* ===== Problem ===== */}
        <section id="problem" className="scroll-mt-20 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row gap-12 items-start justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                The job did not die. <br /> The follow-up never happened.
              </h2>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                That is not a sales process problem. It is a busy-week problem.
                The quote is still sitting there.
              </p>
            </div>
            <div className="w-full max-w-md bg-neutral-50 rounded-3xl p-8 border border-neutral-100 shadow-sm">
              <ol className="space-y-6 text-base leading-relaxed text-neutral-600 font-medium">
                <li className="flex gap-4 items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-900 text-sm">1</span> A lead comes in.</li>
                <li className="flex gap-4 items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-900 text-sm">2</span> You send the quote.</li>
                <li className="flex gap-4 items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-900 text-sm">3</span> They say they will think about it.</li>
                <li className="flex gap-4 items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-900 text-sm">4</span> The day fills with calls and trucks.</li>
                <li className="flex gap-4 items-center text-rose-600"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm">5</span> Nobody follows up.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* ===== Before / after ===== */}
        <section id="product" className="scroll-mt-20 py-24 sm:py-32 bg-neutral-50 border-t border-neutral-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Before and after
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12 items-stretch">
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 flex flex-col justify-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Before</p>
                <p className="text-2xl font-bold text-neutral-900">Quotes go quiet after you send them.</p>
                <p className="mt-4 text-base leading-relaxed text-neutral-600">
                  The estimate is in Jobber. You remember some of them. Others
                  sit until the customer has already hired someone else — or you
                  assume they were not interested.
                </p>
              </div>
              <div className="rounded-3xl bg-neutral-900 p-8 sm:p-10 flex flex-col justify-center text-white shadow-xl transition-transform hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">After</p>
                <p className="text-2xl font-bold">Follow-ups sit in one queue you can actually work.</p>
                <p className="mt-4 text-base leading-relaxed text-neutral-300">
                  Sent quotes show up with the amount and how long they have
                  been waiting. After three days they are marked follow-up due.
                  You open a draft, edit it, and send it yourself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="scroll-mt-20 py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Three steps to get started
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Nothing emails a customer until you click Send.
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 shadow-sm border border-neutral-100 text-lg font-bold text-neutral-900">1</div>
                <h3 className="text-lg font-semibold text-neutral-900">Connect Jobber</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Sign in and connect Jobber. Sent quotes import into FollowUp
                  AI. You can also add one by hand while you try it.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 shadow-sm border border-neutral-100 text-lg font-bold text-neutral-900">2</div>
                <h3 className="text-lg font-semibold text-neutral-900">See who needs a follow-up</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Open quotes wait three days. Then they move to follow-up due,
                  with the estimate amount and how long it has been sitting.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 shadow-sm border border-neutral-100 text-lg font-bold text-neutral-900">3</div>
                <h3 className="text-lg font-semibold text-neutral-900">Draft, edit, send</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  A short check-in is written for that quote. You change
                  anything that sounds off. You send it. Replies go to your
                  login email.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing" className="scroll-mt-20 py-24 sm:py-32 bg-neutral-50 border-y border-neutral-200">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Start recovering lost quotes today. Upgrade when you need more volume.
              </p>

              {/* Billing Toggle */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-neutral-900' : 'text-neutral-500'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAnnual ? 'bg-neutral-900' : 'bg-neutral-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  Annual
                  <span className="text-green-700 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
              {/* Tier 1 */}
              <div className="rounded-3xl border border-neutral-200 p-8 bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">Starter</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-neutral-900">
                  <span>$0</span>
                  <span className="ml-1 text-xl font-medium text-neutral-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">For solo operators testing the waters.</p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-600">
                  <li className="flex gap-2"><span>✓</span> 50 active quotes tracked</li>
                  <li className="flex gap-2"><span>✓</span> Jobber integration</li>
                  <li className="flex gap-2"><span>✓</span> Basic AI drafts</li>
                </ul>
                <Link href={SIGN_UP_HREF} className="mt-8 block w-full rounded-lg bg-neutral-100 px-3 py-3 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Tier 2 (Recommended) */}
              <div className="rounded-3xl border-2 border-neutral-900 p-8 bg-white shadow-xl relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 px-4 py-1 text-xs font-bold text-white uppercase tracking-wide whitespace-nowrap">
                  Most Popular
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Growth</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-neutral-900">
                  <span>${isAnnual ? "23" : "29"}</span>
                  <span className="ml-1 text-xl font-medium text-neutral-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">For busy shops closing more jobs.</p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-600 font-medium">
                  <li className="flex gap-2 text-neutral-900"><span>✓</span> Unlimited quotes tracked</li>
                  <li className="flex gap-2 text-neutral-900"><span>✓</span> Custom sending domain</li>
                  <li className="flex gap-2 text-neutral-900"><span>✓</span> Daily owner summary emails</li>
                </ul>
                <PrimaryCta className="w-full justify-center mt-8">Start 14-Day Free Trial</PrimaryCta>
                <p className="mt-3 text-center text-xs text-neutral-500">Cancel anytime. No questions asked.</p>
              </div>

              {/* Tier 3 */}
              <div className="rounded-3xl border border-neutral-200 p-8 bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">Teams</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-neutral-900">
                  <span>${isAnnual ? "63" : "79"}</span>
                  <span className="ml-1 text-xl font-medium text-neutral-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">For multi-truck operations.</p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-600">
                  <li className="flex gap-2"><span>✓</span> Everything in Growth</li>
                  <li className="flex gap-2"><span>✓</span> 10 team member seats</li>
                  <li className="flex gap-2"><span>✓</span> Multi-location Jobber sync</li>
                </ul>
                <Link href={SIGN_UP_HREF} className="mt-8 block w-full rounded-lg bg-neutral-100 px-3 py-3 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="scroll-mt-20 py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Questions owners usually ask
              </h2>
            </div>
            <div className="space-y-4">
              <FaqItem question="Will this send automated spam to my customers?">
                No. FollowUp AI never emails a customer without your permission. It drafts the email and waits for you to click 'Send'.
              </FaqItem>
              <FaqItem question="Does it replace Jobber or my CRM?">
                No. It connects securely to Jobber. You still create and manage your quotes in Jobber; we just track which ones need a follow-up.
              </FaqItem>
              <FaqItem question="What if the customer email in Jobber is wrong?">
                You can edit the draft and the recipient email address directly inside the FollowUp AI dashboard before sending.
              </FaqItem>
              <FaqItem question="How hard is it to set up?">
                It takes 3 clicks. Create an account, click 'Connect Jobber', and authorize the app. Your previous 50 quotes import automatically.
              </FaqItem>
              <FaqItem question="How do I know the emails are actually working?">
                Replies go directly to your personal login email inbox. You'll see the customer's response right next to your other emails.
              </FaqItem>
            </div>
            <div className="mt-12 rounded-2xl bg-neutral-50 border border-neutral-100 p-6 text-center">
              <p className="text-sm leading-relaxed text-neutral-500">
                Emails go out through Resend. Until you verify your own sending
                domain, delivery can be limited. FollowUp AI does not connect
                Gmail. See the{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                >
                  privacy note
                </Link>{" "}
                for what we store.
              </p>
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="py-24 sm:py-32 bg-neutral-900 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Put last week&apos;s quiet quotes back in front of you.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
              Create an account, connect Jobber, and work the due list. You
              still decide what goes to the customer.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <PrimaryCta>Start 14-Day Free Trial</PrimaryCta>
              <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-white flex items-center gap-2 group hover:text-neutral-300 transition-colors"
              >
                I already have an account{" "}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-white py-12 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center sm:flex-row sm:justify-between gap-6">
          <BrandMark />
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-neutral-500">
            <Link href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-neutral-900 transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-neutral-900 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-neutral-900 transition-colors">Sign in</Link>
          </nav>
          <div className="text-center sm:text-right">
            <a href="mailto:support@followupai.com" className="block text-sm font-medium text-neutral-900 hover:underline mb-1">
              support@followupai.com
            </a>
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} FollowUp AI
            </p>
          </div>
        </div>
      </footer>

      {/* ===== Exit Intent Modal ===== */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Wait! Don't leave empty-handed.</h3>
            <p className="text-neutral-600 mb-6 text-sm">Get our free guide: "The 3-Step Follow-Up Sequence That Closes 40% More HVAC Jobs."</p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks! Check your email.");
                closePopup();
              }}
              className="flex flex-col gap-3"
            >
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <button 
                type="submit" 
                className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                Send me the guide
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}