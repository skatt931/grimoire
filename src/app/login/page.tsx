"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Stars from "@/components/layout/Stars";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Auto-confirmed — sign them in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If user doesn't exist yet, nudge them to register
        if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("not found")) {
          setError("Не знайдено акаунт. Спробуй зареєструватись.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background: `
          radial-gradient(ellipse 120% 60% at 50% -10%, rgba(120,140,220,.14) 0%, transparent 60%),
          #06060F
        `,
      }}
    >
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

        <h1
          className="text-[32px] font-[400] leading-tight mb-2"
          style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}
        >
          Гримуар Ані
        </h1>
        <p
          className="text-[13px] mb-8"
          style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.4)" }}
        >
          ♊ Твій особистий простір
        </p>

        {/* Mode toggle */}
        <div
          className="flex rounded-[12px] p-1 mb-6"
          style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.12)" }}
        >
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-[9px] text-[12px] font-[600] tracking-[0.08em] transition-all"
              style={{
                fontFamily: "var(--font-manrope)",
                background: mode === m ? "rgba(139,159,212,.18)" : "transparent",
                color: mode === m ? "#EAF0F8" : "rgba(234,240,248,.35)",
                border: mode === m ? "1px solid rgba(139,159,212,.25)" : "1px solid transparent",
              }}
            >
              {m === "signin" ? "УВІЙТИ" : "РЕЄСТРАЦІЯ"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="твоя@пошта.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none transition-all"
            style={{
              background: "rgba(13,11,30,.8)",
              border: "1px solid rgba(139,159,212,.2)",
              color: "#EAF0F8",
              fontFamily: "var(--font-manrope)",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "придумай пароль" : "пароль"}
            required
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none transition-all"
            style={{
              background: "rgba(13,11,30,.8)",
              border: "1px solid rgba(139,159,212,.2)",
              color: "#EAF0F8",
              fontFamily: "var(--font-manrope)",
            }}
          />

          {error && (
            <p
              className="text-[12px] text-center px-2"
              style={{ fontFamily: "var(--font-manrope)", color: "rgba(212,100,100,.85)" }}
            >
              {error}
            </p>
          )}

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
            }}
          >
            {loading ? "Зачекай..." : mode === "signin" ? "УВІЙТИ" : "ЗАРЕЄСТРУВАТИСЬ"}
          </button>
        </form>

        {mode === "signin" && (
          <p
            className="mt-4 text-[11px]"
            style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.22)" }}
          >
            Немає акаунту?{" "}
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              style={{ color: "rgba(139,159,212,.6)" }}
            >
              Зареєструватись
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
