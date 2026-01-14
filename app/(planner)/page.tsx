"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  STORAGE_KEYS,
  useLocalStorageState,
  type ScheduleItem,
  type TodoItem,
  type TripPlan,
} from "./lib/storage";

const sortByNewest = <T extends { createdAt: number }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatDateRange = (start?: string, end?: string) => {
  if (start && end) return `${formatDate(start)} to ${formatDate(end)}`;
  if (start) return `Starts ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;
  return "";
};

export default function Home() {
  const [trips] = useLocalStorageState<TripPlan[]>(STORAGE_KEYS.trips, []);
  const [scheduleItems] = useLocalStorageState<ScheduleItem[]>(
    STORAGE_KEYS.schedule,
    []
  );
  const [todos] = useLocalStorageState<TodoItem[]>(STORAGE_KEYS.todos, []);

  const upcomingSchedule = useMemo(
    () => sortByNewest(scheduleItems).slice(0, 3),
    [scheduleItems]
  );
  const upcomingTrips = useMemo(
    () => sortByNewest(trips).slice(0, 3),
    [trips]
  );
  const openTodos = useMemo(
    () => todos.filter((todo) => !todo.done).slice(0, 3),
    [todos]
  );

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
          Welcome back
        </span>
        <h1
          className="text-4xl font-semibold leading-tight text-[#2b1616] md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Keep your trips in focus, with the rest gently organized.
        </h1>
        <p className="max-w-2xl text-lg text-[#6f4a4a]">
          Start with your next adventure, then glance at the schedule and to-dos.
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link
            className="rounded-full bg-[#b34343] px-5 py-3 text-white transition hover:bg-[#a23b3b]"
            href="/trips"
          >
            Plan a trip
          </Link>
          <Link
            className="rounded-full border border-[#f1d6d6] bg-white px-5 py-3 text-[#2b1616] transition hover:border-[#d7a7a7]"
            href="/schedule"
          >
            Add schedule
          </Link>
          <Link
            className="rounded-full border border-[#f1d6d6] bg-white px-5 py-3 text-[#2b1616] transition hover:border-[#d7a7a7]"
            href="/todos"
          >
            Update to-dos
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trips to remember
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
              {trips.length} total
            </span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-[#6f4a4a]">
            {upcomingTrips.map((trip) => {
              const locationLabel = trip.location ?? trip.destination ?? "Trip";
              const dateLabel =
                formatDateRange(trip.startDate, trip.endDate) || trip.dates || "";
              return (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-[#f3e0e0] bg-white px-4 py-4"
                >
                  <div className="text-base font-semibold text-[#2b1616]">
                    {locationLabel}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                    {dateLabel || "Dates to be decided"}
                  </div>
                  {trip.intentDetails || trip.intent ? (
                    <div className="mt-2 text-sm text-[#6f4a4a]">
                      {trip.intentDetails || trip.intent}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {!upcomingTrips.length ? (
              <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
                Add a trip to see it here.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Upcoming schedule
              </h2>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                {scheduleItems.length} total
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#6f4a4a]">
              {upcomingSchedule.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#f3e0e0] bg-white px-4 py-3"
                >
                  <span className="font-semibold text-[#2b1616]">
                    {item.time || "Anytime"}
                  </span>{" "}
                  {item.title}
                </div>
              ))}
              {!upcomingSchedule.length ? (
                <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
                  Nothing scheduled yet.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Open to-dos
              </h2>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                {todos.length} total
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#6f4a4a]">
              {openTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-2xl border border-[#f3e0e0] bg-white px-4 py-3"
                >
                  {todo.text}
                </div>
              ))}
              {!openTodos.length ? (
                <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
                  You are all caught up.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
