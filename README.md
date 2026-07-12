# TransitOps - Smart Transport Operations Platform

A modern, scalable, full-stack application built for transport and fleet management.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS, shadcn/ui, React Router, React Query, Axios, React Hook Form, Zod, Recharts, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: Clerk

## Folder Structure
```
transitops/
├── backend/            # Express.js REST API
├── frontend/           # React.js Vite Application
├── docker-compose.yml  # Docker services configuration
├── .env.example        # Environment variables template
└── README.md
```

## Setup & Running Locally

### 1. Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (if running locally without Docker)

### 2. Environment Variables
Copy `.env.example` to the respective frontend and backend directories.

```bash
# In frontend directory
cp ../.env.example .env
# Edit .env and keep only frontend variables

# In backend directory
cp ../.env.example .env
# Edit .env and keep only backend variables
```

### 3. Running with Docker (Recommended)
You can start both the frontend and backend with a single command:
```bash
docker-compose up --build
```
- Frontend will be available at: http://localhost:5173
- Backend will be available at: http://localhost:5000

### 4. Running locally (Without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Database Schema (Supabase)
Apply the SQL script located at `backend/database/schema.sql` in your Supabase SQL Editor.
