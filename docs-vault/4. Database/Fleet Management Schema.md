---
title: "Fleet Management Schema"
aliases: ["Vehicles Model", "Drivers Model"]
tags: ["#database", "#schema", "#fleet"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Fleet Management Schema

This domain handles the physical assets of the company: Vehicles and Drivers.

## `vehicles` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `registration_number` | String | Unique, Index | License plate |
| `status` | Enum | | `AVAILABLE`, `IN_TRANSIT`, `UNDER_MAINTENANCE` |
| `current_odometer` | Float | Default 0 | Updated after every trip |
| `acquisition_cost` | Float | | Used for ROI calculations |
| `total_fuel_cost` | Float | | Denormalized cumulative metric |
| `total_maintenance_cost`| Float | | Denormalized cumulative metric |

### Denormalization Trade-off
You'll notice columns like `total_fuel_cost` on the Vehicle table. 
- **Why?** Strictly speaking, total fuel cost can be calculated by running `SUM(cost)` on the `fuel_logs` table. However, since the Dashboard queries these totals frequently, we denormalize this data. A database trigger (or service logic) updates the `total_fuel_cost` on the Vehicle whenever a new Fuel Log is inserted, drastically speeding up read queries for the Dashboard.

## `drivers` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | String | | |
| `license_number` | String | Unique | |
| `status` | Enum | | `AVAILABLE`, `ON_TRIP`, `OFF_DUTY` |
| `user_id` | UUID | FK -> Users | Optional link if driver logs in |
