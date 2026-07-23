---
title: "Authentication & Authorization"
aliases: ["Auth", "JWT"]
tags: ["#backend", "#security"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Authentication & Authorization

TransitOps secures its API using stateless JSON Web Tokens (JWT).

## 1. Authentication (Login)
1. User POSTs email/password to `/api/auth/login`.
2. Backend verifies hash using `passlib`.
3. Backend generates a JWT string containing the `user_id` and an expiration timestamp (e.g., 24 hours).
4. Token is returned to the frontend.
5. Frontend stores the token (typically in LocalStorage or memory) and attaches it as a `Bearer {token}` header to all subsequent API calls via [[API Integration|Axios Interceptors]].

## 2. Authorization (Guarding Routes)
We use a FastAPI dependency to guard routes:
```python
from app.core.security import get_current_user

@router.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Hello {user.email}"}
```
If the token is missing, expired, or invalid, `get_current_user` automatically throws a `401 Unauthorized` exception, terminating the request before it reaches the controller logic.

## Roles
(If implemented) The User model can have a `role` field (e.g., `ADMIN`, `DRIVER`). Additional dependencies like `require_admin` can wrap `get_current_user` to restrict endpoints based on role.
