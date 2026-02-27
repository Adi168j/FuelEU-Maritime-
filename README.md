# FuelEU Maritime

A full-stack application for EU Regulation (EU) 2023/1805 maritime compliance—routes, GHG comparison, banking, and pooling.

---

## Overview

FuelEU Maritime helps manage voyage data and compliance balances for ships under the EU FuelEU Maritime regulation. You can:

- View and manage routes (voyage/leg data)
- Compare GHG intensity against a baseline
- Compute, bank, and apply compliance surpluses
- Create pools to redistribute compliance across ships

The app uses a hexagonal backend (ports & adapters) with PostgreSQL and a React + Vite frontend.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite + Tailwind)                                   │
│  Routes | Compare | Banking | Pooling                                 │
│         └─────────────┬──────────────────────────────────────────┘   │
│                       │ apiClient (fetch)                             │
└───────────────────────┼──────────────────────────────────────────────┘
                        │ HTTP REST
                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND (Express + TypeScript)                                       │
│  ┌─────────────────┐    ┌──────────────────────┐                     │
│  │ RouteController │    │ ComplianceController │                     │
│  │ /routes         │    │ /compliance, /banking │                    │
│  │ /routes/compare │    │ /pools                │                    │
│  └────────┬────────┘    └──────────┬───────────┘                     │
│           │                        │                                  │
│           ▼                        ▼                                  │
│  ┌─────────────────┐    ┌──────────────────────┐                     │
│  │ IRouteRepo      │    │ IComplianceRepo      │                     │
│  │ (port)          │    │ (port) + UseCases    │                     │
│  └────────┬────────┘    └──────────┬───────────┘                     │
│           │                        │                                  │
│           └────────────┬───────────┘                                  │
│                        ▼                                              │
│              PostgresRouteRepo / PostgresComplianceRepo               │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
              PostgreSQL (routes, ship_compliance, bank_entries)
```

---

## Tech Stack

| Layer   | Tech                    |
|---------|-------------------------|
| Backend | Node.js, Express 5, TypeScript |
| Database| PostgreSQL              |
| Frontend| React 19, Vite 7, Tailwind CSS |
| Testing | Jest                    |

---

## Folder Structure

```
FuelEU-Maritime/
├── backend/
│   ├── migrations/           # SQL schema and seed
│   │   └── 001_schema.sql
│   ├── src/
│   │   ├── adapters/inbound/http/   # RouteController, ComplianceController
│   │   ├── core/
│   │   │   ├── application/         # CalculateCBUseCase, CreatePoolUseCase
│   │   │   ├── domain/              # Route, ComplianceBalance, ShipCompliance
│   │   │   └── ports/               # IRouteRepository, IComplianceRepository
│   │   └── infrastructure/          # server.ts, Postgres*Repository
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── adapters/infrastructure/
│   │   │   ├── apiClient.ts         # API calls to backend
│   │   │   └── ui/                  # RoutesTab, CompareTab, BankingTab, PoolingTab
│   │   └── App.tsx
│   └── package.json
└── package.json                    # Monorepo root
```

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clone and install

```bash
git clone <repo-url>
cd FuelEU-Maritime
npm install
```

### 2. Database

Create the database and apply the migration:

```bash
psql -U postgres -c "CREATE DATABASE fuel_eu_maritime;"  # optional, or use existing DB
psql -U postgres -d postgres -f backend/migrations/001_schema.sql
```

### 3. Environment variables

Copy the example env file and edit:

```bash
cp backend/.env.example backend/.env
```

Configure `backend/.env`:

| Variable   | Description           | Example        |
|-----------|------------------------|----------------|
| PG_HOST   | PostgreSQL host        | `localhost`    |
| PG_PORT   | PostgreSQL port        | `5432`         |
| PG_DATABASE | Database name        | `postgres`     |
| PG_USER   | Database user          | `postgres`     |
| PG_PASSWORD | Database password    | your password  |

Alternatively use `DATABASE_URL` (overrides the above):

```
DATABASE_URL=postgres://user:password@localhost:5432/postgres
```

---

## Running the App

### Backend

```bash
cd backend
npm start
```

Starts the API server on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm run dev
```

Starts the dev server (typically `http://localhost:5173`). Open it in the browser.

### Tests

```bash
cd backend
npm test
```

---

## Sample API Requests

**Get all routes**

```bash
curl http://localhost:3000/routes
```

**Route comparison (needs at least one baseline route)**

```bash
curl http://localhost:3000/routes/comparison
```

**Compute compliance balance**

```bash
curl "http://localhost:3000/compliance/cb?shipId=r1&year=2025"
```

**Bank surplus**

```bash
curl -X POST http://localhost:3000/banking/bank \
  -H "Content-Type: application/json" \
  -d '{"shipId":"r1","year":2025}'
```

**Create pool**

```bash
curl -X POST http://localhost:3000/pools \
  -H "Content-Type: application/json" \
  -d '{"year":2025,"members":[{"shipId":"r1"},{"shipId":"r2"},{"shipId":"r5"}]}'
```

---

## Screenshots

### Routes tab



[Routes tab]
![alt text](<Screenshot 2026-02-27 073213.png>)

---

### Compare tab (with chart)


[Compare tab]![alt text](<Screenshot 2026-02-27 073229.png>)

---

### Banking tab



[Banking tab]![alt text](<Screenshot 2026-02-27 073315.png>)

---

### Pooling validation


[Pooling tab]![alt text](<Screenshot 2026-02-27 073334.png>)

