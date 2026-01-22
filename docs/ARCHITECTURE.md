# Architecture Notes

## Feature Pages

- Home: `app/(planner)/page.tsx`
- Trips: `app/(planner)/trips/page.tsx`
- Schedule: `app/(planner)/schedule/page.tsx`
- To-dos: `app/(planner)/todos/page.tsx`
- Companion prompts: `app/(planner)/companion/page.tsx`

## Shared Components

- Miko popup: `app/(planner)/components/miko-companion.tsx`
- Notifications dropdown: `app/(planner)/components/notification-dropdown.tsx`

## Shared Logic

- Storage helper: `app/(planner)/lib/storage.ts`
- Notifications builder: `app/(planner)/lib/notifications.ts`
- Destination data: `app/(planner)/lib/destinations.ts`

## Local Storage Sync

`useLocalStorageState` writes through to localStorage and broadcasts a custom
event so all components update immediately without page refresh.

