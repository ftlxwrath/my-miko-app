"use client";

import { type FormEvent, useState } from "react";
import {
  STORAGE_KEYS,
  makeId,
  useLocalStorageState,
  type ScheduleItem,
  type TodoItem,
  type TripPlan,
} from "../lib/storage";
import { TOP_DESTINATIONS, type DestinationInfo } from "../lib/destinations";

const intentPlans: Record<
  string,
  {
    recommendations: string[];
    todos: string[];
    schedule: { time: string; title: string }[];
  }
> = {
  Sightseeing: {
    recommendations: [
      "Pick 2 must-see landmarks and book tickets early.",
      "Plan a walking loop around the central district.",
      "Check sunrise or sunset viewpoints.",
    ],
    todos: [
      "Download offline city maps",
      "Save key attractions in a notes app",
      "Check opening hours and ticket rules",
    ],
    schedule: [
      { time: "09:00", title: "Landmark visit and photos" },
      { time: "14:00", title: "Neighborhood stroll" },
      { time: "19:00", title: "Viewpoint or skyline walk" },
    ],
  },
  Food: {
    recommendations: [
      "List 3 signature dishes to try.",
      "Find a highly rated local market or food street.",
      "Balance reservations with casual spots.",
    ],
    todos: [
      "Save restaurant short list",
      "Check if reservations are needed",
      "Note any dietary preferences",
    ],
    schedule: [
      { time: "09:00", title: "Coffee and local breakfast" },
      { time: "13:00", title: "Market or street food crawl" },
      { time: "19:30", title: "Dinner at a must-try spot" },
    ],
  },
  Culture: {
    recommendations: [
      "Choose one museum and one historic site.",
      "Look for a performance or gallery night.",
      "Review cultural etiquette basics.",
    ],
    todos: [
      "Check museum ticket windows",
      "Save cultural tips",
      "Pack a light scarf or layers",
    ],
    schedule: [
      { time: "10:00", title: "Museum or gallery visit" },
      { time: "15:00", title: "Historic district tour" },
      { time: "19:00", title: "Performance or cultural event" },
    ],
  },
  Nature: {
    recommendations: [
      "Pick one scenic trail or park.",
      "Check weather and trail conditions.",
      "Plan for sunrise, sunset, or golden hour.",
    ],
    todos: ["Pack water and snacks", "Charge camera or phone", "Check transit to trail"],
    schedule: [
      { time: "08:00", title: "Scenic walk or hike" },
      { time: "13:30", title: "Lake, garden, or park visit" },
      { time: "18:30", title: "Sunset viewpoint" },
    ],
  },
  Relaxation: {
    recommendations: [
      "Identify calm spots like cafes or spas.",
      "Keep free space in the day for rest.",
      "Choose a gentle evening activity.",
    ],
    todos: ["Pack comfortable layers", "Save two cozy cafes", "Bring a book or playlist"],
    schedule: [
      { time: "09:30", title: "Slow breakfast and stroll" },
      { time: "14:00", title: "Spa, bathhouse, or quiet park" },
      { time: "18:00", title: "Early dinner and wind-down" },
    ],
  },
  Shopping: {
    recommendations: [
      "List the top neighborhoods or markets.",
      "Set a budget and priority items.",
      "Check store hours and tax-free rules.",
    ],
    todos: ["Bring a packable tote", "Note currency exchange rates", "Save store locations"],
    schedule: [
      { time: "10:00", title: "Market or flagship store visit" },
      { time: "14:30", title: "Boutiques and local shops" },
      { time: "19:00", title: "Pack purchases and rest" },
    ],
  },
  Adventure: {
    recommendations: [
      "Book any high-demand activities early.",
      "Review safety gear or requirements.",
      "Plan recovery time the next day.",
    ],
    todos: ["Confirm bookings", "Pack activity gear", "Check safety guidelines"],
    schedule: [
      { time: "09:00", title: "Main activity session" },
      { time: "15:00", title: "Recovery and light exploring" },
      { time: "19:30", title: "Easy dinner and rest" },
    ],
  },
  Work: {
    recommendations: [
      "Identify quiet work-friendly cafes.",
      "Schedule focus blocks around meetings.",
      "Keep one small adventure each day.",
    ],
    todos: ["Check Wi-Fi options", "Pack chargers and adapters", "Block calendar focus time"],
    schedule: [
      { time: "09:00", title: "Deep work block" },
      { time: "14:00", title: "Meetings or coworking" },
      { time: "19:00", title: "Short city break" },
    ],
  },
};

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

const getDurationLabel = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }
  const diff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "";
  return `${diff} days`;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreDestinationMatch = (query: string, destination: DestinationInfo) => {
  const name = normalizeText(destination.name);
  const country = normalizeText(destination.country);
  if (!query) return 0;
  if (query === name) return 3;
  if (name.includes(query) || query.includes(name)) return 2;
  if (query === country) return 2;
  if (country.includes(query) || query.includes(country)) return 1;
  return 0;
};

