---
title: "Feature - Fleet Management"
aliases: ["Vehicles", "Drivers"]
tags: ["#feature", "#fleet"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Feature: Fleet Management

## Purpose
CRUD (Create, Read, Update, Delete) operations for the company's core assets: Vehicles and Drivers.

## Architecture
This is a standard CRUD vertical slice.

## Frontend Implementation
- **Pages**: `frontend/src/pages/fleet/FleetPage.tsx`
- **Components**: `VehicleFormModal`, `DataTable`.
- **State**: Controlled via React Hook Form and validated with Zod before submission. React Query manages the table state.

## Backend Implementation
- **Router**: `/api/vehicles` and `/api/drivers`
- **Database**: [[Fleet Management Schema]]

## Edge Cases
- **Soft Deletion**: We never permanently `DELETE` a vehicle. We set `deleted_at`. The `get_all` repository queries must strictly append `.where(Vehicle.deleted_at.is_(None))` to avoid exposing deleted vehicles in dropdowns.
- **Constraint Violations**: Attempting to create a vehicle with a duplicate `registration_number` triggers a unique constraint violation in Postgres. The backend must catch `IntegrityError` and return a friendly `400 Bad Request`.

## Future Improvements
- **Document Uploads**: Allow uploading vehicle registration documents and insurance PDFs to cloud storage (e.g., AWS S3 or Supabase Storage).
