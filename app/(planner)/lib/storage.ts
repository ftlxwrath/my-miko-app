"use client";

import { useEffect, useRef, useState } from "react";

export type TripPlan = {
  id: string;
  locationType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  intent?: string;
  intentDetails?: string;
  notes?: string;
  destination?: string;
  dates?: string;
  note?: string;
  createdAt: number;
};

export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  createdAt: number;
};

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export const STORAGE_KEYS = {
  trips: "miko.trips",
  schedule: "miko.schedule",
  todos: "miko.todos",
  prompts: "miko.prompts",
};

export const makeId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        setValue(JSON.parse(stored) as T);
      } catch {
        setValue(fallbackRef.current);
      }
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);

  return [value, setValue] as const;
}
