import { requireUser } from "@/lib/supabase/require-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="min-h-screen bg-[#F3F1EC] text-zinc-900">{children}</div>
  );
}
