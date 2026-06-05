"use client";

import { useEffect, useState } from "react";

function computeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Добрий ранок";
  if (h >= 12 && h < 18) return "Доброго дня";
  if (h >= 18 && h < 23) return "Добрий вечір";
  return "Доброї ночі";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });
}

export default function Greeting() {
  // Mount client-side only to avoid SSR/client hydration mismatch
  const [greeting, setGreeting] = useState("Вітаємо");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(computeGreeting());
    setDateStr(formatDate(now));
  }, []);

  return (
    <>
      <h1 className="text-[36px] leading-[1.1] mb-1"
        style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
        {greeting},<br />
        <em style={{ color: "#D4A84C" }}>Аню</em>
      </h1>
      {dateStr && (
        <p className="text-[12px] capitalize"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.35)" }}>
          {dateStr}
        </p>
      )}
    </>
  );
}
