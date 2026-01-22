# Workstreams

Use these as clean boundaries so multiple people can work without stepping on each other.

## Trips Feature

- Owner: Trips UX + suggestions + destination data
- Files:
  - `app/(planner)/trips/page.tsx`
  - `app/(planner)/lib/destinations.ts`

## Schedule Feature

- Owner: Timetable UI + schedule builder + time parsing
- Files:
  - `app/(planner)/schedule/page.tsx`
  - `app/(planner)/lib/notifications.ts` (schedule alerts)

## To-dos Feature

- Owner: To-do list UI + task behavior
- Files:
  - `app/(planner)/todos/page.tsx`

## Companion + Notifications

- Owner: Miko messaging, notification dropdown + popups
- Files:
  - `app/(planner)/components/miko-companion.tsx`
  - `app/(planner)/components/notification-dropdown.tsx`
  - `app/(planner)/lib/notifications.ts`

## Home Dashboard

- Owner: Home cards + summaries
- Files:
  - `app/(planner)/page.tsx`

## Shared Storage + Theme

- Owner: localStorage sync + palette updates
- Files:
  - `app/(planner)/lib/storage.ts`
  - `app/globals.css`
  - `app/(planner)/layout.tsx`

