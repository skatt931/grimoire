import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface CardFreq { name_uk: string; card_id: number; count: number }

async function getInsights() {
  const supabase = await createClient();

  const [{ data: readings }, { data: rcData }] = await Promise.all([
    supabase.from("readings").select("id, created_at, title, spread_type").order("created_at", { ascending: false }),
    supabase.from("reading_cards").select("card_id, cards(name_uk, arcana)"),
  ]);

  // Card frequency
  const freq: Record<number, { name: string; arcana: string; count: number }> = {};
  for (const rc of rcData ?? []) {
    const id = rc.card_id;
    if (!freq[id]) freq[id] = { name: (rc.cards as any)?.name_uk ?? "", arcana: (rc.cards as any)?.arcana ?? "", count: 0 };
    freq[id].count++;
  }

  const topCards = Object.entries(freq)
    .map(([id, v]) => ({ card_id: parseInt(id), name_uk: v.name, arcana: v.arcana, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Arcana breakdown
  const majorCount = (rcData ?? []).filter((rc) => (rc.cards as any)?.arcana === "major").length;
  const minorCount = (rcData ?? []).filter((rc) => (rc.cards as any)?.arcana === "minor").length;
  const total = majorCount + minorCount;

  // Monthly activity (last 6 months)
  const months: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("uk-UA", { month: "short" });
    const count = (readings ?? []).filter((r) => {
      const rd = new Date(r.created_at);
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    }).length;
    months.push({ label, count });
  }
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1);

  return { readings: readings ?? [], topCards, majorCount, minorCount, total, months, maxMonthCount };
}

export default async function InsightsPage() {
  const { readings, topCards, majorCount, minorCount, total, months, maxMonthCount } = await getInsights();

  const majorPct = total > 0 ? Math.round((majorCount / total) * 100) : 0;
  const minorPct = total > 0 ? 100 - majorPct : 0;

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="px-6 pt-2 pb-5">
        <h1 className="text-[31px] leading-[1.1]"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          Знаки
        </h1>
        <p className="text-[15px] mt-0.5"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.35)" }}>
          Що повертається до тебе
        </p>
      </div>

      {readings.length === 0 ? (
        <div className="mx-5 rounded-[18px] p-8 text-center"
          style={{ background: "rgba(13,11,30,.6)", border: "1px dashed rgba(139,159,212,.15)" }}>
          <p className="text-[17px] italic mb-4"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.4)" }}>
            Закономірності з'являться<br />після перших читань.
          </p>
          <Link href="/journal/new"
            className="text-[14px] font-[600] tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
            Перше читання →
          </Link>
        </div>
      ) : (
        <div className="px-5 space-y-4">

          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[18px] p-4 text-center"
              style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
              <p className="text-[37px] font-[400] leading-none mb-1"
                style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                {readings.length}
              </p>
              <p className="text-[13px] font-[600] tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Читань
              </p>
            </div>
            <div className="rounded-[18px] p-4 text-center"
              style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
              <p className="text-[37px] font-[400] leading-none mb-1"
                style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                {total}
              </p>
              <p className="text-[13px] font-[600] tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Карт розкладено
              </p>
            </div>
          </div>

          {/* Monthly activity */}
          <div className="rounded-[18px] p-4"
            style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
            <p className="text-[13px] font-[600] tracking-[0.18em] uppercase mb-4"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              Активність за місяцями
            </p>
            <div className="flex items-end gap-2 h-[60px]">
              {months.map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-[4px] transition-all"
                    style={{
                      height: count > 0 ? `${Math.max(4, (count / maxMonthCount) * 48)}px` : "4px",
                      background: count > 0
                        ? "linear-gradient(to top, rgba(139,159,212,.5), rgba(139,159,212,.25))"
                        : "rgba(139,159,212,.08)",
                    }} />
                  <span className="text-[11px]"
                    style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Arcana breakdown */}
          {total > 0 && (
            <div className="rounded-[18px] p-4"
              style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
              <p className="text-[13px] font-[600] tracking-[0.18em] uppercase mb-3"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Аркани
              </p>
              <div className="flex rounded-full overflow-hidden h-2 mb-3">
                <div style={{ width: `${majorPct}%`, background: "rgba(212,168,76,.6)" }} />
                <div style={{ width: `${minorPct}%`, background: "rgba(139,159,212,.4)" }} />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "rgba(212,168,76,.6)" }} />
                  <span className="text-[14px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.5)" }}>
                    Старший · {majorCount} ({majorPct}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "rgba(139,159,212,.4)" }} />
                  <span className="text-[14px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.5)" }}>
                    Молодший · {minorCount} ({minorPct}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Top cards */}
          {topCards.length > 0 && (
            <div className="rounded-[18px] p-4"
              style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
              <p className="text-[13px] font-[600] tracking-[0.18em] uppercase mb-3"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Найчастіші карти
              </p>
              <div className="space-y-2.5">
                {topCards.map((card, i) => (
                  <Link key={card.card_id} href={`/cards/${card.card_id}`}
                    className="flex items-center gap-3">
                    <span className="text-[14px] w-4 text-center flex-shrink-0"
                      style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[16px]"
                          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                          {card.name_uk}
                        </span>
                        <span className="text-[14px] ml-2 flex-shrink-0"
                          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.4)" }}>
                          {card.count}×
                        </span>
                      </div>
                      <div className="h-[2px] rounded-full overflow-hidden"
                        style={{ background: "rgba(139,159,212,.1)" }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${(card.count / topCards[0].count) * 100}%`,
                            background: card.arcana === "major"
                              ? "linear-gradient(to right, rgba(212,168,76,.6), rgba(212,168,76,.3))"
                              : "linear-gradient(to right, rgba(139,159,212,.6), rgba(139,159,212,.3))",
                          }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent readings timeline */}
          <div className="rounded-[18px] p-4"
            style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
            <p className="text-[13px] font-[600] tracking-[0.18em] uppercase mb-3"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              Останні читання
            </p>
            <div className="space-y-3">
              {readings.slice(0, 5).map((r, i) => (
                <Link key={r.id} href={`/journal/${r.id}`}
                  className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "rgba(139,159,212,.5)" }} />
                    {i < readings.slice(0, 5).length - 1 && (
                      <div className="w-px flex-1 mt-1"
                        style={{ background: "rgba(139,159,212,.12)", minHeight: "20px" }} />
                    )}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="text-[16px] mb-0.5 truncate"
                      style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                      {r.title}
                    </p>
                    <p className="text-[13px]"
                      style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)" }}>
                      {new Date(r.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {readings.length > 5 && (
              <Link href="/journal"
                className="block text-center mt-2 text-[14px] font-[600] tracking-[0.1em] uppercase"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Всі читання →
              </Link>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
