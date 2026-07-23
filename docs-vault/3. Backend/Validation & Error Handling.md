---
title: "Validation & Error Handling"
aliases: ["Pydantic", "Exceptions"]
tags: ["#backend", "#validation"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Validation & Error Handling

## 1. Pydantic Validation
FastAPI uses Pydantic for defining payload schemas.
- If a user sends a string when an integer is expected, Pydantic throws a `422 Unprocessable Entity` before the route handler is even executed.
- Schemas are located in `backend/app/schemas/`.

**Caution:** Pydantic is strict. If a service returns `None` for a field typed as `float` (not `Optional[float]`), Pydantic will throw a `500 Internal Server Error` during response serialization. This was a notable bug in `FleetUtilizationItem` where `distance_travelled` could be Null in the DB.

## 2. Error Handling
We handle expected errors (like "User not found") by throwing FastAPI's `HTTPException`.

```python
raise HTTPException(status_code=404, detail="Vehicle not found")
```

For unhandled errors (e.g., a database connection drop), FastAPI returns a generic 500 error. 

## Frontend Handling
The [[API Integration|Axios Client]] intercepts these HTTP codes.
- `401` -> Redirect to login.
- `422` or `400` -> Show a toast notification with the `detail` message provided by the backend.
