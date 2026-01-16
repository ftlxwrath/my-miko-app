"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  makeId,
  useLocalStorageState,
  type ScheduleItem,
} from "../lib/storage";

export default function SchedulePage() {
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [viewDays, setViewDays] = useState(1);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
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
        date: scheduleDate,
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

  const dayLabels = useMemo(() => {
    const start = new Date(anchorDate);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: viewDays }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const key = day.toISOString().split("T")[0];
      const label = day.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return { key, label };
    });
  }, [anchorDate, viewDays]);

  const scheduleByDay = useMemo(() => {
    const normalizeDate = (item: ScheduleItem) =>
      item.date ?? new Date().toISOString().split("T")[0];
    const timeToMinutes = (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return 1440;
      const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
      if (!match) return 1440;
      const hour = Number(match[1]);
      const minute = Number(match[2] ?? "0");
      if (Number.isNaN(hour) || Number.isNaN(minute)) return 1440;
      let hours = hour;
      if (match[3] === "pm" && hour < 12) hours += 12;
      if (match[3] === "am" && hour === 12) hours = 0;
      return hours * 60 + minute;
    };
    const grouped: Record<string, ScheduleItem[]> = {};
    scheduleItems.forEach((item) => {
      const dateKey = normalizeDate(item);
      grouped[dateKey] = grouped[dateKey] ?? [];
      grouped[dateKey].push(item);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
      );
    });
    return grouped;
  }, [scheduleItems]);

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
          Schedule builder
        </h2>
        <p className="text-sm text-[#8a5e5e]">
          Add a date and time so the timetable stays clean.
        </p>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={addScheduleItem}>
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            type="date"
            value={scheduleDate}
            onChange={(event) => setScheduleDate(event.target.value)}
          />
          <input
            className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d08b8b]"
            placeholder="Time (e.g. 09:30)"
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
            className="rounded-2xl bg-[#f2c9c9] px-5 py-3 text-sm font-semibold text-[#2b1616] transition hover:bg-[#e7baba] md:col-span-3"
            type="submit"
          >
            Add schedule item
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Timetable
            </h2>
            <p className="text-sm text-[#8a5e5e]">
              Switch between a 1-day or 3-day view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                viewDays === 1
                  ? "border-[#b34343] bg-[#fdecec] text-[#b06767]"
                  : "border-[#f1d6d6] bg-white text-[#8a5e5e] hover:border-[#b34343]"
              }`}
              type="button"
              onClick={() => setViewDays(1)}
            >
              1 day
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                viewDays === 3
                  ? "border-[#b34343] bg-[#fdecec] text-[#b06767]"
                  : "border-[#f1d6d6] bg-white text-[#8a5e5e] hover:border-[#b34343]"
              }`}
              type="button"
              onClick={() => setViewDays(3)}
            >
              3 days
            </button>
            <button
              className="rounded-full border border-[#f1d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5e5e] transition hover:border-[#b34343] hover:text-[#b06767]"
              type="button"
              onClick={() =>
                setAnchorDate((current) => {
                  const next = new Date(current);
                  next.setDate(current.getDate() - viewDays);
                  return next;
                })
              }
            >
              Prev
            </button>
            <button
              className="rounded-full border border-[#f1d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5e5e] transition hover:border-[#b34343] hover:text-[#b06767]"
              type="button"
              onClick={() =>
                setAnchorDate((current) => {
                  const next = new Date(current);
                  next.setDate(current.getDate() + viewDays);
                  return next;
                })
              }
            >
              Next
            </button>
          </div>
        </div>
        <div
          className={`mt-6 grid gap-4 ${
            viewDays === 3 ? "md:grid-cols-3" : "md:grid-cols-1"
          }`}
        >
          {dayLabels.map((day) => {
            const items = scheduleByDay[day.key] ?? [];
            return (
              <div
                key={day.key}
                className="rounded-2xl border border-[#f3e0e0] bg-white px-4 py-4"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
                  {day.label}
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[#6f4a4a]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-[#f3e0e0] bg-white px-3 py-3"
                    >
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                          {item.time || "Anytime"}
                        </div>
                        <div className="text-sm font-semibold text-[#2b1616]">
                          {item.title}
                        </div>
                      </div>
                      <button
                        className="text-xs uppercase tracking-[0.2em] text-[#b06767]"
                        type="button"
                        onClick={() => removeScheduleItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {!items.length ? (
                    <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-3 py-6 text-center text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                      No items yet
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
