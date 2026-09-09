"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function LandingPage() {
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [detectedLang, setDetectedLang] = useState("en");
  const [utmSource, setUtmSource] = useState("direct");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [popupSubmitted, setPopupSubmitted] = useState(false);

  useEffect(() => {
    const lang = navigator.language || "en-US";
    if (lang.startsWith("fr")) setDetectedLang("fr");
    else if (lang.startsWith("es")) setDetectedLang("es");
    else if (lang.startsWith("it")) setDetectedLang("it");
    else setDetectedLang("en");

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Europe")) setCurrencySymbol("€");
    else if (tz.includes("London")) setCurrencySymbol("£");
    else setCurrencySymbol("$");

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    if (source) setUtmSource(source);

    const timer = setTimeout(() => {
      setIsPopupOpen(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  const getHeadline = () => {
    if (utmSource === "reddit") return "Stop losing freelance leads because you forgot to check in.";
    if (utmSource === "paid") return "Turn cold leads into booked meetings with AI-assisted follow-ups.";
    return "Close more leads without manually tracking who to email next.";
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black antialiased">
      {/* ━━━━━━━━━━━━━━━━━━━━ NAVIGATION ━━━━━━━━━━━━━━━━━━━━ */}
      <header className="border-b border-zinc-900 sticky top-0 z-40 bg-black/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight text-white">Followup AI</div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition min-h-[44px] flex items-center"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━ */}
      <main>
        <section className="pt-16 pb-12 md:pt-24 md:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-white leading-[1.1]">
            {getHeadline()}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Followup AI helps consultants and independent professionals track their leads, draft personalized follow-ups with AI, and send them from one simple dashboard.
          </p>
          <div className="mt-8 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-full sm:w-auto bg-white text-black font-semibold px-8 py-4 rounded-xl hover:bg-zinc-200 transition text-base md:text-lg min-h-[44px]"
            >
              Get started for free
            </Link>
            <p className="mt-4 text-xs text-zinc-500">No credit card required.</p>
          </div>

          {/* Hero Product UI Preview Mockup */}
          <div className="mt-12 w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-2 sm:p-4 shadow-2xl overflow-hidden text-left">
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Leads</span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">Ana Marković</p>
                    <p className="text-xs text-zinc-400">ana@example.com</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                      Pending Follow-up
                    </span>
                    <button className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-700 min-h-[44px] sm:min-h-0 pointer-events-none">
                      Send AI Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ PROBLEM SECTION ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-900">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your leads aren't rejecting you. They're just falling off your radar.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl">
              <h3 className="font-semibold text-white text-base mb-3">The "I'll email them later" trap</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">You finish a great consultation, promise to touch base next month, and then get busy. By the time you remember, they've hired someone else.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl">
              <h3 className="font-semibold text-white text-base mb-3">Spreadsheet anxiety</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">You waste mental energy staring at rows of names, trying to remember what you last spoke about and who actually needs an email today.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl">
              <h3 className="font-semibold text-white text-base mb-3">Staring at a blank draft</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Even when you remember to follow up, you spend 15 minutes overthinking how to sound casual but professional in the check-in email.</p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ BEFORE / AFTER ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-900">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-zinc-950 border border-red-500/20 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-red-400 font-semibold mb-6 text-sm uppercase tracking-wider">The Old Way</h3>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-0.5">✕</span> 
                  Relying on memory or messy notes to know who to email.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-0.5">✕</span> 
                  Overthinking the perfect email draft for 20 minutes.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-0.5">✕</span> 
                  Losing thousands in potential revenue to silence.
                </li>
              </ul>
            </div>
            <div className="bg-zinc-950 border border-emerald-500/20 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-emerald-400 font-semibold mb-6 text-sm uppercase tracking-wider">With Followup AI</h3>
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span> 
                  One clean dashboard showing exactly who needs attention.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span> 
                  AI instantly drafts a context-aware message based on their status.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span> 
                  Review the draft and click send without leaving the app.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-900 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-16">It is literally this simple.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-4">
              <div className="text-5xl font-extrabold text-zinc-800 mb-6">1</div>
              <h3 className="font-semibold text-white text-lg mb-3">Add the lead</h3>
              <p className="text-sm text-zinc-400">Drop their name and email into your secure Supabase dashboard.</p>
            </div>
            <div className="p-4">
              <div className="text-5xl font-extrabold text-zinc-800 mb-6">2</div>
              <h3 className="font-semibold text-white text-lg mb-3">Click Generate</h3>
              <p className="text-sm text-zinc-400">Gemini AI reads their status and instantly drafts a natural check-in message.</p>
            </div>
            <div className="p-4">
              <div className="text-5xl font-extrabold text-zinc-800 mb-6">3</div>
              <h3 className="font-semibold text-white text-lg mb-3">Click Send</h3>
              <p className="text-sm text-zinc-400">Review the draft, hit send, and the email is delivered via Resend API.</p>
            </div>
          </div>
          <div className="mt-12">
             <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-white text-black font-semibold px-8 py-4 rounded-xl hover:bg-zinc-200 transition text-base min-h-[44px]"
            >
              Get started for free
            </Link>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ BUILT FOR SPEED ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-900">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Everything you need. Nothing you don't.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Followup AI is stripped down to the absolute essentials, running on premium infrastructure so you can focus on your clients, not the software.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-xl mb-4">⚡</div>
              <h3 className="text-sm font-semibold text-white mb-2">Lightning-fast AI</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Powered by Gemini API, personalized drafts are generated almost instantly so you never have to wait.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-xl mb-4">🔒</div>
              <h3 className="text-sm font-semibold text-white mb-2">Secure Database</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Your leads are safely stored in a dedicated PostgreSQL database powered by Supabase.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-xl mb-4">✉️</div>
              <h3 className="text-sm font-semibold text-white mb-2">Direct Delivery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Emails are delivered reliably and securely via the Resend API straight to your client's inbox.</p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ PRICING ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Never lose a lead because you forgot to follow up.
            </h2>
            <p className="text-sm text-zinc-400">
              Choose the plan that fits your workflow. Start free, upgrade when your follow-up volume grows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            
            {/* STARTER TIER */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col h-full hover:border-zinc-700 transition duration-300">
              <div className="mb-6">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{currencySymbol}29</span>
                  <span className="text-sm font-medium text-zinc-500">/ month</span>
                </div>
                <p className="text-sm text-zinc-400 mt-4">For solo users and light usage.</p>
              </div>
              
              <Link href="/dashboard" className="w-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-xl py-3.5 text-sm font-semibold transition mb-8">
                Start Free
              </Link>
              
              <ul className="space-y-4 text-sm text-zinc-300 flex-1">
                <li className="flex items-start gap-3"><CheckIcon /> Up to 100 active leads</li>
                <li className="flex items-start gap-3"><CheckIcon /> AI-generated follow-ups</li>
                <li className="flex items-start gap-3"><CheckIcon /> Email follow-up sequences</li>
                <li className="flex items-start gap-3"><CheckIcon /> Lead pipeline</li>
                <li className="flex items-start gap-3"><CheckIcon /> Gmail integration</li>
                <li className="flex items-start gap-3"><CheckIcon /> Basic analytics</li>
                <li className="flex items-start gap-3"><CheckIcon /> Basic AI personalization</li>
                <li className="flex items-start gap-3"><CheckIcon /> Standard support</li>
              </ul>
            </div>

            {/* PRO TIER (MOST POPULAR) */}
            <div className="bg-zinc-900/50 border border-zinc-600 rounded-3xl p-8 flex flex-col h-full relative transform lg:-translate-y-4 shadow-2xl shadow-zinc-900/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-xs font-bold tracking-widest text-white uppercase mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{currencySymbol}49</span>
                  <span className="text-sm font-medium text-zinc-400">/ month</span>
                </div>
                <p className="text-sm text-zinc-300 mt-4">AI runs your follow-up process.</p>
              </div>
              
              <Link href="/dashboard" className="w-full flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded-xl py-3.5 text-sm font-semibold transition shadow-sm mb-8">
                Start Free
              </Link>
              
              <ul className="space-y-4 text-sm text-zinc-200 flex-1">
                <li className="flex items-start gap-3"><CheckIcon /> <strong>Up to 500 active leads</strong></li>
                <li className="flex items-start gap-3"><CheckIcon /> Everything in Starter</li>
                <li className="flex items-start gap-3"><CheckIcon /> Advanced AI follow-ups</li>
                <li className="flex items-start gap-3"><CheckIcon /> AI analysis of previous conversations</li>
                <li className="flex items-start gap-3"><CheckIcon /> Automatic follow-up timing</li>
                <li className="flex items-start gap-3"><CheckIcon /> Custom workflows</li>
                <li className="flex items-start gap-3"><CheckIcon /> Multiple follow-up sequences</li>
                <li className="flex items-start gap-3"><CheckIcon /> Calendar integration</li>
                <li className="flex items-start gap-3"><CheckIcon /> Lead scoring</li>
                <li className="flex items-start gap-3"><CheckIcon /> Advanced analytics</li>
                <li className="flex items-start gap-3"><CheckIcon /> Higher AI usage limits</li>
              </ul>
            </div>

            {/* BUSINESS TIER */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col h-full hover:border-zinc-700 transition duration-300">
              <div className="mb-6">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2">Business</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{currencySymbol}99</span>
                  <span className="text-sm font-medium text-zinc-500">/ month</span>
                </div>
                <p className="text-sm text-zinc-400 mt-4">For businesses and teams with higher volume.</p>
              </div>
              
              <Link href="/dashboard" className="w-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-xl py-3.5 text-sm font-semibold transition mb-8">
                Start Free
              </Link>
              
              <ul className="space-y-4 text-sm text-zinc-300 flex-1">
                <li className="flex items-start gap-3"><CheckIcon /> <strong>High-volume / unlimited leads</strong></li>
                <li className="flex items-start gap-3"><CheckIcon /> Everything in Pro</li>
                <li className="flex items-start gap-3"><CheckIcon /> Multiple team members</li>
                <li className="flex items-start gap-3"><CheckIcon /> Team inbox</li>
                <li className="flex items-start gap-3"><CheckIcon /> Advanced automations</li>
                <li className="flex items-start gap-3"><CheckIcon /> Priority AI processing</li>
                <li className="flex items-start gap-3"><CheckIcon /> Advanced lead scoring</li>
                <li className="flex items-start gap-3"><CheckIcon /> Custom workflows</li>
                <li className="flex items-start gap-3"><CheckIcon /> API / integrations</li>
                <li className="flex items-start gap-3"><CheckIcon /> Priority support</li>
                <li className="flex items-start gap-3"><CheckIcon /> Highest AI usage limits</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ FAQ ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-zinc-900">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">Answers to your questions</h2>
          <div className="space-y-4">
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-xl">
              <h3 className="font-semibold text-white text-base mb-2">Will the emails sound like a generic robot?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">No. We use Gemini AI to draft concise messages based on the specific status you assign to the lead. The draft appears in a modal where you can review and edit it before sending.</p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-xl">
              <h3 className="font-semibold text-white text-base mb-2">Do I need to connect my own email server?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">No complex SMTP setup is required. The system leverages the Resend API to securely deliver messages directly to your client's inbox.</p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-xl">
              <h3 className="font-semibold text-white text-base mb-2">Is my client data safe?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Your data is stored securely in a dedicated PostgreSQL database powered by Supabase, protected by industry-standard encryption protocols.</p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-xl">
              <h3 className="font-semibold text-white text-base mb-2">Can I export my leads?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Yes, because your database runs on Supabase, you have full ownership and access to your raw data at any time.</p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━ WHO THIS IS NOT FOR ━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-zinc-900 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Who this is NOT for</h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            If you run a 20-person sales team and need automated drip sequences, this is the wrong tool. Followup AI is a manual-trigger assistant, built specifically for consultants and independent professionals who just want a reliable system to stop forgetting to email people.
          </p>
        </section>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-zinc-900 bg-black pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-bold tracking-tight text-white">Followup AI</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">A focused AI follow-up tool for independent professionals.</p>
            </div>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-zinc-900 text-white border border-zinc-800 font-medium px-6 py-3 rounded-lg hover:bg-zinc-800 transition text-sm min-h-[44px]"
            >
              Get started for free
            </Link>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600 border-t border-zinc-900/50 pt-8">
          <div>Support available in dashboard</div>
          <div>&copy; {new Date().getFullYear()} Followup AI. All rights reserved.</div>
        </div>
      </footer>

      {/* ━━━━━━━━━━━━━━━━━━━━ EXIT INTENT POPUP ━━━━━━━━━━━━━━━━━━━━ */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Wait, before you go.</h3>
            <p className="text-sm text-zinc-400 mb-6">Get our free 1-page playbook on how independent consultants use simple follow-ups to close 30% more deals.</p>
            {popupSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center">
                Check your inbox!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPopupSubmitted(true);
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-zinc-600"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg text-sm hover:bg-zinc-200 transition min-h-[44px]"
                >
                  Get the free playbook
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}