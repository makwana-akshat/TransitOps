---
title: "Component - DataTable"
aliases: ["DataTable", "Table Component"]
tags: ["#component", "#ui"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Component: DataTable

## Purpose
Renders tabular data with built-in support for loading states, empty states, and responsive scrolling. 

## Dependencies
- `@tanstack/react-table`: A headless UI utility for building tables. We pass it data and columns, and it returns the internal state (which we render our custom HTML against).
- `lucide-react`: For the empty state Inbox icon.

## Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `data` | `TData[]` | The array of row data. |
| `columns` | `ColumnDef<TData, any>[]` | TanStack table column definitions. |
| `isLoading` | `boolean` | Renders a skeleton overlay if true. |
| `searchQuery` | `string` | Passed to the global filter state of the table. |

## Rendering Behavior
1. Uses `useReactTable` to initialize the table instance.
2. Iterates over `table.getHeaderGroups()` to render `<thead>`.
3. Iterates over `table.getRowModel().rows` to render `<tbody>`.
4. If `data.length === 0`, it renders a custom `EmptyState` component indicating no records found.

## Example Usage
```tsx
const columns = [
  { accessorKey: 'name', header: 'Driver Name' },
  { accessorKey: 'status', header: 'Status' }
];

<DataTable data={drivers} columns={columns} isLoading={isLoading} />
```

## Potential Improvements
- **Pagination**: The UI currently shows a long list. It should implement `table.nextPage()` and render a pagination footer component.
