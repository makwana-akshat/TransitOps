---
title: "Users & Auth Schema"
aliases: ["User Model"]
tags: ["#database", "#schema", "#auth"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Users & Auth Schema

The foundation of the application's security and auditing.

## `users` Table
Stores authentication credentials and basic profile information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Unique identifier |
| `email` | String | Unique, Index | Used for login |
| `hashed_password` | String | Not Null | Bcrypt hashed string |
| `full_name` | String | | Display name |
| `is_active` | Boolean | Default True | For disabling accounts without deleting |

## Design Decisions
- We store `hashed_password` directly rather than delegating entirely to an external provider (like Auth0), giving us full control over the auth flow.
- The `users` table is heavily referenced by other tables (e.g., `created_by` in `vehicles`) to provide an audit trail of who created or modified records.
