export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-950 text-zinc-50">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8">
        <span className="text-lg font-semibold tracking-tight">FollowUp AI</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Register
          </button>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            AI Follow-Up for Your Business
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
            Automatically track leads and book appointments effortlessly.
          </p>
          <button
            type="button"
            className="mt-2 rounded-full bg-white px-8 py-3 text-base font-medium text-zinc-950 shadow-lg shadow-black/30 transition hover:bg-zinc-200"
          >
            Get Started for Free
          </button>
        </div>
      </main>
    </div>
  );
}
