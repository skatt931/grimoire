import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDailyHoroscopeText, getEnergyLevel } from "@/lib/horoscope";
import FadeUp, { StaggerList, StaggerItem } from "@/components/ui/FadeUp";
import Greeting from "@/components/home/Greeting";

function Alstroemeria({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.5)" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.45)" transform="rotate(120 12 12)" />
      <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.45)" transform="rotate(240 12 12)" />
      <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(180 12 12)" />
      <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(300 12 12)" />
      <circle cx="12" cy="12" r="2.2" fill="rgba(212,168,76,.7)" />
    </svg>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: readings } = await supabase
    .from("readings")
    .select(`*, reading_cards(card_id, cards(name_uk))`)
    .order("created_at", { ascending: false })
    .limit(1);

  const lastReading = readings?.[0] ?? null;
  const today = new Date();
  const horoscopeText = getDailyHoroscopeText(today);
  const energyLevel = getEnergyLevel(today);

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <FadeUp delay={0}>
      <div className="px-6 pt-2 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Alstroemeria size={16} />
          <span className="text-[13px] font-[600] tracking-[0.28em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.75)" }}>
            ♊ Гримуар Ані
          </span>
          <Alstroemeria size={16} />
        </div>
        <Greeting />
        <p className="text-[16px] mt-2 italic"
          style={{ fontFamily: "var(--font-marcellus)", color: "rgba(212,168,76,.6)" }}>
          Між картами — тиша. В тиші — ти.
        </p>
      </div>
      </FadeUp>

      {/* Divider */}
      <div className="flex items-center gap-2 px-6 mb-4">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(139,159,212,.2), transparent)" }} />
        <span className="text-[13px]" style={{ color: "rgba(139,159,212,.4)" }}>✦</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(139,159,212,.2), transparent)" }} />
      </div>

      {/* Daily Gemini widget */}
      <FadeUp delay={0.08}>
      <div className="mx-5 mb-4 rounded-[18px] overflow-hidden"
        style={{ background: "rgba(13,11,30,.85)", border: "1px solid rgba(155,128,212,.18)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: "rgba(155,128,212,.1)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[17px]">♊</span>
            <span className="text-[13px] font-[700] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(155,128,212,.85)" }}>
              Близнюки · Сьогодні
            </span>
          </div>
          <span className="text-[11px] font-[500]"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)" }}>
            ↻ {today.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-[16px] leading-[1.75] italic mb-3"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.75)" }}>
            «{horoscopeText}»
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[2px] rounded-full overflow-hidden"
              style={{ background: "rgba(155,128,212,.12)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${energyLevel * 100}%`, background: "linear-gradient(to right, rgba(155,128,212,.6), rgba(212,168,76,.5))" }} />
            </div>
            <span className="text-[11px] font-[600] tracking-[0.14em] uppercase whitespace-nowrap"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(212,168,76,.55)" }}>
              Енергія дня
            </span>
          </div>
        </div>
      </div>
      </FadeUp>

      {/* Last reading */}
      {lastReading ? (
        <Link href={`/journal/${lastReading.id}`}
          className="block mx-5 mb-4 rounded-[18px] p-4 relative overflow-hidden"
          style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.14)" }}>
          <div className="absolute inset-0 rounded-[18px] pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(139,159,212,.06) 0%, transparent 60%)" }} />
          <div className="relative">
            <p className="text-[11px] font-[700] tracking-[0.15em] uppercase mb-2"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.75)" }}>
              ✦ Останнє читання
            </p>
            <p className="text-[20px] mb-1"
              style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
              {lastReading.title}
            </p>
            <p className="text-[14px] mb-2"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.32)" }}>
              {new Date(lastReading.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
              {" · "}{lastReading.spread_type === "three_card" ? "Три карти" : "Власний розклад"}
            </p>
            {lastReading.notes && (
              <p className="text-[15px] italic line-clamp-2"
                style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.5)" }}>
                «{lastReading.notes}»
              </p>
            )}
          </div>
        </Link>
      ) : (
        <div className="mx-5 mb-4 rounded-[18px] p-5 text-center"
          style={{ background: "rgba(13,11,30,.6)", border: "1px dashed rgba(139,159,212,.15)" }}>
          <p className="text-[16px] italic mb-3"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.4)" }}>
            Твій гримуар ще порожній.<br />Час розпочати першу сторінку.
          </p>
          <Link href="/journal/new"
            className="text-[14px] font-[600] tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.8)" }}>
            Перше читання →
          </Link>
        </div>
      )}

      {/* Section label */}
      <p className="px-6 mb-3 text-[13px] font-[600] tracking-[0.2em] uppercase"
        style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.28)" }}>
        Твій простір
      </p>

      {/* Action grid */}
      <StaggerList className="grid grid-cols-2 gap-2.5 px-5" style={{ gridAutoRows: "1fr" }}>
        {[
          {
            href: "/journal/new",
            icon: <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" /><circle cx="12" cy="12" r="3.5" /></svg>,
            name: "Нове читання", desc: "Новий шлях", accent: true,
          },
          {
            href: "/journal",
            icon: <svg className="w-[26px] h-[26px]" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="16" height="18" rx="2" /><line x1="7" y1="7" x2="15" y2="7" /><line x1="7" y1="11" x2="15" y2="11" /><line x1="7" y1="15" x2="11" y2="15" /></svg>,
            name: "Мій журнал", desc: "Голос серця", accent: false,
          },
          {
            href: "/cards",
            icon: <svg className="w-[26px] h-[26px]" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="5" y="1" width="12" height="20" rx="2.5" /><circle cx="11" cy="10" r="3" /></svg>,
            name: "Карти", desc: "Мова символів", accent: false,
          },
          {
            href: "/insights",
            icon: <svg className="w-[26px] h-[26px]" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="4.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="11" cy="8.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="17.5" cy="14" r="1.5" fill="currentColor" stroke="none" /><circle cx="17.5" cy="4.5" r="1.5" fill="currentColor" stroke="none" /><path d="M4.5 16.5L11 8.5M11 8.5L17.5 14M11 8.5L17.5 4.5" /></svg>,
            name: "Знаки", desc: "Твої повтори", accent: false,
          },
        ].map(({ href, icon, name, desc, accent }) => (
          <StaggerItem key={href} className="h-full">
          <Link href={href}
            className="h-full rounded-[20px] p-4 flex flex-col relative overflow-hidden"
            style={{
              background: accent ? "rgba(139,159,212,.14)" : "rgba(13,11,30,.75)",
              border: `1px solid ${accent ? "rgba(139,159,212,.26)" : "rgba(139,159,212,.09)"}`,
            }}>
            {accent && (
              <div className="absolute bottom-[-12px] right-[-12px] w-[65px] h-[65px] rounded-full pointer-events-none animate-glow-pulse"
                style={{ background: "rgba(139,159,212,.18)", filter: "blur(18px)" }} />
            )}
            <span className="mb-2.5" style={{ color: accent ? "rgba(185,165,245,.95)" : "rgba(139,159,212,.85)" }}>
              {icon}
            </span>
            <span className="text-[16px] mb-0.5" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
              {name}
            </span>
            <span className="text-[14px] font-[300] leading-[1.4]"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.38)" }}>
              {desc}
            </span>
          </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </div>
  );
}
