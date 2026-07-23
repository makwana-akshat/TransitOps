---
title: "Database Overview"
aliases: ["Database", "Supabase", "PostgreSQL"]
tags: ["#database", "#postgresql"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Database Overview

TransitOps uses **PostgreSQL** (hosted via Supabase) as its primary relational database. 

## Technology
- **Driver**: We use `asyncpg` for production PostgreSQL connections to enable non-blocking DB calls.
- **ORM**: We use **SQLAlchemy 2.0** with the `AsyncSession`.
- **Migrations**: We use **Alembic** to manage schema changes.

## Schema Architecture
The database is heavily normalized to ensure data integrity. We use UUIDs (UUID4) for all Primary Keys instead of auto-incrementing integers.
- **Why UUIDs?** They prevent enumeration attacks (where a malicious user loops through `/api/trips/1`, `/api/trips/2`) and allow for easier database merging and offline syncing if needed in the future.

## Soft Deletes
Many of our tables (like Vehicles, Trips) implement a Soft Delete pattern. 
- They include a `deleted_at` timestamp column. 
- When a user "deletes" a vehicle, we merely set `deleted_at = now()`.
- **Why?** For a reporting application, deleting a vehicle permanently would orphan all historical trips and expenses associated with that vehicle, destroying the company's financial reports.

## Core Schemas
We can conceptually break the database down into three domains:
1. [[Users & Auth Schema]] (Users)
2. [[Fleet Management Schema]] (Vehicles, Drivers)
3. [[Operations Schema]] (Trips, Fuel Logs, Expenses, Maintenance)

See the [[ER Diagram]] for a complete visual representation.
