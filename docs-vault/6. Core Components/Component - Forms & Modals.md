---
title: "Component - Forms & Modals"
aliases: ["Modals", "Forms"]
tags: ["#component", "#forms"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Component: Forms & Modals

We use a composition pattern to handle pop-up forms (e.g., "Add Vehicle").

## Architecture
1. **`Modal` (Base Component)**: Located in `ui/Modal.tsx`. A generic dialog wrapper that handles the backdrop overlay, Framer Motion entry/exit animations, and "click outside to close" logic.
2. **Form Modals**: Located in `forms/*`. These components compose the base `Modal` and inject a `react-hook-form` connected form.

## Form State Management
Forms use:
- **`react-hook-form`**: For uncontrolled form state, dramatically reducing re-renders while typing.
- **`@hookform/resolvers/zod`**: For strict TypeScript-aligned validation before submission.

## Example Flow (Creating a Vehicle)
1. User clicks "Add Vehicle". `isModalOpen` state becomes `true`.
2. `VehicleFormModal` renders.
3. User types "HZS 432". Local component state tracks this via react-hook-form.
4. User clicks Submit. Zod validates the schema.
5. If valid, the form triggers a React Query `useMutation` to POST `/api/vehicles`.
6. `onSuccess`: React Query invalidates the `['vehicles']` query cache, causing the background table to update. The modal sets `isOpen(false)`.

## Future Improvements
- **Context API for Modals**: If the app grows, passing `isOpen` and `onClose` props down multiple levels becomes tedious. We could implement a global `ModalContext` to trigger any modal from anywhere.
