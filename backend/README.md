# CampusPulse AI - Backend Service

Intelligent Campus Complaint Classification and Opinion Mining Platform Backend.

Built with **Node.js, Express, TypeScript, MongoDB Community (Mongoose), JWT, Socket.io, Multer, and node-cron**.

---

## Features

- **Granular RBAC Architecture**:
  - `student`: Submit complaints, upvote community tickets, participate in opinion mining polls, add remarks.
  - `dept_admin`: Manage department complaint queues, assign resolvers, create sub-tickets, transition statuses.
  - `management`: Campus-wide oversight, sentiment analytics, opinion poll campaigns, cross-department escalation.
  - `superadmin`: Full governance, department creation, user role delegation, audit log review.
- **8 Core Mongoose Schemas**:
  - `User`, `Department`, `Complaint`, `SubTicket`, `Poll`, `PollResponse`, `Notification`, `AuditLog`.
- **Intelligent Classification & Opinion Mining Client**:
  - Interfacing with local Python FastAPI microservice for category triage, sentiment polarity scoring, and duplicate detection with fallback heuristics.
- **Real-Time Communication**:
  - Socket.io rooms: User personal notifications (`user:<id>`), department resolver feeds (`dept:<id>`), complaint threads (`complaint:<id>`), and live polls (`poll:<id>`).
- **Interactive Swagger Documentation**:
  - Interactive OpenAPI documentation served directly at `/api/docs`.
- **Automated SLA Schedulers**:
  - `node-cron` background checks every 30 minutes for ticket escalations and daily expiration of closed polls.
- **Comprehensive Database Seeding**:
  - One-click seed script populating departments, users, sample complaints across categories, sub-tickets, polls, and audit logs.

---

## Directory Structure

```
backend/
├── Dockerfile                 # Multi-stage production container build
├── package.json               # Backend dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables specification
└── src/
    ├── server.ts              # Server bootstrapper (HTTP + Socket.io + Cron)
    ├── app.ts                 # Express configuration, static uploads, Swagger UI
    ├── config/                # Database connection, env loader, Swagger setup
    ├── constants/             # RBAC roles, Complaint statuses, Urgencies
    ├── controllers/           # REST endpoint controllers
    ├── middlewares/           # JWT authentication, RBAC, Multer upload, validation
    ├── models/                # 8 Mongoose schemas
    ├── routes/                # Modular Express routers & v1 aggregator
    ├── scripts/seed.ts        # Database seed script
    ├── services/              # Business logic, ML client, Cron tasks, Audit logs
    ├── socket/                # Socket.io gateway & room event emitters
    ├── utils/                 # Structured logger, response handler, JWT utilities
    └── validations/           # Zod schema validation
```

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1` and Swagger documentation at `http://localhost:5000/api/docs`.
