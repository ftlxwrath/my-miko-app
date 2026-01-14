"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS, useLocalStorageState } from "../lib/storage";

const baseCompliments = [
  "You are doing so well today.",
  "Your focus feels calm and steady.",
  "I love how thoughtful your plans are.",
  "You make progress look gentle.",
  "You are more prepared than you think.",
];

const cuteExtras = [
  "Tiny cheer: you are a star.",
  "I am proud of you already.",
  "Soft reminder: you are never behind.",
  "You are doing the brave and beautiful thing.",
  "I am cheering for you with sparkles.",
];

const pickRandom = (list: string[]) =>
  list[Math.floor(Math.random() * list.length)];

const buildCompliment = (prompts: string[]) => {
  const base = pickRandom(baseCompliments);
  const extra = pickRandom(cuteExtras);
  if (prompts.length) {
    const prompt = pickRandom(prompts);
    return `${base} About "${prompt}": ${extra}`;
  }
  return `${base} ${extra}`;
};

export default function MikoCompanion() {
  const [customPrompts] = useLocalStorageState<string[]>(
    STORAGE_KEYS.prompts,
    []
  );
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("Miko is here to cheer you on.");

  useEffect(() => {
    setMessage(buildCompliment(customPrompts));
  }, [customPrompts]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessage(buildCompliment(customPrompts));
    }, 45000);
    return () => window.clearInterval(timer);
  }, [customPrompts]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen ? (
        <div className="pointer-events-auto w-72 rounded-2xl border border-white/40 bg-[#b34343] px-4 py-4 text-sm text-white shadow-[0_24px_50px_-32px_rgba(145,49,49,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-white/70">
              Miko
            </span>
            <button
              className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Hide
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            {message}
          </p>
          <button
            className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2b1616] transition hover:bg-[#fdecec]"
            type="button"
            onClick={() => setMessage(buildCompliment(customPrompts))}
          >
            Another
          </button>
        </div>
      ) : (
        <button
          className="pointer-events-auto rounded-full bg-[#b34343] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#a23b3b]"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          Miko
        </button>
      )}
    </div>
  );
}
