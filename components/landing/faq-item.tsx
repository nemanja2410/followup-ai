export function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-zinc-200 py-5 last:border-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-zinc-900 marker:content-none [&::-webkit-details-marker]:hidden">
        {question}
        <span className="shrink-0 text-lg font-normal text-zinc-400 group-open:hidden">+</span>
        <span className="hidden shrink-0 text-lg font-normal text-zinc-400 group-open:inline">−</span>
      </summary>
      <div className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">{children}</div>
    </details>
  );
}
