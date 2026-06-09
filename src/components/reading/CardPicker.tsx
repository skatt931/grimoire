"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

const SUIT_COLORS: Record<string, string> = {
  wands: "rgba(212,100,76,.12)",
  cups: "rgba(76,140,212,.12)",
  swords: "rgba(139,159,212,.12)",
  pentacles: "rgba(100,180,100,.12)",
};

interface CardPickerProps {
  onSelect: (card: Card) => void;
  onClose: () => void;
  excludeIds?: number[];
}

export default function CardPicker({ onSelect, onClose, excludeIds = [] }: CardPickerProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    createClient().from("cards").select("*").order("id").then(({ data }) => setCards(data ?? []));
  }, []);

  const filtered = useMemo(() => cards.filter((c) => {
    if (excludeIds.includes(c.id)) return false;
    const matchSearch = !search || c.name_uk.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "major" && c.arcana === "major") || c.suit === filter;
    return matchSearch && matchFilter;
  }), [cards, search, filter, excludeIds]);

  const filters = [
    { key: "all", label: "Всі" },
    { key: "major", label: "Старший" },
    { key: "wands", label: "Жезли" },
    { key: "cups", label: "Кубки" },
    { key: "swords", label: "Мечі" },
    { key: "pentacles", label: "Пентаклі" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mt-auto flex flex-col rounded-t-[28px] overflow-hidden"
        style={{ background: "#0D0B1E", border: "1px solid rgba(139,159,212,.15)", maxHeight: "85vh" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(139,159,212,.3)" }} />
        </div>

        {/* Title + close */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <h3 className="text-[21px]" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
            Обери карту
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(139,159,212,.1)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(234,240,248,.6)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
            className="w-full px-4 py-2.5 rounded-[12px] text-[16px] outline-none"
            style={{ background: "rgba(6,6,15,.8)", border: "1px solid rgba(139,159,212,.15)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          {filters.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[13px] font-[600] tracking-[0.08em] uppercase"
              style={{
                fontFamily: "var(--font-manrope)",
                background: filter === key ? "rgba(139,159,212,.2)" : "rgba(6,6,15,.8)",
                border: `1px solid ${filter === key ? "rgba(139,159,212,.4)" : "rgba(139,159,212,.12)"}`,
                color: filter === key ? "#EAF0F8" : "rgba(234,240,248,.4)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((card) => (
              <button key={card.id} onClick={() => onSelect(card)}
                className="flex flex-col items-center gap-1 rounded-[10px] p-2 transition-all active:scale-95"
                style={{
                  background: card.arcana === "major" ? "rgba(212,168,76,.08)" : (SUIT_COLORS[card.suit as string] ?? "rgba(139,159,212,.06)"),
                  border: "1px solid rgba(139,159,212,.1)",
                }}>
                <div className="w-full aspect-[2/3] rounded-[6px] flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,.3)" }}>
                  {card.arcana === "major"
                    ? <span className="text-[17px]" style={{ color: "rgba(212,168,76,.5)" }}>✦</span>
                    : <svg width="12" height="12" viewBox="0 0 22 22" fill="none" stroke="rgba(139,159,212,.4)" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="1" width="12" height="20" rx="2.5" /><circle cx="11" cy="10" r="3" /></svg>
                  }
                </div>
                <p className="text-[11px] text-center leading-tight w-full"
                  style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.7)" }}>
                  {card.name_uk}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
