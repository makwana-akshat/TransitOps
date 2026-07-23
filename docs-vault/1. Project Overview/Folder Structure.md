---
title: "Folder Structure"
aliases: ["Directory Structure", "Repository Layout"]
tags: ["#structure", "#architecture"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Folder Structure

Understanding the repository layout is crucial for navigating the codebase. The project is split into two main monoliths within a single repository (monorepo structure).

## High-Level Tree
```
TransitOps/
├── backend/          # FastAPI Python application
├── frontend/         # React/Vite TypeScript application
├── docs-vault/       # This Obsidian documentation vault
├── docker-compose.yml# Local infrastructure orchestration
└── README.md
```

## Backend Structure
See [[Backend Architecture]] for architectural concepts.

```
backend/
├── app/
│   ├── api/          # Route handlers (Controllers)
│   ├── core/         # Configuration, security, dependencies
│   ├── db/           # Database session and setup
│   ├── enums/        # Shared enumerated types
│   ├── models/       # SQLAlchemy ORM definitions
│   ├── repositories/ # Direct database access logic
│   ├── schemas/      # Pydantic validation schemas
│   ├── services/     # Business logic orchestration
│   └── main.py       # FastAPI application entrypoint
├── alembic/          # Database migrations
├── .env              # Environment variables
└── requirements.txt  # Python dependencies
```

## Frontend Structure
See [[Frontend Architecture]] for architectural concepts.

```
frontend/
├── src/
│   ├── api/          # Axios instances and API call definitions
│   ├── assets/       # Static files (images, icons)
│   ├── components/   # Reusable UI components
│   │   ├── forms/    # Form-specific components and modals
│   │   ├── layout/   # App layout wrappers (Sidebar, Topbar)
│   │   └── ui/       # Generic atoms/molecules (Button, Input)
│   ├── hooks/        # Custom React hooks (React Query wrappers)
│   ├── pages/        # Route components (Dashboard, Fleet, etc.)
│   ├── types/        # TypeScript interfaces
│   ├── utils/        # Helper functions (formatters, date math)
│   ├── App.tsx       # Root component and Routing setup
│   └── index.css     # Global styles and Tailwind imports
├── public/           # Public static assets
├── index.html        # HTML entry point
├── tailwind.config.js# Tailwind theme and plugin config
├── vite.config.ts    # Vite bundler configuration
└── package.json      # Node dependencies
```

## Why this Structure?
- **Separation by Feature vs Layer**: We use a **Layer-first** approach (grouping by `services/`, `models/`, `components/`, `pages/`). 
- **Why?** For small-to-medium teams, layering makes it easy to find specific types of files. As the app scales significantly, it might be beneficial to migrate to a Feature-first structure (e.g., `features/trips/components`, `features/trips/api`), but current complexity warrants Layer-first.
