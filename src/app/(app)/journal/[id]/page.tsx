"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reading, setReading] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [savedReflection, setSavedReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    createClient()
      .from("readings")
      .select("*, reading_cards(*, cards(*))")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setReading(data);
        setSavedReflection(data?.interpretation ?? "");
        setReflection(data?.interpretation ?? "");
      });
  }, [id]);

  async function saveReflection() {
    setSaving(true);
    await createClient().from("readings").update({ interpretation: reflection.trim() || null }).eq("id", id);
    setSavedReflection(reflection);
    setSaving(false);
  }

  async function deleteReading() {
    if (!confirm("Видалити це читання?")) return;
    await createClient().from("readings").delete().eq("id", id);
    router.push("/journal");
  }

  if (!reading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-[16px] animate-pulse" style={{ color: "rgba(139,159,212,.5)", fontFamily: "var(--font-manrope)" }}>Завантаження...</span>
    </div>
  );

  const readingCards = reading.reading_cards ?? [];

  return (
    <div className="pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center"
          style={{ background: "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.14)" }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="rgba(234,240,248,.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 17l-5-5 5-5" />
          </svg>
        </button>
        <button onClick={deleteReading} className="text-[14px] font-[500]"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.25)" }}>
          Видалити
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* Title + meta */}
        <div>
          <p className="text-[13px] font-[600] tracking-[0.2em] uppercase mb-1"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
            {new Date(reading.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-[28px] leading-tight mb-1"
            style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
            {reading.title}
          </h1>
          {reading.question && (
            <p className="text-[16px] italic"
              style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.5)" }}>
              «{reading.question}»
            </p>
          )}
        </div>

        {/* Cards */}
        {readingCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-[13px] font-[600] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              Карти
            </p>
            {readingCards.map((rc: any, i: number) => (
              <Link key={i} href={`/cards/${rc.card_id}`}
                className="flex items-center gap-3 rounded-[14px] p-3"
                style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.1)" }}>
                <div className="w-9 h-14 rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ background: rc.cards?.arcana === "major" ? "rgba(212,168,76,.1)" : "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.12)" }}>
                  <span className="text-[10px]" style={{ color: rc.cards?.arcana === "major" ? "rgba(212,168,76,.5)" : "rgba(139,159,212,.4)" }}>✦</span>
                </div>
                <div className="flex-1 min-w-0">
                  {rc.position_name && (
                    <p className="text-[11px] font-[600] tracking-[0.12em] uppercase"
                      style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.55)" }}>
                      {rc.position_name}
                    </p>
                  )}
                  <p className="text-[17px]" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                    {rc.cards?.name_uk}
                    {rc.is_reversed && <span className="ml-1 text-[13px]" style={{ color: "rgba(212,168,76,.6)" }}>↓</span>}
                  </p>
                  {rc.note && (
                    <p className="text-[14px] italic truncate"
                      style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.4)" }}>
                      {rc.note}
                    </p>
                  )}
                </div>
                <svg width="12" height="12" viewBox="0 0 22 22" fill="none" stroke="rgba(139,159,212,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 5l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Notes */}
        {reading.notes && (
          <div className="rounded-[16px] p-4"
            style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.1)" }}>
            <p className="text-[13px] font-[600] tracking-[0.18em] uppercase mb-2"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              Нотатки
            </p>
            <p className="text-[16px] italic leading-[1.75]"
              style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.65)" }}>
              «{reading.notes}»
            </p>
          </div>
        )}

        {/* Interpretation / Reflection */}
        <div className="rounded-[16px] p-4"
          style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.1)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-[600] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              {showReflection ? "Редагувати" : "Інтерпретація"}
            </p>
            <button onClick={() => setShowReflection(!showReflection)}
              className="text-[13px] font-[500]"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
              {showReflection ? "Готово" : savedReflection ? "Редагувати ✎" : "+ Додати"}
            </button>
          </div>

          {showReflection ? (
            <div className="space-y-2">
              <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
                placeholder="Мої висновки, думки, відчуття після цього читання..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-[10px] text-[16px] outline-none resize-none leading-[1.7]"
                style={{ background: "rgba(6,6,15,.8)", border: "1px solid rgba(139,159,212,.15)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
              <button onClick={saveReflection} disabled={saving || reflection === savedReflection}
                className="w-full py-2.5 rounded-[10px] text-[14px] font-[600] tracking-[0.1em] uppercase disabled:opacity-40"
                style={{ background: "rgba(139,159,212,.15)", border: "1px solid rgba(139,159,212,.3)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }}>
                {saving ? "Зберігаємо..." : "Зберегти"}
              </button>
            </div>
          ) : savedReflection ? (
            <p className="text-[16px] italic leading-[1.75]"
              style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.65)" }}>
              «{savedReflection}»
            </p>
          ) : (
            <p className="text-[15px] italic"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.25)" }}>
              Ще немає нотаток...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
