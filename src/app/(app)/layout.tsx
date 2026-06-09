import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/BottomNav";
import Stars from "@/components/layout/Stars";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="relative min-h-dvh bg-[#06060F] overflow-hidden">
      {/* Celestial atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 110% 55% at 50% -15%, rgba(120,140,220,.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 60% at 15% 85%, rgba(90,60,180,.08) 0%, transparent 55%),
              radial-gradient(ellipse 40% 40% at 85% 25%, rgba(212,168,76,.04) 0%, transparent 50%)
            `,
          }}
        />
      </div>
      <Stars />

      {/* Page content — pt for status bar, pb for bottom nav + iOS home bar */}
      <main className="relative z-10 min-h-dvh"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        }}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
