---
title: "Feature - Dashboard & Analytics"
aliases: ["Reports", "KPIs"]
tags: ["#feature", "#analytics"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Feature: Dashboard & Analytics

## Purpose
To provide high-level, actionable KPIs (Key Performance Indicators) and complex aggregations (like Fleet Utilization and Vehicle ROI) in a single visual interface.

## Architecture
The Dashboard relies heavily on the `ReportService` and `AnalyticsRepository` in the backend to perform complex SQL aggregations.

## Frontend Implementation
- **Page**: `frontend/src/pages/dashboard/DashboardPage.tsx` and `ReportsPage.tsx`.
- **Components**: Utilizes the `ChartCard` wrapper and Recharts components (`BarChart`, `AreaChart`).
- **Data Fetching**: `useReports()` custom hook queries `/api/reports/*`.

### Empty States
A critical UX feature implemented here is the `<EmptyState>` component. If the backend returns `[]` (e.g., if there are no logged expenses), the UI gracefully renders a "No Data Available" graphic instead of a broken, empty chart grid.

## Backend Implementation
- **Service**: `ReportService`. This service often has to massage data (like safely casting Nullable `distance_travelled` floats to `0.0` to satisfy strict Pydantic schemas).
- **Repository**: `ReportRepository`. Contains complex SQLAlchemy grouping operations.
  - *Example*: Calculating ROI involves `Vehicle.acquisition_cost` vs `SUM(trip.revenue)`.

## Known Complexities & Edge Cases
- **SQLite vs PostgreSQL Dates**: Grouping by `extract('year', Trip.actual_end)` can behave differently in SQLite (local dev) compared to PostgreSQL (production).
- **Missing Data Errors**: If a Pydantic schema strictly expects a `float` but the database aggregation yields `None`, a `500 Internal Server Error` occurs. We handle this explicitly in the Service layer.

## Future Improvements
- **Caching**: Complex analytical queries scan large portions of the database. We should implement Redis caching for the dashboard endpoints, recalculating them only once every few hours.
