---
title: "Development Workflow"
aliases: ["How to Run", "Running Locally"]
tags: ["#workflow", "#dev"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Development Workflow

This guide covers how to set up, run, and develop TransitOps locally.

## 1. Prerequisites
- **Node.js** (v18+) for the frontend.
- **Python** (3.10+) for the backend.
- **Git**

## 2. Environment Variables
Both applications require `.env` files. 
- Copy `.env.example` to `.env` in the root (if using Docker) or inside the respective `backend/` and `frontend/` folders.
- Ensure `DATABASE_URL` is set in the backend (e.g., local SQLite `sqlite+aiosqlite:///./transitops.db` for rapid prototyping, or Supabase PostgreSQL URI).

## 3. Running the Backend
We use `uvicorn` as our ASGI server.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API runs at `http://localhost:8000`. 
Swagger UI docs are auto-generated at `http://localhost:8000/docs`.

## 4. Running the Frontend
We use `vite` for the dev server.

```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

## 5. Typical Development Flow
1. **Database Change**: Update SQLAlchemy model in `backend/app/models/`. Run Alembic migrations (if using Postgres). Update Pydantic schema in `backend/app/schemas/`.
2. **Backend Logic**: Update `repositories/` for DB access, then `services/` for business logic, then expose via `api/`.
3. **API Integration**: Add a new API call in `frontend/src/api/`. Add a corresponding React Query hook in `frontend/src/hooks/`.
4. **UI Construction**: Build or update components in `frontend/src/components/`, then compose them in the specific page in `frontend/src/pages/`.

## Architecture Notes: Hot Reloading
Both `uvicorn --reload` and Vite's HMR provide instant feedback. However, changing backend database models requires a restart of the python server in some edge cases.
