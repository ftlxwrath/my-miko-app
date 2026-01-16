"use client";

import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  useLocalStorageState,
  type ScheduleItem,
  type TodoItem,
  type TripPlan,
} from "../lib/storage";
import { buildNotifications } from "../lib/notifications";

const baseCompliments = [
  "You look happy when you plan",
  "Your smile is so nice",
  "You are doing so well today.",
  "Your focus feels calm and steady.",
  "I love how thoughtful your plans are.",
  "You make progress look gentle.",
  "You are more prepared than you think.",
];

const cuteExtras = [
  "Len Lei",
  "Lei Ho Len",
  "Tiny cheer: you are a star.",
  "I am proud of you already.",
  "Soft reminder: you are never behind.",
  "You are doing the brave and beautiful thing.",
  "I am cheering for you with sparkles.",
];

const pickRandom = (list: string[]) =>
  list[Math.floor(Math.random() * list.length)];

const buildCompliment = ({
  prompts,
  todos,
  trips,
}: {
  prompts: string[];
  todos: TodoItem[];
  trips: TripPlan[];
}) => {
  const options: Array<"generic" | "trip" | "prompt"> = ["generic"];
  if (trips.length) options.push("trip");
  if (prompts.length) options.push("prompt");

  const choice = pickRandom(options);

  if (choice === "trip" && trips.length) {
    const trip = trips[trips.length - 1];
    const location = trip.location ?? trip.destination ?? "your trip";
    if (trip.startDate) {
      const startDate = new Date(trip.startDate);
      if (!Number.isNaN(startDate.getTime()) && startDate > new Date()) {
        return `Counting down to ${location}! ${pickRandom(cuteExtras)}`;
      }
    }
    if (trip.endDate) {
      const endDate = new Date(trip.endDate);
      if (!Number.isNaN(endDate.getTime()) && endDate < new Date()) {
        return `Thinking about ${location} and smiling. ${pickRandom(
          cuteExtras
        )}`;
      }
    }
    return `You are going to love ${location}. ${pickRandom(cuteExtras)}`;
  }

  if (choice === "prompt" && prompts.length) {
    const prompt = pickRandom(prompts);
    return `You are doing so well with "${prompt}". ${pickRandom(cuteExtras)}`;
  }

  return `${pickRandom(baseCompliments)} ${pickRandom(cuteExtras)}`;
};

export default function MikoCompanion() {
  const [customPrompts] = useLocalStorageState<string[]>(
    STORAGE_KEYS.prompts,
    []
  );
  const [todos] = useLocalStorageState<TodoItem[]>(STORAGE_KEYS.todos, []);
  const [scheduleItems] = useLocalStorageState<ScheduleItem[]>(
    STORAGE_KEYS.schedule,
    []
  );
  const [trips] = useLocalStorageState<TripPlan[]>(STORAGE_KEYS.trips, []);
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("Miko is here to cheer you on.");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setMessage(buildCompliment({ prompts: customPrompts, todos, trips }));
  }, [customPrompts, todos, trips]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessage(buildCompliment({ prompts: customPrompts, todos, trips }));
    }, 45000);
    return () => window.clearInterval(timer);
  }, [customPrompts, todos, trips]);

  const notifications = useMemo(
    () =>
      buildNotifications({
        now,
        todos,
        scheduleItems,
        trips,
      }),
    [now, scheduleItems, todos, trips]
  );
  const recentNotifications = notifications.slice(0, 2);

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
            onClick={() =>
              setMessage(buildCompliment({ prompts: customPrompts, todos, trips }))
            }
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

      {recentNotifications.length ? (
        <div className="flex w-72 flex-col gap-2">
          {recentNotifications.map((notice) => (
            <div
              key={notice.id}
              className="pointer-events-auto rounded-2xl border border-[#f1d6d6] bg-white/95 px-4 py-3 text-sm text-[#2b1616] shadow-[0_18px_40px_-32px_rgba(145,49,49,0.25)]"
            >
              <span className="block text-xs uppercase tracking-[0.2em] text-[#b06767]">
                Reminder
              </span>
              <p className="mt-2 text-sm text-[#6f4a4a]">{notice.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
