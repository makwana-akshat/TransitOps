---
title: "Component - ChartCard"
aliases: ["ChartCard", "Graph Wrapper"]
tags: ["#component", "#ui"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Component: ChartCard

## Purpose
A specialized layout container designed to wrap Recharts data visualizations. It standardizes the title, subtitle, padding, and hover animations across all dashboard metrics.

## Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The main header (e.g., "Fleet Utilization"). |
| `subtitle` | `string` | The subtext explaining the metric. |
| `children` | `ReactNode` | Typically a Recharts `<ResponsiveContainer>` or `<EmptyState>`. |
| `action` | `ReactNode` | Optional header action (like a "Download" button or date picker). |

## Styling & UX
- Utilizes the `bg-bg-card` tailwind variable for a glassmorphic dark grey background.
- Uses Framer Motion for a subtle `<motion.div whileHover={{ y: -2 }}>` lift effect when a user mouses over the chart, emphasizing interactivity.

## Handling Empty States
When composing a `ChartCard`, if the backend returns no data, you should not pass an empty array to the Recharts children (which results in a broken UI). Instead, conditionally render an `EmptyState`:

```tsx
<ChartCard title="Revenue">
  {data.length === 0 ? (
     <EmptyState title="No Revenue" />
  ) : (
     <AreaChart data={data}>...</AreaChart>
  )}
</ChartCard>
```
