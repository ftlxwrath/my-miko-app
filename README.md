# Miko Planner

A gentle trip planner with schedules, to-dos, and a companion that keeps things encouraging.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project Layout

- `app/(planner)/page.tsx` Home dashboard (trips + schedule + to-dos summary)
- `app/(planner)/trips/page.tsx` Trip planning + suggestions
- `app/(planner)/schedule/page.tsx` Timetable view + schedule builder
- `app/(planner)/todos/page.tsx` To-do list
- `app/(planner)/companion/page.tsx` Companion prompt setup
- `app/(planner)/components` Shared UI blocks (Miko, notifications)
- `app/(planner)/lib` Shared logic + storage + datasets

## Data Flow

- State is stored in localStorage via `useLocalStorageState` in `app/(planner)/lib/storage.ts`.
- Notifications are computed in `app/(planner)/lib/notifications.ts` and used by both the nav dropdown and Miko popups.
- Trip suggestions use `app/(planner)/lib/destinations.ts` for the top 100 destination highlights.

## Team Workstreams

See `docs/WORKSTREAMS.md` for task boundaries and ownership suggestions.

## Scripts

- `npm run dev` start the dev server
- `npm run build` build for production
- `npm start` run the production build

