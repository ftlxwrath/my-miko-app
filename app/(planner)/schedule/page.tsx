"use client";

import { type FormEvent, useState } from "react";
import {
  STORAGE_KEYS,
  makeId,
  useLocalStorageState,
  type ScheduleItem,
} from "../lib/storage";

export default function SchedulePage() {
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleItems, setScheduleItems] = useLocalStorageState<ScheduleItem[]>(
    STORAGE_KEYS.schedule,
    []
  );

  const addScheduleItem = (event: FormEvent) => {
    event.preventDefault();
    if (!scheduleTitle.trim()) {
      return;
    }
    setScheduleItems((current) => [
      ...current,
      {
        id: makeId(),
        time: scheduleTime.trim(),
        title: scheduleTitle.trim(),
        createdAt: Date.now(),
      },
    ]);
    setScheduleTime("");
    setScheduleTitle("");
  };

  const removeScheduleItem = (id: string) => {
    setScheduleItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
          Schedule
        </span>
        <h1
          className="text-4xl font-semibold leading-tight text-[#2b1616] md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Keep your day light, clear, and easy to follow.
        </h1>
        <p className="max-w-2xl text-lg text-[#6f4a4a]">
          Add the key moments you want to remember, and keep the rest open.
        </p>
      </header>

      <section className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Today&#39;s plan
        </h2>
        <p className="text-sm text-[#8a5e5e]">
          Add a time or keep it open with &#34;Anytime&#34;.
        </p>
        <form className="mt-4 grid gap-3" onSubmit={addScheduleItem}>
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            placeholder="Time"
            value={scheduleTime}
            onChange={(event) => setScheduleTime(event.target.value)}
          />
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            placeholder="Activity"
            value={scheduleTitle}
            onChange={(event) => setScheduleTitle(event.target.value)}
          />
          <button
            className="rounded-2xl bg-[#f2c9c9] px-5 py-3 text-sm font-semibold text-[#2b1616] transition hover:bg-[#e7baba]"
            type="submit"
          >
            Add schedule item
          </button>
        </form>
        <div className="mt-4 grid gap-2">
          {scheduleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-[#f3e0e0] bg-white px-4 py-3 text-sm text-[#6f4a4a]"
            >
              <span>
                <span className="font-semibold text-[#2b1616]">
                  {item.time || "Anytime"}
                </span>{" "}
                {item.title}
              </span>
              <button
                className="text-xs uppercase tracking-[0.2em] text-[#b06767]"
                type="button"
                onClick={() => removeScheduleItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {!scheduleItems.length ? (
            <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
              Add a schedule item to see it here.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
