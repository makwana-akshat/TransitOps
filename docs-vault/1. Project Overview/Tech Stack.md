---
title: "Tech Stack"
aliases: ["Technology Stack", "Stack"]
tags: ["#tech-stack", "#tools"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Technology Stack

TransitOps is built using a modern, battle-tested technology stack. 

## Frontend

| Technology | Purpose | Why We Chose It |
| :--- | :--- | :--- |
| **Vite** | Build Tool | Extremely fast HMR (Hot Module Replacement) compared to Webpack/CRA. |
| **React 18** | UI Library | Industry standard, massive ecosystem, excellent component reusability. |
| **TypeScript** | Type Safety | Catches bugs at compile time; drastically improves developer experience and refactoring confidence. |
| **Tailwind CSS** | Styling | Utility-first CSS allows for rapid UI development without context-switching between CSS/TSX files. Easy implementation of our [[Styling & UI System|custom design system]]. |
| **Framer Motion** | Animations | Provides declarative, physics-based animations for fluid micro-interactions and page transitions. |
| **Recharts** | Data Viz | Composable charting library built for React. Essential for the [[Feature - Dashboard & Analytics|Dashboard]]. |
| **React Query** | Data Fetching | Handles caching, synchronization, and background updates of server state automatically. |

## Backend

| Technology | Purpose | Why We Chose It |
| :--- | :--- | :--- |
| **FastAPI** | Web Framework | Extremely fast (Starlette/Pydantic), auto-generates Swagger/OpenAPI docs, natively supports async/await. |
| **Python 3.10+** | Language | High readability, massive ecosystem for data analysis (future proofing for AI/ML). |
| **SQLAlchemy (Async)** | ORM | Mature, highly flexible Object Relational Mapper. Using the async extension allows for high concurrency. |
| **Pydantic** | Validation | Seamlessly integrated with FastAPI; provides robust data validation using Python type hints. |
| **PyJWT** | Authentication | Standard JWT implementation for stateless API authentication. See [[Authentication & Authorization]]. |
| **Alembic** | Migrations | Standard companion to SQLAlchemy for tracking and applying schema changes. |

## Database & Infra

| Technology | Purpose | Why We Chose It |
| :--- | :--- | :--- |
| **PostgreSQL** | Primary Database | The most robust, feature-rich open-source relational database. |
| **Supabase** | DB Hosting | Provides managed PostgreSQL with connection pooling (PgBouncer) out of the box. |

## Extension Guide
If we need to add real-time features (e.g., live vehicle tracking), we can leverage Supabase's real-time subscriptions on the frontend and FastAPI's WebSockets on the backend.
