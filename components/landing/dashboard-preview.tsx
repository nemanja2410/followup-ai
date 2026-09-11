function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}

const rows = [
  {
    name: "Sarah Jenkins",
    amount: "$12,500",
    age: "5 days",
    status: "due" as const,
  },
  {
    name: "Marcus Thorne",
    amount: "$8,200",
    age: "3 days",
    status: "due" as const,
  },
  {
    name: "Elena Rostova",
    amount: "$3,400",
    age: "1 day",
    status: "open" as const,
  },
];

/** Static replica of the real dashboard queue + draft drawer. Decorative only. */
export function DashboardPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-[#F3F1EC] shadow-[0_20px_50px_-28px_rgba(24,24,27,0.35)]"
    >
      <div className="flex h-11 items-center justify-between border-b border-zinc-200/80 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-semibold text-white">
            F
          </div>
          <span className="text-xs font-semibold text-zinc-900">FollowUp AI</span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Jobber connected
        </span>
      </div>

      <div className="p-4 sm:p-5 xl:pr-[19.5rem]">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">Today</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          2 quotes need a follow-up
        </p>
        <p className="mt-1 text-xs text-zinc-500">$20,700 in estimates has gone quiet.</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5 sm:p-3">
            <p className="truncate text-[10px] font-medium text-zinc-500 sm:text-xs">Follow-up due</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">2</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5 sm:p-3">
            <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">Waiting</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">1</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5 sm:p-3">
            <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">In FollowUp AI</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">3</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-3 py-2">
            <span className="inline-flex rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200">
              Needs attention
              <span className="ml-1.5 text-zinc-400">3</span>
            </span>
          </div>
          <ul>
            {rows.map((row) => (
              <li
                key={row.name}
                className="flex items-center justify-between gap-3 border-b border-zinc-100 px-3 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{row.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {row.amount} · {row.age}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.status === "due" ? (
                    <StatusPill
                      label="Follow-up due"
                      className="bg-amber-50 text-amber-800 ring-amber-200"
                    />
                  ) : (
                    <StatusPill label="Waiting" className="bg-zinc-100 text-zinc-600 ring-zinc-200" />
                  )}
                  <span
                    className={`hidden min-h-8 items-center rounded-lg px-2.5 text-xs font-medium sm:inline-flex ${
                      row.status === "due"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-800"
                    }`}
                  >
                    Draft
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="hidden border-l border-zinc-200 bg-white xl:absolute xl:inset-y-0 xl:right-0 xl:flex xl:w-72 xl:flex-col">
        <div className="border-b border-zinc-100 px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Follow-up</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">Sarah Jenkins</p>
          <p className="mt-0.5 text-xs text-zinc-500">$12,500 · Sent 5 days ago</p>
        </div>
        <div className="flex-1 px-4 py-4">
          <p className="text-[11px] font-medium text-zinc-500">Message</p>
          <div className="mt-2 rounded-xl border border-zinc-200 bg-[#FBFBF9] p-3 text-xs leading-relaxed text-zinc-700">
            Hi Sarah — checking in on the estimate we sent last week. Happy to answer questions or adjust the scope if
            anything changed.
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
            You edit the draft. Nothing sends until you click.
          </p>
        </div>
        <div className="border-t border-zinc-100 px-4 py-3">
          <div className="flex min-h-11 items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white">
            Send follow-up
          </div>
        </div>
      </aside>
    </div>
  );
}
