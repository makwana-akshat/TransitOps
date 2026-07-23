---
title: "Styling & UI System"
aliases: ["Tailwind", "Design System"]
tags: ["#frontend", "#css"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Styling & UI System

TransitOps utilizes **Tailwind CSS** as its primary styling engine.

## Design Aesthetic: Glassmorphism & Dark Mode
The application aims for a premium, flagship aesthetic. 
- **Dark Theme Default**: The background uses deep blacks/grays (`bg-bg`, `#0A0A0B`).
- **Glassmorphism**: Components use semi-transparent backgrounds with backdrop-blur (`bg-white/5`, `backdrop-blur-md`) to create depth.
- **Accents**: We use vibrant, distinct accent colors for statuses (Emerald for success, Amber for warnings, Rose for danger).

## Tailwind Configuration (`tailwind.config.js`)
We heavily customize the Tailwind theme to use CSS variables. This allows us to easily implement themes.
- Custom colors: `bg`, `bg-elevated`, `bg-card`, `text-primary`, `text-muted`.
- Custom borders: `border-glass` (`rgba(255,255,255,0.05)`).

## The `cn()` Utility
We frequently use a utility function named `cn()` combining `clsx` and `tailwind-merge`.
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
**Why?** Tailwind classes can clash (e.g., passing `px-4` via props but the component defines `px-2`). `tailwind-merge` intelligently overrides `px-2` with `px-4`.

## Animations
We use **Framer Motion** for complex layout animations and page transitions.
- **Micro-interactions**: Hover scales (`whileHover={{ scale: 1.02 }}`) on cards.
- **Presence**: Animate components as they are removed from the DOM using `<AnimatePresence>`.
