"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const SUIT_LABELS: Record<string, string> = {
  wands: "Жезли", cups: "Кубки", swords: "Мечі", pentacles: "Пентаклі",
};

type Tab = "up" | "rev" | "reflect" | "note";

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [tab, setTab] = useState<Tab>("up");
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("cards").select("*").eq("id", id).single(),
      supabase.from("favorites").select("card_id").eq("card_id", id).maybeSingle(),
      supabase.from("card_notes").select("content").eq("card_id", id).maybeSingle(),
    ]).then(([{ data: cardData }, { data: favData }, { data: noteData }]) => {
      setCard(cardData);
      setIsFav(!!favData);
      const content = noteData?.content ?? "";
      setNote(content);
      setSavedNote(content);
    });
  }, [id]);

  async function toggleFav() {
    const supabase = createClient();
    if (isFav) {
      await supabase.from("favorites").delete().eq("card_id", id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("favorites").insert({ user_id: user.id, card_id: parseInt(id) });
    }
    setIsFav(!isFav);
  }

  async function saveNote() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("card_notes").upsert(
      { user_id: user.id, card_id: parseInt(id), content: note },
      { onConflict: "user_id,card_id" }
    );
    setSavedNote(note);
    setSaving(false);
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-[16px] animate-pulse" style={{ color: "rgba(139,159,212,.5)", fontFamily: "var(--font-manrope)" }}>
          Завантаження...
        </span>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "up", label: "Пряме" },
    { key: "rev", label: "Перевернуте" },
    { key: "reflect", label: "Рефлексія" },
    { key: "note", label: "Нотатки" },
  ];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center"
          style={{ background: "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.14)" }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="rgba(234,240,248,.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 17l-5-5 5-5" />
          </svg>
        </button>
        <span className="text-[16px]" style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.45)" }}>
          Карти
        </span>
        <button onClick={toggleFav}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center transition-all"
          style={{
            background: isFav ? "rgba(212,168,76,.15)" : "rgba(139,159,212,.08)",
            border: `1px solid ${isFav ? "rgba(212,168,76,.35)" : "rgba(139,159,212,.14)"}`,
          }}>
          <svg width="16" height="16" viewBox="0 0 22 22" fill={isFav ? "#D4A84C" : "none"}
            stroke={isFav ? "#D4A84C" : "rgba(234,240,248,.55)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13.5a8.5 8.5 0 01-8.5 8.5 8.5 8.5 0 010-17A6.5 6.5 0 0120 13.5z" />
          </svg>
        </button>
      </div>

      {/* Card artwork placeholder */}
      <div className="flex justify-center py-4">
        <div className="w-[148px] h-[237px] rounded-[18px] flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          style={{
            background: card.arcana === "major"
              ? "linear-gradient(160deg, #1E1040 0%, #0D0820 100%)"
              : "linear-gradient(160deg, #0E1530 0%, #060F25 100%)",
            border: "1px solid rgba(139,159,212,.2)",
            boxShadow: "0 0 60px rgba(139,159,212,.18), 0 20px 60px rgba(0,0,0,.7)",
          }}>
          {/* Decorative SVG */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.6">
            <circle cx="40" cy="40" r="30" stroke="rgba(212,168,76,.3)" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="22" stroke="rgba(139,159,212,.3)" strokeWidth="0.5" />
            <path d="M40 10 L44 34 L40 38 L36 34 Z" fill="rgba(212,168,76,.2)" />
            <path d="M40 70 L36 46 L40 42 L44 46 Z" fill="rgba(212,168,76,.15)" />
            <path d="M10 40 L34 36 L38 40 L34 44 Z" fill="rgba(139,159,212,.2)" />
            <path d="M70 40 L46 44 L42 40 L46 36 Z" fill="rgba(139,159,212,.15)" />
            <circle cx="40" cy="40" r="4" fill="rgba(212,168,76,.4)" />
          </svg>
          {card.arcana === "major" && card.number !== null && (
            <span className="text-[14px] tracking-[0.25em]"
              style={{ fontFamily: "var(--font-marcellus)", color: "rgba(212,168,76,.6)" }}>
              {ROMAN[card.number]}
            </span>
          )}
        </div>
      </div>

      {/* Card info */}
      <div className="px-5">
        <p className="text-[14px] tracking-[0.25em] uppercase mb-1"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(212,168,76,.65)" }}>
          {card.arcana === "major" ? "Старший Аркан" : `${SUIT_LABELS[card.suit ?? ""]} · Молодший Аркан`}
        </p>
        <h2 className="text-[31px] leading-[1.1] mb-4"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          {card.name_uk}
        </h2>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-5">
          {card.keywords.map((kw) => (
            <span key={kw} className="text-[14px] font-[500] px-3 py-1 rounded-full"
              style={{
                fontFamily: "var(--font-manrope)",
                color: "rgba(139,159,212,.8)",
                background: "rgba(139,159,212,.08)",
                border: "1px solid rgba(139,159,212,.18)",
              }}>
              {kw}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex rounded-[12px] overflow-hidden mb-4"
          style={{ border: "1px solid rgba(139,159,212,.15)" }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-2 text-[13px] font-[600] tracking-[0.08em] transition-all"
              style={{
                fontFamily: "var(--font-manrope)",
                background: tab === key ? "rgba(139,159,212,.18)" : "transparent",
                color: tab === key ? "#EAF0F8" : "rgba(234,240,248,.38)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "up" && (
          <p className="text-[17px] leading-[1.8]"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.7)" }}>
            {card.meaning_up}
          </p>
        )}

        {tab === "rev" && (
          <p className="text-[17px] leading-[1.8]"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.7)" }}>
            {card.meaning_rev}
          </p>
        )}

        {tab === "reflect" && (
          <div className="space-y-3">
            {card.reflections.map((q, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="mt-1 flex-shrink-0 text-[13px]" style={{ color: "rgba(212,168,76,.5)" }}>✦</span>
                <p className="text-[17px] leading-[1.75] italic"
                  style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.65)" }}>
                  {q}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "note" && (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Твої особисті нотатки про цю карту..."
              rows={6}
              className="w-full px-4 py-3 rounded-[14px] text-[16px] leading-[1.7] outline-none resize-none"
              style={{
                background: "rgba(13,11,30,.8)",
                border: "1px solid rgba(139,159,212,.15)",
                color: "#EAF0F8",
                fontFamily: "var(--font-manrope)",
              }}
            />
            <button
              onClick={saveNote}
              disabled={saving || note === savedNote}
              className="w-full py-3 rounded-[14px] text-[15px] font-[600] tracking-[0.1em] uppercase transition-all disabled:opacity-40"
              style={{
                background: "rgba(139,159,212,.15)",
                border: "1px solid rgba(139,159,212,.3)",
                color: "#EAF0F8",
                fontFamily: "var(--font-manrope)",
              }}>
              {saving ? "Зберігаємо..." : "Зберегти нотатку"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
