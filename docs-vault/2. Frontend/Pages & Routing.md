---
title: "Pages & Routing"
aliases: ["Routing", "React Router"]
tags: ["#frontend", "#routing"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Pages & Routing

We use React Router DOM for client-side routing.

## Route Definitions
Routes are defined in `App.tsx` (or a dedicated `routes.tsx` file) using a declarative `<Routes>` tree.

### Common Routes
- `/`: [[Feature - Dashboard & Analytics|Dashboard]] (Redirects to dashboard or login)
- `/fleet`: [[Feature - Fleet Management|Vehicles and Drivers]]
- `/trips`: [[Feature - Trip Tracking|Active and Past Trips]]
- `/fuel`: [[Feature - Expense & Fuel Management|Fuel Logs and Expenses]]

## Protected Routes
We use a `<ProtectedRoute>` wrapper around pages that require authentication.
- **How it works**: It checks the global auth context (or local storage for a JWT). If the user is unauthenticated, they are immediately redirected to `/login`.

## Layout Wrapper
Most pages are wrapped in a `<MainLayout>` component.
- The Layout contains the `Sidebar` and `Topbar`.
- The `children` prop renders the current Page route inside a scrollable main content area.

## Future Improvements: Lazy Loading
Currently, all pages might be bundled together. As the app grows, we should implement `React.lazy()` and `<Suspense>` for route-level code splitting. This will ensure the initial JS payload remains tiny, and a user only downloads the Javascript for the `/reports` page if they actually click on it.
