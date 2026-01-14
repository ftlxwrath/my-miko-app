"use client";

import { type FormEvent, useState } from "react";
import {
  STORAGE_KEYS,
  useLocalStorageState,
} from "../lib/storage";

export default function CompanionPage() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [customPrompts, setCustomPrompts] = useLocalStorageState<string[]>(
    STORAGE_KEYS.prompts,
    []
  );

  const addPrompt = (event: FormEvent) => {
    event.preventDefault();
    if (!customPrompt.trim()) {
      return;
    }
    setCustomPrompts((current) => [...current, customPrompt.trim()]);
    setCustomPrompt("");
  };

  const removePrompt = (prompt: string) => {
    setCustomPrompts((current) => current.filter((item) => item !== prompt));
  };

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
          Miko companion
        </span>
        <h1
          className="text-4xl font-semibold leading-tight text-[#2b1616] md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Give Miko the sweetest things to cheer you on about.
        </h1>
        <p className="max-w-2xl text-lg text-[#6f4a4a]">
          Add custom prompts so the pop-up companion feels even more personal.
        </p>
      </header>

      <section className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Custom prompts
        </h2>
        <p className="text-sm text-[#8a5e5e]">
          Example: remind me to pack chargers.
        </p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={addPrompt}>
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            placeholder="What should Miko cheer you on about?"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
          />
          <button
            className="rounded-2xl bg-[#f2c9c9] px-5 py-3 text-sm font-semibold text-[#2b1616] transition hover:bg-[#e7baba]"
            type="submit"
          >
            Add prompt
          </button>
        </form>
        <div className="mt-4 grid gap-2">
          {customPrompts.map((prompt) => (
            <div
              key={`${prompt}-${prompt.length}`}
              className="flex items-center justify-between rounded-2xl border border-[#f3e0e0] bg-white px-4 py-3 text-sm text-[#6f4a4a]"
            >
              <span>{prompt}</span>
              <button
                className="text-xs uppercase tracking-[0.2em] text-[#b06767]"
                type="button"
                onClick={() => removePrompt(prompt)}
              >
                Remove
              </button>
            </div>
          ))}
          {!customPrompts.length ? (
            <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
              Add your first prompt to personalize Miko.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