export default function TripsPage() {
  const [locationType, setLocationType] = useState("City");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intent, setIntent] = useState("Sightseeing");
  const [intentDetails, setIntentDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [tripPlans, setTripPlans] = useLocalStorageState<TripPlan[]>(
    STORAGE_KEYS.trips,
    []
  );
  const [scheduleItems, setScheduleItems] = useLocalStorageState<ScheduleItem[]>(
    STORAGE_KEYS.schedule,
    []
  );
  const [todos, setTodos] = useLocalStorageState<TodoItem[]>(
    STORAGE_KEYS.todos,
    []
  );
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const addTripPlan = (event: FormEvent) => {
    event.preventDefault();
    if (!location.trim()) {
      return;
    }
    const newTrip = {
      id: makeId(),
      locationType,
      location: location.trim(),
      startDate,
      endDate,
      intent,
      intentDetails: intentDetails.trim(),
      notes: notes.trim(),
      createdAt: Date.now(),
    };
    setTripPlans((current) => [...current, newTrip]);
    setActiveTripId(newTrip.id);
    setLocation("");
    setStartDate("");
    setEndDate("");
    setIntentDetails("");
    setNotes("");
  };

  const removeTrip = (id: string) => {
    setTripPlans((current) => {
      const next = current.filter((trip) => trip.id !== id);
      if (activeTripId === id) {
        setActiveTripId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const activeTrip =
    tripPlans.find((trip) => trip.id === activeTripId) ??
    tripPlans[tripPlans.length - 1];

  const tripLabel =
    activeTrip?.location ?? activeTrip?.destination ?? "your trip";

  const locationQuery = normalizeText(activeTrip?.location ?? location);
  const destinationMatches = TOP_DESTINATIONS.map((destination) => ({
    destination,
    score: scoreDestinationMatch(locationQuery, destination),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name))
    .slice(0, 3);

  const addTodoItem = (text: string) => {
    const entry: TodoItem = {
      id: makeId(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((current) => [...current, entry]);
  };

  const addScheduleItem = (time: string, title: string, date?: string) => {
    const entry: ScheduleItem = {
      id: makeId(),
      date,
      time,
      title,
      createdAt: Date.now(),
    };
    setScheduleItems((current) => [...current, entry]);
  };

  const addAllTodos = () => {
    helperPlan.todos.forEach((item) =>
      addTodoItem(`${item} for ${tripLabel}`)
    );
  };

  const addAllSchedule = () => {
    helperPlan.schedule.forEach((item) =>
      addScheduleItem(
        item.time,
        `${item.title} in ${tripLabel}`,
        activeTrip?.startDate
      )
    );
  };

  const helperPlan = intentPlans[activeTrip?.intent ?? ""] ?? intentPlans.Sightseeing;

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
          Trips
        </span>
        <h1
          className="text-4xl font-semibold leading-tight text-[#2b1616] md:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Plan each trip with a clear, gentle focus.
        </h1>
        <p className="max-w-2xl text-lg text-[#6f4a4a]">
          Choose the place, how long you are going, and what you want to do
          there. Miko will help with ideas and quick planning.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(170,74,74,0.4)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Trip plan
              </h2>
              <p className="text-sm text-[#8a5e5e]">
                {tripPlans.length} trips planned.
              </p>
            </div>
            <div className="rounded-2xl bg-[#fdecec] px-4 py-3 text-sm text-[#8a5e5e]">
              Example: Hong Kong, Jan 21 to Jan 30, sightseeing and trying food.
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={addTripPlan}>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              Location type
              <select
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                value={locationType}
                onChange={(event) => setLocationType(event.target.value)}
              >
                <option>City</option>
                <option>Country</option>
                <option>Province/Region</option>
                <option>Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              Location
              <input
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                placeholder="Where are you going?"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              Start date
              <input
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              End date
              <input
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              Trip focus
              <select
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
              >
                {Object.keys(intentPlans).map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a]">
              What you want to do
              <input
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                placeholder="Sightseeing, trying food, shopping..."
                value={intentDetails}
                onChange={(event) => setIntentDetails(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#6f4a4a] md:col-span-2">
              Notes
              <input
                className="rounded-2xl border border-[#f1d6d6] bg-white px-4 py-3 text-sm text-[#2b1616] outline-none transition focus:border-[#d08b8b]"
                placeholder="Anything else you want to remember"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
            <button
              className="rounded-2xl bg-[#b34343] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a23b3b] md:col-span-2"
              type="submit"
            >
              Add trip
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            {tripPlans.map((trip) => {
              const locationLabel = trip.location ?? trip.destination ?? "Trip";
              const dateLabel =
                formatDateRange(trip.startDate, trip.endDate) || trip.dates || "";
              const durationLabel = getDurationLabel(
                trip.startDate,
                trip.endDate
              );
              return (
                <div
                  key={trip.id}
                  className={`flex flex-col gap-2 rounded-2xl border px-4 py-4 text-sm transition ${
                    trip.id === activeTrip?.id
                      ? "border-[#b34343] bg-[#fff0f0]"
                      : "border-[#f3e0e0] bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-base font-semibold text-[#2b1616]">
                        {locationLabel}
                      </span>
                      {dateLabel ? (
                        <span className="ml-3 rounded-full bg-[#fdecec] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                          {dateLabel}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded-full border border-[#f1d6d6] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
                        type="button"
                        onClick={() => setActiveTripId(trip.id)}
                      >
                        Focus
                      </button>
                      <button
                        className="text-xs uppercase tracking-[0.2em] text-[#b06767]"
                        type="button"
                        onClick={() => removeTrip(trip.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-[#6f4a4a]">
                    {trip.locationType ? `${trip.locationType} trip` : null}
                    {durationLabel ? ` - ${durationLabel}` : ""}
                  </div>
                  {trip.intentDetails || trip.intent || trip.note ? (
                    <p className="text-sm text-[#6f4a4a]">
                      {trip.intentDetails || trip.intent || trip.note}
                    </p>
                  ) : null}
                  {trip.notes ? (
                    <p className="text-sm text-[#6f4a4a]">{trip.notes}</p>
                  ) : null}
                </div>
              );
            })}
            {!tripPlans.length ? (
              <p className="rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
                Add a trip to get started.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[#f1d6d6] bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(170,74,74,0.4)] backdrop-blur">
            <h3
              className="text-2xl font-semibold text-[#2b1616]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trip helper
            </h3>
            <p className="text-sm text-[#8a5e5e]">
              Based on your trip focus, here are gentle suggestions.
            </p>
            {activeTrip ? (
              <div className="mt-4 flex flex-col gap-4 text-sm text-[#6f4a4a]">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
                    Local highlights
                  </span>
                  {destinationMatches.length ? (
                    <ul className="mt-2 grid gap-2">
                      {destinationMatches.map(({ destination }) => (
                        <li
                          key={destination.name}
                          className="rounded-2xl border border-[#f3e0e0] bg-white px-3 py-3"
                        >
                          <div className="text-sm font-semibold text-[#2b1616]">
                            {destination.name}, {destination.country}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[#8a5e5e]">
                            {destination.highlights.map((item) => (
                              <span
                                key={`${destination.name}-${item}`}
                                className="rounded-full bg-[#fdecec] px-3 py-1"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-4 text-sm text-[#8a5e5e]">
                      Add a known destination (like Toronto or Paris) to see tailored ideas.
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
                    Recommendations
                  </span>
                  <ul className="mt-2 grid gap-2">
                    {helperPlan.recommendations.map((item) => (
                      <li
                        key={item}
                        className="rounded-2xl border border-[#f3e0e0] bg-white px-3 py-3"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
                      Quick to-dos
                    </span>
                    <button
                      className="rounded-full border border-[#f1d6d6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
                      type="button"
                      onClick={addAllTodos}
                    >
                      Add all
                    </button>
                  </div>
                  <ul className="mt-2 grid gap-2">
                    {helperPlan.todos.map((item) => (
                      <li
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-[#f3e0e0] bg-white px-3 py-3"
                      >
                        <span>{item}</span>
                        <button
                          className="rounded-full border border-[#f1d6d6] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
                          type="button"
                          onClick={() =>
                            addTodoItem(`${item} for ${tripLabel}`)
                          }
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#b06767]">
                      Schedule starters
                    </span>
                    <button
                      className="rounded-full border border-[#f1d6d6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
                      type="button"
                      onClick={addAllSchedule}
                    >
                      Add all
                    </button>
                  </div>
                  <ul className="mt-2 grid gap-2">
                    {helperPlan.schedule.map((item) => (
                      <li
                        key={`${item.time}-${item.title}`}
                        className="flex items-center justify-between rounded-2xl border border-[#f3e0e0] bg-white px-3 py-3"
                      >
                        <span>
                          <span className="font-semibold text-[#2b1616]">
                            {item.time}
                          </span>{" "}
                          {item.title}
                        </span>
                        <button
                          className="rounded-full border border-[#f1d6d6] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b06767] transition hover:border-[#b34343] hover:text-[#b34343]"
                          type="button"
                          onClick={() =>
                            addScheduleItem(
                              item.time,
                              `${item.title} in ${tripLabel}`,
                              activeTrip?.startDate
                            )
                          }
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-dashed border-[#f1d6d6] bg-[#fff6f6] px-4 py-4 text-xs uppercase tracking-[0.3em] text-[#b06767]">
                  {scheduleItems.length} schedule items - {todos.length} to-dos
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-[#f1d6d6] px-4 py-6 text-center text-sm text-[#8a5e5e]">
                Add a trip to unlock suggestions.
              </p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
