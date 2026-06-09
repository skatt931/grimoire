"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CardPicker from "@/components/reading/CardPicker";
import type { Card, SpreadType } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

interface Position {
  name: string;
  card: Card | null;
  isReversed: boolean;
  note: string;
}

const THREE_CARD_POSITIONS = ["Минуле", "Теперішнє", "Майбутнє"];

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {([1, 2, 3, 4] as Step[]).map((s) => (
        <div key={s} className="h-1 rounded-full transition-all duration-300"
          style={{
            width: s === step ? "24px" : "8px",
            background: s <= step ? "#8B9FD4" : "rgba(139,159,212,.2)",
          }} />
      ))}
    </div>
  );
}

export default function NewReadingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("three_card");
  const [positions, setPositions] = useState<Position[]>(
    THREE_CARD_POSITIONS.map((name) => ({ name, card: null, isReversed: false, note: "" }))
  );
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function setSpread(type: SpreadType) {
    setSpreadType(type);
    setPositions(
      type === "three_card"
        ? THREE_CARD_POSITIONS.map((name) => ({ name, card: null, isReversed: false, note: "" }))
        : [{ name: "Позиція 1", card: null, isReversed: false, note: "" }]
    );
  }

  function addPosition() {
    setPositions((prev) => [...prev, { name: `Позиція ${prev.length + 1}`, card: null, isReversed: false, note: "" }]);
  }

  function removePosition(i: number) {
    setPositions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updatePosition(i: number, patch: Partial<Position>) {
    setPositions((prev) => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  function selectCard(card: Card) {
    if (pickerIndex === null) return;
    updatePosition(pickerIndex, { card });
    setPickerIndex(null);
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();

    // Get current user explicitly so user_id is always present
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        title: title.trim(),
        question: question.trim() || null,
        spread_type: spreadType,
        notes: notes.trim() || null,
        interpretation: interpretation.trim() || null,
      })
      .select()
      .single();

    if (error || !reading) {
      console.error("Reading save error:", error);
      setSaveError("Помилка збереження. Спробуй ще раз.");
      setSaving(false);
      return;
    }
    setSaveError("");

    const cards = positions
      .filter((p) => p.card)
      .map((p, i) => ({
        reading_id: reading.id,
        card_id: p.card!.id,
        position: i,
        position_name: p.name,
        is_reversed: p.isReversed,
        note: p.note.trim() || null,
      }));

    if (cards.length) await supabase.from("reading_cards").insert(cards);

    router.push(`/journal/${reading.id}`);
  }

  const selectedIds = positions.map((p) => p.card?.id).filter(Boolean) as number[];

  return (
    <div className="min-h-dvh pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-4">
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.14)" }}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="rgba(234,240,248,.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 17l-5-5 5-5" />
          </svg>
        </button>
        <h1 className="text-[22px]" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
          Нове читання
        </h1>
      </div>

      <div className="px-5">
        <StepIndicator step={step} />

        {/* ── Step 1: Title + Question ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <label className="block text-[13px] font-[600] tracking-[0.2em] uppercase mb-2"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
                Назва читання
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Наприклад: Про новий початок..."
                className="w-full px-4 py-3.5 rounded-[14px] text-[17px] outline-none"
                style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.18)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
            </div>
            <div>
              <label className="block text-[13px] font-[600] tracking-[0.2em] uppercase mb-2"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
                Питання або тема <span style={{ color: "rgba(234,240,248,.3)" }}>(необов'язково)</span>
              </label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder="Що хочу дослідити через карти?"
                rows={3}
                className="w-full px-4 py-3 rounded-[14px] text-[16px] outline-none resize-none leading-[1.7]"
                style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.15)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
            </div>
            <button onClick={() => title.trim() && setStep(2)} disabled={!title.trim()}
              className="w-full py-3.5 rounded-[14px] text-[16px] font-[600] tracking-[0.1em] uppercase transition-all disabled:opacity-40"
              style={{ background: "rgba(139,159,212,.18)", border: "1px solid rgba(139,159,212,.35)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }}>
              Далі →
            </button>
          </div>
        )}

        {/* ── Step 2: Spread type ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <p className="text-[16px] mb-4" style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.5)" }}>
              Який розклад ти хочеш використати?
            </p>
            {[
              { type: "three_card" as SpreadType, name: "Три карти", desc: "Минуле · Теперішнє · Майбутнє", icon: "✦ ✦ ✦" },
              { type: "free_form" as SpreadType, name: "Власний розклад", desc: "Довільна кількість позицій", icon: "✦ ··· ✦" },
            ].map(({ type, name, desc, icon }) => (
              <button key={type} onClick={() => { setSpread(type); setStep(3); }}
                className="w-full p-5 rounded-[18px] text-left transition-all active:scale-[0.98]"
                style={{
                  background: spreadType === type ? "rgba(139,159,212,.15)" : "rgba(13,11,30,.75)",
                  border: `1px solid ${spreadType === type ? "rgba(139,159,212,.35)" : "rgba(139,159,212,.12)"}`,
                }}>
                <p className="text-[21px] mb-1" style={{ color: "rgba(139,159,212,.5)" }}>{icon}</p>
                <p className="text-[18px] mb-0.5" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>{name}</p>
                <p className="text-[15px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.4)" }}>{desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 3: Card selection ── */}
        {step === 3 && (
          <div className="animate-fade-up">
            <p className="text-[16px] mb-4" style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.5)" }}>
              Обери карти для кожної позиції
            </p>
            <div className="space-y-3">
              {positions.map((pos, i) => (
                <div key={i} className="rounded-[16px] p-4"
                  style={{ background: "rgba(13,11,30,.75)", border: "1px solid rgba(139,159,212,.12)" }}>
                  {/* Position name */}
                  <div className="flex items-center justify-between mb-3">
                    <input value={pos.name} onChange={(e) => updatePosition(i, { name: e.target.value })}
                      className="text-[14px] font-[600] tracking-[0.12em] uppercase bg-transparent outline-none"
                      style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.75)" }} />
                    {spreadType === "free_form" && positions.length > 1 && (
                      <button onClick={() => removePosition(i)}
                        className="text-[13px] px-2 py-0.5 rounded"
                        style={{ color: "rgba(234,240,248,.25)", fontFamily: "var(--font-manrope)" }}>
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Card slot */}
                  {pos.card ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-16 rounded-[6px] flex items-center justify-center flex-shrink-0"
                        style={{ background: pos.card.arcana === "major" ? "rgba(212,168,76,.1)" : "rgba(139,159,212,.1)", border: "1px solid rgba(139,159,212,.15)" }}>
                        <span className="text-[13px]" style={{ color: pos.card.arcana === "major" ? "rgba(212,168,76,.5)" : "rgba(139,159,212,.5)" }}>✦</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[17px] mb-0.5" style={{ fontFamily: "var(--font-marcellus)", color: "#EAF0F8" }}>
                          {pos.card.name_uk}
                          {pos.isReversed && <span className="ml-1 text-[13px]" style={{ color: "rgba(212,168,76,.6)" }}>↓</span>}
                        </p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updatePosition(i, { isReversed: !pos.isReversed })}
                            className="text-[13px] font-[500]"
                            style={{ fontFamily: "var(--font-manrope)", color: pos.isReversed ? "#D4A84C" : "rgba(234,240,248,.35)" }}>
                            {pos.isReversed ? "Перевернуте ↓" : "Пряме ↑"}
                          </button>
                          <button onClick={() => updatePosition(i, { card: null })}
                            className="text-[13px]" style={{ color: "rgba(234,240,248,.25)", fontFamily: "var(--font-manrope)" }}>
                            Змінити
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setPickerIndex(i)}
                      className="w-full py-3 rounded-[10px] text-[15px] font-[500] tracking-[0.06em] transition-all"
                      style={{
                        background: "rgba(139,159,212,.06)",
                        border: "1px dashed rgba(139,159,212,.2)",
                        color: "rgba(139,159,212,.6)",
                        fontFamily: "var(--font-manrope)",
                      }}>
                      + Обрати карту
                    </button>
                  )}
                </div>
              ))}

              {spreadType === "free_form" && (
                <button onClick={addPosition}
                  className="w-full py-3 rounded-[14px] text-[15px] font-[500] tracking-[0.06em]"
                  style={{ background: "transparent", border: "1px dashed rgba(139,159,212,.15)", color: "rgba(139,159,212,.5)", fontFamily: "var(--font-manrope)" }}>
                  + Додати позицію
                </button>
              )}
            </div>

            <button onClick={() => setStep(4)}
              className="w-full py-3.5 rounded-[14px] text-[16px] font-[600] tracking-[0.1em] uppercase mt-5 transition-all"
              style={{ background: "rgba(139,159,212,.18)", border: "1px solid rgba(139,159,212,.35)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }}>
              Далі →
            </button>
          </div>
        )}

        {/* ── Step 4: Notes + Save ── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <label className="block text-[13px] font-[600] tracking-[0.2em] uppercase mb-2"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
                Нотатки <span style={{ color: "rgba(234,240,248,.3)" }}>(необов'язково)</span>
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Що відчуваю зараз, що помічаю в картах..."
                rows={4}
                className="w-full px-4 py-3 rounded-[14px] text-[16px] outline-none resize-none leading-[1.7]"
                style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.15)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
            </div>
            <div>
              <label className="block text-[13px] font-[600] tracking-[0.2em] uppercase mb-2"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.7)" }}>
                Інтерпретація <span style={{ color: "rgba(234,240,248,.3)" }}>(необов'язково)</span>
              </label>
              <textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)}
                placeholder="Мої особисті висновки і думки..."
                rows={4}
                className="w-full px-4 py-3 rounded-[14px] text-[16px] outline-none resize-none leading-[1.7]"
                style={{ background: "rgba(13,11,30,.8)", border: "1px solid rgba(139,159,212,.15)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }} />
            </div>

            {/* Selected cards summary */}
            <div className="rounded-[14px] p-4" style={{ background: "rgba(13,11,30,.6)", border: "1px solid rgba(139,159,212,.1)" }}>
              <p className="text-[13px] font-[600] tracking-[0.15em] uppercase mb-2"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(139,159,212,.6)" }}>
                Карти читання
              </p>
              <div className="flex flex-wrap gap-2">
                {positions.filter((p) => p.card).map((p, i) => (
                  <span key={i} className="text-[14px] px-2.5 py-1 rounded-full"
                    style={{ fontFamily: "var(--font-marcellus)", color: "rgba(234,240,248,.6)", background: "rgba(139,159,212,.08)", border: "1px solid rgba(139,159,212,.15)" }}>
                    {p.card!.name_uk}{p.isReversed ? " ↓" : ""}
                  </span>
                ))}
                {positions.every((p) => !p.card) && (
                  <span className="text-[14px]" style={{ fontFamily: "var(--font-manrope)", color: "rgba(234,240,248,.3)" }}>Карти не обрані</span>
                )}
              </div>
            </div>

            {saveError && (
              <p className="text-center text-[15px]"
                style={{ fontFamily: "var(--font-manrope)", color: "rgba(220,100,100,.9)" }}>
                {saveError}
              </p>
            )}

            <button onClick={save} disabled={saving || !title.trim()}
              className="w-full py-4 rounded-[14px] text-[16px] font-[600] tracking-[0.1em] uppercase transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgba(139,159,212,.25), rgba(139,159,212,.15))", border: "1px solid rgba(139,159,212,.4)", color: "#EAF0F8", fontFamily: "var(--font-manrope)" }}>
              {saving ? "Зберігаємо..." : "✦ Зберегти читання"}
            </button>
          </div>
        )}
      </div>

      {/* Card picker overlay */}
      {pickerIndex !== null && (
        <CardPicker
          onSelect={selectCard}
          onClose={() => setPickerIndex(null)}
          excludeIds={selectedIds}
        />
      )}
    </div>
  );
}
