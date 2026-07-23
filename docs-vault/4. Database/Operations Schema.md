---
title: "Operations Schema"
aliases: ["Trips Model", "Expenses Model"]
tags: ["#database", "#schema", "#operations"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Operations Schema

This domain records the day-to-day activities and financial events.

## `trips` Table
The central entity for operations. It links a Vehicle, a Driver, and a timeline.

| Column | Type | Description |
| :--- | :--- | :--- |
| `vehicle_id` | FK | The asset used |
| `driver_id` | FK | The operator |
| `status` | Enum | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `trip_revenue`| Float| Money made from this trip |
| `actual_distance`| Float| Km driven |
| `actual_end` | Timestamp | Used for grouping in Revenue charts |

## `fuel_logs` Table
Tracks fuel consumption separately from generic expenses due to its high frequency and impact on KPIs (like Km/Liter).
| Column | Type | Description |
| :--- | :--- | :--- |
| `liters` | Float | Volume filled |
| `total_cost` | Float | Cost of the transaction |

## `expenses` Table
Generic logging for anything else (Tolls, Parking, Insurance, Repairs).
| Column | Type | Description |
| :--- | :--- | :--- |
| `expense_type`| Enum | `Toll`, `Insurance`, `Maintenance`, `Other` |
| `amount` | Float | |
| `trip_id` | FK | Optional: ties expense to a specific run |

## Performance Considerations (Indexes)
We place indexes on Foreign Keys (`vehicle_id`, `driver_id`) and highly queried Enum fields (`status`) to ensure fast lookups when generating the complex aggregations required by the [[Feature - Dashboard & Analytics|Dashboard]].
