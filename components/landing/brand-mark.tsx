export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white">
        F
      </div>
      <span className="whitespace-nowrap text-sm font-semibold tracking-tight">FollowUp AI</span>
    </div>
  );
}
