"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

const SUIT_COLORS: Record<string, string> = {
  wands:     "rgba(212,100,76,.12)",
  cups:      "rgba(76,140,212,.12)",
  swords:    "rgba(139,159,212,.12)",
  pentacles: "rgba(100,180,100,.12)",
};

export default function FavoritesPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient()
      .from("favorites")
      .select("cards(*)")
      .then(({ data }) => {
        setCards((data ?? []).map((f: any) => f.cards).filter(Boolean));
        setLoading(false);
      });
  }, []);

  async function removeFav(cardId: number) {
    await createClient().from("favorites").delete().eq("card_id", cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="px-6 pt-2 pb-5">
        <h1 className="text-[31px] leading-[1.1]"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          Обране
        </h1>
        <p className="text-[15px] mt-0.5"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.35)" }}>
          Твоя особиста колекція
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="text-[16px] animate-pulse"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.4)" }}>
            Завантаження...
          </span>
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="mx-5 rounded-[18px] p-8 text-center"
          style={{ background: "rgba(13,11,30,.6)", border: "1px dashed rgba(139,159,212,.15)" }}>
          <div className="flex justify-center mb-4">
            <svg width="36" height="36" viewBox="0 0 22 22" fill="none"
              stroke="rgba(139,159,212,.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13.5a8.5 8.5 0 01-8.5 8.5 8.5 8.5 0 010-17A6.5 6.5 0 0120 13.5z" />
            </svg>
          </div>
          <p className="text-[17px] italic mb-4"
            style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.4)" }}>
            Тут з'являться карти,<br />що найбільше говорять до тебе.
          </p>
          <Link href="/cards"
            className="text-[14px] font-[600] tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
            Перейти до карт →
          </Link>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <>
          <p className="px-6 mb-3 text-[13px] font-[600] tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.25)" }}>
            {cards.length} {cards.length === 1 ? "карта" : cards.length < 5 ? "карти" : "карт"}
          </p>
          <div className="grid grid-cols-3 gap-2.5 px-5">
            {cards.map((card) => (
              <div key={card.id} className="relative">
                <Link href={`/cards/${card.id}`} className="flex flex-col gap-1.5">
                  {/* Card thumbnail */}
                  <div className="w-full aspect-[2/3] rounded-[12px] flex flex-col items-center justify-center gap-2"
                    style={{
                      background: card.arcana === "major"
                        ? "rgba(212,168,76,.1)"
                        : (SUIT_COLORS[card.suit as string] ?? "rgba(139,159,212,.1)"),
                      border: "1px solid rgba(139,159,212,.15)",
                    }}>
                    {card.arcana === "major"
                      ? <span className="text-[22px]" style={{ color: "rgba(212,168,76,.45)" }}>✦</span>
                      : <svg width="18" height="18" viewBox="0 0 22 22" fill="none"
                          stroke="rgba(139,159,212,.35)" strokeWidth="1.4" strokeLinecap="round">
                          <rect x="5" y="1" width="12" height="20" rx="2.5" />
                          <circle cx="11" cy="10" r="3" />
                        </svg>
                    }
                  </div>
                  <p className="text-[13px] text-center leading-tight px-0.5"
                    style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.7)" }}>
                    {card.name_uk}
                  </p>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => removeFav(card.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(13,11,30,.85)", border: "1px solid rgba(212,168,76,.25)" }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
                    stroke="rgba(212,168,76,.6)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l8 8M9 1L1 9" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
