import Link from "next/link";

export const SIGN_UP_HREF = "/login?mode=signup";

export function PrimaryCta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={SIGN_UP_HREF}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 ${className}`}
    >
      {children}
    </Link>
  );
}
