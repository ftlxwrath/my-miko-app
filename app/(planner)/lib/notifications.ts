"use client";

import type { ScheduleItem, TodoItem, TripPlan } from "./storage";

export type NotificationItem = {
  id: string;
  message: string;
  timestamp: number;
};

const parseTimeToDate = (timeValue: string, dateValue: string | undefined, now: Date) => {
  const normalized = timeValue.trim().toLowerCase();
  if (!normalized) return null;
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  let hours = hour;
  if (match[3] === "pm" && hour < 12) hours += 12;
  if (match[3] === "am" && hour === 12) hours = 0;
  if (hours > 23 || minute > 59) return null;
  const date = dateValue ? new Date(dateValue) : new Date(now);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(hours, minute, 0, 0);
  return date;
};

export const buildNotifications = ({
  now,
  todos,
  scheduleItems,
  trips,
}: {
  now: Date;
  todos: TodoItem[];
  scheduleItems: ScheduleItem[];
  trips: TripPlan[];
}) => {
  const items: NotificationItem[] = [];
  const openTodos = todos.filter((todo) => !todo.done);
  openTodos.forEach((todo) => {
    items.push({
      id: `todo-${todo.id}`,
      message: `To-do reminder: ${todo.text}`,
      timestamp: todo.createdAt ?? now.getTime(),
    });
  });

  scheduleItems.forEach((item) => {
    const date = parseTimeToDate(item.time, item.date, now);
    if (!date) return;
    const diffMinutes = (date.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 0 || diffMinutes > 30) return;
    const timeLabel = item.time ? ` at ${item.time}` : "";
    items.push({
      id: `schedule-${item.id}`,
      message: `Upcoming in 30 minutes: ${item.title}${timeLabel}`,
      timestamp: date.getTime(),
    });
  });

  if (trips.length) {
    const trip = trips[trips.length - 1];
    const location = trip.location ?? trip.destination ?? "your trip";
    if (trip.startDate) {
      const startDate = new Date(trip.startDate);
      if (!Number.isNaN(startDate.getTime()) && startDate > now) {
        items.push({
          id: `trip-start-${trip.id}`,
          message: `Get excited for ${location} - it is almost time!`,
          timestamp: startDate.getTime(),
        });
      }
    }
    if (trip.endDate) {
      const endDate = new Date(trip.endDate);
      if (!Number.isNaN(endDate.getTime()) && endDate < now) {
        items.push({
          id: `trip-end-${trip.id}`,
          message: `Remember ${location}? You did that.`,
          timestamp: endDate.getTime(),
        });
      }
    }
  }

  return items.sort((a, b) => b.timestamp - a.timestamp);
};
