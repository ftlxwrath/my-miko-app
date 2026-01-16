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
  date?: string;
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
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) {
        return;
      }
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        setValue(fallbackRef.current);
      }
    };
    const handleCustom = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: T }>;
      if (customEvent.detail?.key !== key) {
        return;
      }
      setValue(customEvent.detail.value);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("miko-storage", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("miko-storage", handleCustom);
    };
  }, [key, loaded]);

  const setStoredValue = (next: T | ((current: T) => T)) => {
    if (typeof window === "undefined") {
      return;
    }
    setValue((current) => {
      const nextValue =
        typeof next === "function"
          ? (next as (current: T) => T)(current)
          : next;
      const cleanedValue = Array.isArray(nextValue)
        ? (nextValue.filter(Boolean) as T)
        : nextValue;
      if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(cleanedValue));
      }
      window.dispatchEvent(
        new CustomEvent("miko-storage", { detail: { key, value: cleanedValue } })
      );
      return cleanedValue;
    });
  };

  return [value, setStoredValue] as const;
}
