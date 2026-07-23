---
title: "Services Layer"
aliases: ["Business Logic", "Services"]
tags: ["#backend", "#business-logic"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Services Layer

Located in `backend/app/services/`. This is the brain of the application.

## Responsibilities
- Enforce business rules (e.g., "A vehicle cannot be dispatched if it is currently UNDER_MAINTENANCE").
- Transform primitive data from the [[Repositories Layer]] into complex calculated metrics (like ROI or Utilization percentage).
- Orchestrate multiple repositories (e.g., creating a trip might update a vehicle's status AND create a new trip record).

## Why use Services?
If we placed this logic in the Route handler, it would be impossible to re-use. For example, if a background Cron job needs to calculate Fleet Utilization to send a weekly email, it can simply instantiate `ReportService(db)` and call `get_fleet_utilization()` without needing to fake an HTTP request.

## Example (Handling Edge Cases)
The `ReportService` computes `distance_travelled`. 
A known edge case: if a vehicle has no trips with an actual distance recorded, the database returns `None`. 
The Service Layer is responsible for handling this before it hits the Pydantic parser:
```python
"distance_travelled": float(row.distance_travelled or 0)
```
