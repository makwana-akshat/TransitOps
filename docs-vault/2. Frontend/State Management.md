---
title: "State Management"
aliases: ["React Query", "Context"]
tags: ["#frontend", "#state"]
created: "2026-07-17"
updated: "2026-07-17"
---

# State Management

State in TransitOps is strictly divided into **Server State** and **Client State**.

## 1. Server State: React Query
**What it is:** Data fetched from the backend API.
**Tool:** `@tanstack/react-query`

### Why React Query instead of Redux?
In the past, teams stored API responses in a global Redux store. This required massive amounts of boilerplate (actions, reducers, thunks). 
React Query handles fetching, caching, deduplicating, background refetching, and pagination out-of-the-box. We just call a custom hook (e.g., `useVehicles()`) and it works.

### Usage
We abstract `useQuery` and `useMutation` calls into custom hooks located in `src/hooks/`.
- Example: `useTrips()` handles the query key `['trips']` and the fetch function `fetchTrips`.
- **Invalidation**: When a user creates a new trip using `useCreateTrip()`, the mutation's `onSuccess` callback invalidates the `['trips']` query, causing the UI to automatically refetch and update.

## 2. Client State
**What it is:** Purely frontend UI state (e.g., is a modal open? what is the search string?).
**Tool:** React `useState`, Context, or Zustand.

### Why not global state for everything?
Most client state is highly localized. The open/closed state of a modal belongs in the component that renders it. We only elevate state to Context/Zustand if it's truly global (e.g., the currently logged-in user profile, or theme preferences).
