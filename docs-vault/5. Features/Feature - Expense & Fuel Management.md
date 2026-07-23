---
title: "Feature - Expense & Fuel Management"
aliases: ["Expenses", "Fuel Logs"]
tags: ["#feature", "#finance"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Feature: Expense & Fuel Management

## Purpose
Track outbound cash flow. Fuel is tracked separately from generic expenses due to its specific metrics (liters, km/L).

## Frontend Implementation
- **Page**: `frontend/src/pages/fuel/FuelExpensesPage.tsx`
- Contains two distinct tabs for Fuel and Expenses.
- Features aggregate KPI cards and a pie chart for Expense Breakdown.

## Backend Implementation
- **Database**: [[Operations Schema]] (`fuel_logs` and `expenses` tables).
- **Denormalization**: To keep dashboard reads fast, adding an expense also fires a background update to increment `Vehicle.total_maintenance_cost` or `Vehicle.total_other_expenses`.

## Future Improvements
- **Receipt Scanning**: Allow drivers to upload photos of fuel receipts. We could use an OCR service (like AWS Textract) to auto-fill the form fields.
