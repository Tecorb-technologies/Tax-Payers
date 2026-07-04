# Tax-Payers

A civic budget-transparency app. It shows how public money is being spent
across areas and projects, lets citizens drill into individual projects
(budget vs. spend, timeline, location), and includes an AI chat assistant
for asking questions about a project — using a provider/API key the user
supplies themselves (bring-your-own-key; nothing is stored server-side).

## Stack

- **Frontend** (`/frontend`) — React (JavaScript) + Vite, Tailwind CSS,
  shadcn/ui components, React Router, Recharts, Leaflet for maps.
- **Backend** (`/backend`) — Node.js + Express, organized as
  `routes/ → controllers/ → services/ → models/`, in-memory data (no
  database in this MVP).

The frontend talks to the backend over a REST API under a configurable
base URL. Request/response shapes and validation rules are defined once
on the backend.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

## Running locally

In two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

**Backend** (`backend/.env`):

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | Backend port (default `5000`) |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |
| `OLLAMA_BASE_URL` | Optional override for a local Ollama instance (default `http://localhost:11434`) |

`DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET` are reserved for future use
and unused by the current in-memory, no-auth MVP.

**Frontend** (`frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5000/api`) |

AI chat provider, model, and API key are entered by the user in the app's
Settings page and sent per-request — the backend never stores them.

## API

All routes are mounted under `/api`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/areas` | List areas |
| `GET` | `/areas/:id` | Get a single area |
| `GET` | `/projects` | List projects (filter by `areaId`, `type`, `status`, `q`) |
| `GET` | `/projects/:id` | Get a single project |
| `GET` | `/stats` | Aggregate spending stats (optional `areaId`) |
| `GET` | `/providers` | Supported AI chat providers |
| `POST` | `/chat` | Send a chat message to the selected AI provider |

## Testing & linting

```bash
# Backend
cd backend
npm test        # Jest + Supertest
npm run lint     # ESLint

# Frontend
cd frontend
npm run lint     # Oxlint
```

## Project structure

```
backend/
  src/
    routes/        # Express route definitions
    controllers/    # Request/response handling
    services/       # Business logic, AI provider integrations
    models/         # In-memory data
    middleware/      # Validation, error handling
    __tests__/       # Jest + Supertest tests
frontend/
  src/
    pages/          # Route-level views (Home, Area, Project, Settings)
    components/      # Reusable UI, including shadcn/ui primitives in ui/
    lib/             # API client, formatting, shared helpers
    hooks/           # Custom React hooks
```
