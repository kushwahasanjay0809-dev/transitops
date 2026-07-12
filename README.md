# 🚛 TransitOps — Transport Operations Platform

A comprehensive transport and fleet management platform built with React, Node.js, Express, MySQL, and Prisma ORM.

---

## 🔗 Live Demo
Check out the live deployment on Vercel: [https://transitops-orpin.vercel.app/](https://transitops-orpin.vercel.app/)

---

## 📋 Features

### Core Modules
- **🔐 Authentication** — JWT-based auth with RBAC (Admin, Manager, Dispatcher, Viewer)
- **🚛 Vehicle Management** — Fleet tracking with status lifecycle (Available → On Trip → In Shop → Retired)
- **👤 Driver Management** — Driver roster with license validation and expiry alerts
- **🗺️ Region Management** — Geographic regions for route planning
- **📍 Trip Management** — Full trip lifecycle (Scheduled → Dispatched → In Progress → Completed/Cancelled)
- **🔧 Maintenance Tracking** — Maintenance logs with vehicle status integration
- **⛽ Fuel Log Management** — Fuel consumption with odometer and cost validation
- **💰 Expense Tracking** — 7-category expense management with vehicle/trip linking
- **📊 Dashboard** — Real-time KPIs, alerts, and operational overview
- **📈 Reports & CSV Export** — Trip, expense, fuel, and vehicle utilization reports

### Technical Highlights
- **Transactional consistency** — Vehicle/driver statuses managed atomically
- **Role-Based Access Control** — 4 roles with granular endpoint permissions
- **Dark theme** with glassmorphism UI
- **Responsive design** — Collapsible sidebar, mobile-ready
- **CSV export** — All reports downloadable as CSV files
- **Docker-ready** — Docker Compose for one-command deployment

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TailwindCSS v4, React Router, Axios, Recharts, Lucide |
| Backend | Node.js, Express.js, Prisma ORM, Zod |
| Database | MySQL 8.0 |
| Auth | JWT, bcrypt |
| Deployment | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0
- npm

### 1. Clone & Install

```bash
# Backend
cd server
cp .env.example .env    # Edit with your MySQL credentials
npm install

# Frontend
cd ../client
npm install
```

### 2. Database Setup

```bash
cd server

# Run Prisma migrations
npx prisma db push

# Seed database with sample data
npm run seed
```

### 3. Start Development

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm run dev
```

### 4. Open Browser

Navigate to `http://localhost:3000`

#### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | rajesh.sharma@transitops.in | Password@123 |
| Manager | priya.patel@transitops.in | Password@123 |
| Dispatcher | amit.kumar@transitops.in | Password@123 |
| Viewer | neha.gupta@transitops.in | Password@123 |

---

## 🐳 Docker Deployment

```bash
# One-command deployment
docker compose up -d

# Run migrations
docker exec transitops-server npx prisma db push

# Seed data
docker exec transitops-server npm run seed
```

Access at `http://localhost`

---

## 📁 Project Structure

```
transit-ops/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Sidebar, Header, Layout, UI components
│   │   ├── context/           # AuthContext
│   │   ├── lib/               # Axios API client
│   │   ├── pages/             # 10 page components
│   │   ├── App.jsx            # Router + Providers
│   │   └── index.css          # Design system (600+ lines)
│   ├── Dockerfile
│   └── nginx.conf
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Database, environment
│   │   ├── middleware/        # Auth, RBAC, validate, errorHandler
│   │   ├── modules/           # 11 feature modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── regions/
│   │   │   ├── trips/
│   │   │   ├── maintenance/
│   │   │   ├── fuel/
│   │   │   ├── expenses/
│   │   │   ├── dashboard/
│   │   │   └── reports/
│   │   ├── utils/             # ApiResponse, AppError, pagination, CSV
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 📡 API Endpoints (62+)

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| Auth | `/api/auth` | login, register, profile |
| Users | `/api/users` | CRUD + role management |
| Vehicles | `/api/vehicles` | CRUD + available + stats |
| Drivers | `/api/drivers` | CRUD + available + stats |
| Regions | `/api/regions` | CRUD + all |
| Trips | `/api/trips` | CRUD + dispatch/start/complete/cancel |
| Maintenance | `/api/maintenance` | CRUD + stats |
| Fuel Logs | `/api/fuel-logs` | CRUD + stats |
| Expenses | `/api/expenses` | CRUD + stats |
| Dashboard | `/api/dashboard` | Aggregated KPIs |
| Reports | `/api/reports` | trips/expenses/fuel/utilization + CSV |
| Health | `/api/health` | Health check |

---

## 📄 License

MIT
