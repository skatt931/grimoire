import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SPREAD_LABELS: Record<string, string> = {
  three_card: "Три карти",
  free_form: "Власний розклад",
};

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: readings } = await supabase
    .from("readings")
    .select("*, reading_cards(card_id, cards(name_uk))")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-2 pb-5">
        <div>
          <h1 className="text-[31px] leading-[1.1]"
            style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
            Журнал
          </h1>
          <p className="text-[15px] mt-0.5"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.35)" }}>
            Голос твого серця
          </p>
        </div>
        <Link href="/journal/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-[600] tracking-[0.08em] uppercase"
          style={{ background: "rgba(139,159,212,.15)", border: "1px solid rgba(139,159,212,.3)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 1v10M1 6h10" />
          </svg>
          Нове
        </Link>
      </div>

      {/* Empty state */}
      {!readings?.length && (
        <div className="mx-5 rounded-[18px] p-8 text-center"
          style={{ background: "rgba(13,11,30,.6)", border: "1px dashed rgba(139,159,212,.15)" }}>
          <p className="text-[17px] italic mb-4"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.4)" }}>
            Твій журнал ще порожній.<br />Кожне читання — нова сторінка.
          </p>
          <Link href="/journal/new"
            className="text-[15px] font-[600] tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.8)" }}>
            Перше читання →
          </Link>
        </div>
      )}

      {/* Reading list */}
      <div className="space-y-3 px-5">
        {readings?.map((reading) => {
          const cards = (reading.reading_cards as { cards: { name_uk: string } }[]) ?? [];
          return (
            <Link key={reading.id} href={`/journal/${reading.id}`}
              className="block rounded-[18px] p-4 relative overflow-hidden transition-all active:scale-[0.99]"
              style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
              <div className="absolute inset-0 rounded-[18px] pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(139,159,212,.05) 0%, transparent 60%)" }} />
              <div className="relative">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[18px] leading-tight flex-1"
                    style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                    {reading.title}
                  </h3>
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="rgba(139,159,212,.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1">
                    <path d="M8 5l6 6-6 6" />
                  </svg>
                </div>
                <p className="text-[14px] mb-2"
                  style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.32)" }}>
                  {new Date(reading.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{SPREAD_LABELS[reading.spread_type] ?? reading.spread_type}
                </p>
                {reading.notes && (
                  <p className="text-[15px] italic line-clamp-2 mb-2"
                    style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.45)" }}>
                    «{reading.notes}»
                  </p>
                )}
                {cards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cards.slice(0, 3).map((rc, i) => (
                      <span key={i} className="text-[13px] px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.45)", background: "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.15)" }}>
                        {rc.cards?.name_uk}
                      </span>
                    ))}
                    {cards.length > 3 && (
                      <span className="text-[13px] px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)", background: "rgba(139,159,212,.05)" }}>
                        +{cards.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
