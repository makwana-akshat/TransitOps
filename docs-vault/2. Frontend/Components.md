---
title: "Components"
aliases: ["React Components", "UI Library"]
tags: ["#frontend", "#components"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Components

Our component architecture follows a rough atomic design pattern, mostly split between generic UI atoms and complex feature molecules.

## Directory Structure
`frontend/src/components/`
- `ui/`: Generic, reusable, dumb components (Buttons, Inputs, Cards).
- `forms/`: Smart components that manage form state (React Hook Form) and trigger mutations.
- `layout/`: Structural components (Sidebar, Topbar).

## Key Components

### [[Component - Button.md|Button]]
Provides `PrimaryButton`, `SecondaryButton`, `DangerButton`. Uses `cva` (class-variance-authority) or tailwind templates for variants.

### [[Component - DataTable.md|DataTable]]
A wrapper around `@tanstack/react-table`. 
- **Why?** It provides headless table logic (sorting, pagination, filtering) but lets us fully customize the rendering with our [[Styling & UI System]].

### [[Component - ChartCard.md|ChartCard]]
A reusable container for Recharts graphs. It standardizes the padding, background color, and titles for all dashboard graphs.

## Best Practices for Creating New Components
1. **Keep UI components dumb**: A generic component (like `StatusBadge`) should not fetch its own data. It should receive props.
2. **Use Tailwind Classes**: Avoid inline styles. Combine classes with `cn()` utility (clsx + tailwind-merge) if you need conditional styling.
3. **Forward Refs**: Always wrap interactive UI atoms with `forwardRef` if they might be used inside Tooltips or dialog triggers.
