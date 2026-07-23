---
title: "Feature - Authentication"
aliases: ["Login Flow", "Auth Feature"]
tags: ["#feature", "#auth"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Feature: Authentication

## Purpose
Secures the platform. Allows only registered users to access the dashboard and API endpoints.

## Architecture & Flow
```mermaid
sequenceDiagram
    participant User
    participant Login Page
    participant Auth Controller
    participant DB
    
    User->>Login Page: Submits Email/Password
    Login Page->>Auth Controller: POST /api/auth/login
    Auth Controller->>DB: Fetch User by Email
    DB-->>Auth Controller: Hashed Password
    Auth Controller->>Auth Controller: Verify bcrypt hash
    Auth Controller-->>Login Page: JWT Token
    Login Page->>Login Page: Store Token & Redirect to /dashboard
```

## Frontend Implementation
- **Page**: `frontend/src/pages/auth/LoginPage.tsx`
- **State**: The JWT token is currently stored in `localStorage` or memory, depending on implementation. The `<ProtectedRoute>` component intercepts routing if the token is missing.

## Backend Implementation
- **Router**: `backend/app/api/endpoints/auth.py`
- **Service**: `backend/app/services/auth_service.py`
- **Security Logic**: `backend/app/core/security.py` (Contains JWT encoding/decoding and password hashing).

## Common Bugs & Gotchas
- **Token Expiry**: If the JWT expires while a user is actively using the app, the next API call will return `401 Unauthorized`. The Axios interceptor must catch this and redirect to login (or attempt a silent refresh).
- **CORS Issues**: Ensure the frontend origin is correctly listed in FastAPI's CORS middleware.

## Future Improvements
- **Refresh Tokens**: Implement a short-lived access token + long-lived HttpOnly secure cookie refresh token pattern to prevent XSS token theft.
- **Role-Based Access Control (RBAC)**: Currently, any authenticated user can view the dashboard. We should restrict actions (like deleting vehicles) to `ADMIN` roles.
