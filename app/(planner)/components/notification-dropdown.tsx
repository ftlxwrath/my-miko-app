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

export default function NotificationDropdown() {
  const [todos] = useLocalStorageState<TodoItem[]>(STORAGE_KEYS.todos, []);
  const [scheduleItems] = useLocalStorageState<ScheduleItem[]>(
    STORAGE_KEYS.schedule,
    []
  );
  const [trips] = useLocalStorageState<TripPlan[]>(STORAGE_KEYS.trips, []);
  const [now, setNow] = useState(() => new Date());
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (notificationIndex >= notifications.length) {
      setNotificationIndex(0);
    }
  }, [notifications.length, notificationIndex]);

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#7b4c4c] shadow-sm transition hover:border-[#b34343] hover:text-[#2b1616]">
        <span>Notifs</span>
        <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-xs text-[#b06767]">
          {notifications.length || 0}
        </span>
      </summary>
      <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-[#f1d6d6] bg-white/95 p-4 text-sm text-[#6f4a4a] shadow-[0_24px_50px_-32px_rgba(145,49,49,0.25)]">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
            Notifications
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
            {notifications.length || 0}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <select
            className="rounded-2xl border border-[#f1d6d6] bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#8a5e5e] outline-none transition focus:border-[#b34343]"
            value={notificationIndex}
            onChange={(event) =>
              setNotificationIndex(Number(event.target.value) || 0)
            }
            disabled={!notifications.length}
          >
            {notifications.length ? (
              notifications.map((notice, index) => (
                <option key={notice.id} value={index}>
                  {`Note ${index + 1}`}
                </option>
              ))
            ) : (
              <option>No reminders</option>
            )}
          </select>
          <p className="min-h-[56px] text-sm leading-relaxed text-[#2b1616]">
            {notifications.length
              ? notifications[notificationIndex]?.message ?? "All caught up."
              : "No reminders right now."}
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-xl border border-[#f1d6d6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
              type="button"
              onClick={() =>
                setNotificationIndex((current) =>
                  notifications.length
                    ? (current + notifications.length - 1) %
                      notifications.length
                    : 0
                )
              }
            >
              Back
            </button>
            <button
              className="flex-1 rounded-xl bg-[#b34343] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#a23b3b]"
              type="button"
              onClick={() =>
                setNotificationIndex((current) =>
                  notifications.length
                    ? (current + 1) % notifications.length
                    : 0
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
