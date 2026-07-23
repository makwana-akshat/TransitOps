---
title: "Architecture Smells & Tech Debt"
aliases: ["Tech Debt", "Smells"]
tags: ["#code-quality", "#tech-debt"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Architecture Smells & Tech Debt

This document tracks known compromises, shortcuts, and smells in the codebase that should be refactored before significant scaling.

## 1. Pydantic Strictness in Aggregations
- **Smell**: In `backend/app/schemas/reports.py`, schemas like `FleetUtilizationItem` declare fields strictly as `float` (e.g., `distance_travelled: float`).
- **Issue**: SQL aggregation functions (like `SUM()`) can return `NULL` (parsed as `None` in Python) if no records match or if the underlying column is nullable. Pydantic immediately throws a `ValidationError` (Internal Server Error) when it encounters `None` instead of `float`.
- **Current Workaround**: We manually cast variables in the Service layer: `float(row.distance_travelled or 0)`.
- **Refactor Idea**: Update the Pydantic schemas to either accept `Optional[float]` or use Pydantic's `validator` decorators to automatically coerce `None` to `0.0` at the schema boundary, removing this boilerplate from the services.

## 2. Monolithic Repositories
- **Smell**: `ReportRepository` handles SQL generation for every single chart on the dashboard.
- **Issue**: It's currently manageable, but as we add more analytics (e.g., Driver Behavior Scores, Route Optimization Metrics), this file will grow to thousands of lines.
- **Refactor Idea**: Split `ReportRepository` into domain-specific analytical repos: `FinancialAnalyticsRepo`, `FleetAnalyticsRepo`, `DriverAnalyticsRepo`.

## 3. SQLite vs PostgreSQL Date Handling
- **Smell**: Using SQLAlchemy's `extract('year', Trip.actual_end)` for date grouping in Revenue charts.
- **Issue**: While this works flawlessly in PostgreSQL, SQLite handles dates as strings and often fails silently or errors out when using native `extract` functions unless specifically handled.
- **Refactor Idea**: If local development relies entirely on SQLite, we need to abstract date aggregation or enforce local development using a Dockerized PostgreSQL container to ensure dev/prod parity.

## 4. Frontend Monolithic Chunking
- **Smell**: The entire React application is bundled into a single Javascript chunk.
- **Issue**: As we add more heavy dependencies (like PDF generators or mapping libraries), the initial load time will suffer.
- **Refactor Idea**: Implement Route-Level Code Splitting using `React.lazy()` and `Suspense`.
