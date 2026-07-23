---
title: "Component - Button"
aliases: ["Button"]
tags: ["#component", "#ui"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Component: Button

The foundational interactive element in TransitOps. 

## Variants
Instead of one massive generic `Button` with a dozen string props (e.g., `variant="primary"`), we export specific button types:
- `PrimaryButton`: Main call to action (vibrant accent color).
- `SecondaryButton`: Alternative actions (glassmorphic border, transparent background).
- `DangerButton`: Destructive actions like Delete (Red/Rose accents).

## Accessibility (a11y)
During our `$impeccable polish` pass, we explicitly addressed accessibility for keyboard navigation.
All buttons include strict `focus-visible` states:
```tsx
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
```
This ensures that users hitting `TAB` can clearly see which button is focused, without relying on mouse hover states.

## Props
Extends standard `React.ButtonHTMLAttributes<HTMLButtonElement>`, plus:
| Prop | Type | Description |
| :--- | :--- | :--- |
| `isLoading` | `boolean` | Disables the button and shows a spinning loader. |
| `icon` | `ReactNode` | Renders a lucide-react icon alongside the text. |
