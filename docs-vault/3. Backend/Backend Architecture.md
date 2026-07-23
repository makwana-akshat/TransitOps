---
title: "Backend Architecture"
aliases: ["FastAPI Architecture", "Backend Layering"]
tags: ["#backend", "#architecture"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Backend Architecture

The backend of TransitOps is built with **FastAPI** (Python). It is strictly structured using a Domain-Driven, Layered Architecture.

## The Three Layers
We separate concerns to make the codebase highly testable and maintainable.

1. **[[Controllers & Routes]] (Presentation)**: Extracts data from HTTP requests and returns HTTP responses.
2. **[[Services Layer]] (Business Logic)**: Enforces business rules, calculates KPIs, and orchestrates data from repositories.
3. **[[Repositories Layer]] (Data Access)**: Executes SQLAlchemy queries against the [[Database Overview|Database]].

## Architecture Flow Diagram
```mermaid
sequenceDiagram
    participant Client
    participant Router as API Router
    participant Service
    participant Repo as Repository
    participant DB as Database
    
    Client->>Router: GET /api/reports/fleet-utilization
    Router->>Service: get_fleet_utilization()
    Service->>Repo: query_raw_trip_data()
    Repo->>DB: SELECT ...
    DB-->>Repo: SQLAlchemy Objects
    Repo-->>Service: ORM Data
    Service->>Service: Calculate Utilization %
    Service-->>Router: Formatted List[dict]
    Router-->>Client: JSON Response
```

## Core Backend Dependencies
The backend heavily utilizes FastAPI's Dependency Injection system (`Depends()`).
- `get_db`: Yields an `AsyncSession` for database queries.
- `get_current_user`: Extracts and validates the JWT, injecting the `User` object into the route handler.

## Why Layered Architecture?
It prevents "Fat Controllers". In a standard tutorial FastAPI app, you often see raw SQL queries mixed with HTTP response logic inside the route handler. By extracting SQL to Repositories and Logic to Services, we can easily unit test the Service without spinning up an HTTP server or a database.
