"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";
import CardImage from "@/components/cards/CardImage";

const SUIT_LABELS: Record<string, string> = {
  wands: "Жезли",
  cups: "Кубки",
  swords: "Мечі",
  pentacles: "Пентаклі",
};

function CardPlaceholder({ card }: { card: Card }) {
  const color = card.arcana === "major"
    ? "rgba(212,168,76,.15)"
    : {
        wands: "rgba(212,100,76,.1)",
        cups: "rgba(76,140,212,.1)",
        swords: "rgba(139,159,212,.1)",
        pentacles: "rgba(100,180,100,.1)",
      }[card.suit as string] ?? "rgba(139,159,212,.1)";

  return (
    <div className="w-full aspect-[2/3] rounded-[12px] flex flex-col items-center justify-center gap-2"
      style={{ background: color, border: "1px solid rgba(139,159,212,.12)" }}>
      {card.arcana === "major" ? (
        <span className="text-[24px]" style={{ color: "rgba(212,168,76,.5)" }}>✦</span>
      ) : (
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="rgba(139,159,212,.4)" strokeWidth="1.4" strokeLinecap="round">
          <rect x="5" y="1" width="12" height="20" rx="2.5" />
          <circle cx="11" cy="10" r="3" />
        </svg>
      )}
      {card.number !== null && (
        <span className="text-[13px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.2)" }}>
          {card.arcana === "major" ? ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"][card.number] : card.number}
        </span>
      )}
    </div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "major" | "wands" | "cups" | "swords" | "pentacles">("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("cards").select("*").order("id"),
      supabase.from("favorites").select("card_id"),
    ]).then(([{ data: cardsData }, { data: favsData }]) => {
      setCards(cardsData ?? []);
      setFavorites(new Set((favsData ?? []).map((f) => f.card_id)));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      const matchSearch = !search ||
        c.name_uk.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
      const matchFilter =
        filter === "all" ||
        (filter === "major" && c.arcana === "major") ||
        c.suit === filter;
      return matchSearch && matchFilter;
    });
  }, [cards, search, filter]);

  const filters: { key: typeof filter; label: string }[] = [
    { key: "all", label: "Всі" },
    { key: "major", label: "Старший" },
    { key: "wands", label: "Жезли" },
    { key: "cups", label: "Кубки" },
    { key: "swords", label: "Мечі" },
    { key: "pentacles", label: "Пентаклі" },
  ];

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="px-6 pt-2 pb-4">
        <h1 className="text-[31px] leading-[1.1] mb-1"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          Карти
        </h1>
        <p className="text-[15px]"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.35)" }}>
          Мова 78 символів
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 22 22" fill="none"
            stroke="rgba(139,159,212,.4)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="9.5" cy="9.5" r="7" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук карт..."
            className="w-full pl-10 pr-4 py-3 rounded-[14px] text-[16px] outline-none"
            style={{
              background: "rgba(13,11,30,.8)",
              border: "1px solid rgba(139,159,212,.15)",
              color: "#EAF0F8",
              fontFamily: "var(--font-manrope)",
            }}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-[600] tracking-[0.1em] uppercase transition-all"
            style={{
              fontFamily: "var(--font-manrope)",
              background: filter === key ? "rgba(139,159,212,.2)" : "rgba(13,11,30,.8)",
              border: `1px solid ${filter === key ? "rgba(139,159,212,.4)" : "rgba(139,159,212,.12)"}`,
              color: filter === key ? "#EAF0F8" : "rgba(234,240,248,.45)",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="px-6 mb-3 text-[13px] font-[600] tracking-[0.15em] uppercase"
        style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.25)" }}>
        {filtered.length} {filtered.length === 1 ? "карта" : "карт"}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-[16px] animate-pulse" style={{ color: "rgba(139,159,212,.5)", fontFamily: "var(--font-manrope)" }}>
            Завантаження карт...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 px-5">
          {filtered.map((card) => (
            <Link key={card.id} href={`/cards/${card.id}`}
              className="flex flex-col gap-1.5 relative">
              <CardImage
                cardId={card.id}
                alt={card.name_uk}
                imgClassName="w-full aspect-[2/3] rounded-[12px] object-cover"
                fallback={<CardPlaceholder card={card} />}
              />
              {favorites.has(card.id) && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(13,11,30,.8)" }}>
                  <span className="text-[11px]" style={{ color: "#D4A84C" }}>♊</span>
                </div>
              )}
              <p className="text-[13px] text-center leading-tight px-0.5"
                style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.65)" }}>
                {card.name_uk}
              </p>
              {card.suit && (
                <p className="text-[10px] text-center -mt-1"
                  style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.28)" }}>
                  {SUIT_LABELS[card.suit]}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
