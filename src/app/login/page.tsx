"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Stars from "@/components/layout/Stars";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background: `
          radial-gradient(ellipse 120% 60% at 50% -10%, rgba(120,140,220,.14) 0%, transparent 60%),
          #06060F
        `,
      }}>

      <Stars count={60} />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Alstroemeria decoration */}
        <div className="flex justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="animate-float">
            <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.5)" transform="rotate(0 12 12)" />
            <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.45)" transform="rotate(120 12 12)" />
            <ellipse cx="12" cy="5.5" rx="2.2" ry="5.5" fill="rgba(155,128,212,.45)" transform="rotate(240 12 12)" />
            <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(180 12 12)" />
            <ellipse cx="12" cy="6" rx="1.7" ry="5" fill="rgba(185,160,240,.55)" transform="rotate(300 12 12)" />
            <circle cx="12" cy="12" r="2.2" fill="rgba(212,168,76,.7)" />
          </svg>
        </div>

        <h1 className="text-[32px] font-[400] leading-tight mb-2"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          Гримуар Ані
        </h1>
        <p className="text-[13px] mb-10"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.4)" }}>
          ♊ Твій особистий простір
        </p>

        {sent ? (
          <div className="rounded-[18px] p-6 text-center"
            style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.2)" }}>
            <div className="text-2xl mb-3">✉️</div>
            <p className="text-[15px] mb-1" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
              Перевір пошту
            </p>
            <p className="text-[12px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.45)" }}>
              Ми надіслали магічне посилання на {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="твоя@пошта.com"
              required
              className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none transition-all"
              style={{
                background: "rgba(13,11,30,.8)",
                border: "1px solid rgba(139,159,212,.2)",
                color: "#EAF0F8",
                fontFamily: "var(--font-manrope)",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[14px] text-[13px] font-[600] tracking-[0.1em] transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(139,159,212,.25), rgba(139,159,212,.15))",
                border: "1px solid rgba(139,159,212,.35)",
                color: "#EAF0F8",
                fontFamily: "var(--font-manrope)",
                letterSpacing: "0.12em",
              }}>
              {loading ? "Надсилаємо..." : "УВІЙТИ"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
