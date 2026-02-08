# EventFlow

Full-stack event management and reservation platform built with NestJS, Next.js, and MongoDB. Organizers create and manage events while participants discover, book seats, and download PDF tickets.

Live demo: [Frontend (Vercel)](https://event-flow-ashy.vercel.app) | [Backend API (Render)](https://eventflow-backend-fwtk.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)

---

## Features

**Authentication and Authorization**
- JWT-based authentication with token blacklisting (logout)
- Role-based access control: Admin and Participant
- Password hashing with bcryptjs

**Event Management (Admin)**
- Create, update, delete events
- Publish/cancel events with status management
- View all events and their reservation statistics

**Reservations (Participant)**
- Book seats for published events with atomic seat counting
- View personal reservations
- Cancel reservations
- Download PDF tickets/boarding passes

**Frontend**
- Server-side rendered public pages (landing, event detail)
- Client-side dashboards with Redux state management
- Responsive design with Tailwind CSS
- Form validation with react-hook-form
- Route protection with role-based auth guards

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| State       | Redux Toolkit, react-redux                      |
| Backend     | NestJS 11, TypeScript, Passport JWT             |
| Database    | MongoDB with Mongoose 9                         |
| PDF         | PDFKit                                          |
| Testing     | Jest, React Testing Library, Supertest          |
| CI/CD       | GitHub Actions (9 jobs)                         |
| Containers  | Docker, Docker Compose                          |
| Deployment  | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Architecture

```
                    +------------------+
                    |   MongoDB Atlas  |
                    +--------+---------+
                             |
+------------+      +--------+---------+      +------------------+
|   Browser  +----->+  NestJS Backend  +----->+  Mongoose ODM    |
|  (Next.js) |      |  (REST API)      |      +------------------+
+------------+      +------------------+
     |                       |
     | NEXT_PUBLIC_API_URL   | JWT Auth
     |                       | Role Guards
     +-----------------------+
```

- Public pages (landing, event detail) use SSR for SEO
- Dashboard pages use CSR with Redux for state management
- Backend exposes a RESTful API with JWT authentication
- Role-based guards protect admin and participant endpoints

---

## Project Structure

```
EventFlow/
  backend/                  # NestJS REST API
    src/
      auth/                 # Authentication (register, login, logout)
      events/               # Event CRUD with status management
      reservations/         # Booking, cancellation, PDF tickets
      users/                # User management (admin only)
      common/               # Guards, decorators, filters, interfaces
      seeds/                # Admin seeder script
  frontend/                 # Next.js application
    app/                    # App Router pages
      admin/                # Admin dashboard pages
      dashboard/            # Participant dashboard pages
      events/               # Public event detail (SSR)
      login/                # Auth pages
      register/
    components/             # Reusable UI and layout components
    store/                  # Redux store and slices
    lib/                    # API client, types, utilities
    __tests__/              # Frontend tests
  UML/                      # Class and Use Case diagrams
  .github/workflows/        # CI/CD pipeline
  docker-compose.yml        # Local development with Docker
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Configure your environment variables
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev
```

### Seed Admin User

```bash
cd backend
npm run seed:admin
```

---

## Environment Variables

### Backend (.env)

| Variable         | Description                  | Default                             |
|------------------|------------------------------|-------------------------------------|
| PORT             | Server port                  | 3000                                |
| MONGO_URI        | MongoDB connection string    | mongodb://localhost:27017/eventflow |
| JWT_SECRET       | Secret key for JWT signing   | (required)                          |
| JWT_EXPIRATION   | Token expiration duration    | 1d                                  |
| FRONTEND_URL     | Frontend origin for CORS     | http://localhost:3001               |
| ADMIN_EMAIL      | Seed admin email             | (optional)                          |
| ADMIN_PASSWORD   | Seed admin password          | (optional)                          |
| ADMIN_NAME       | Seed admin full name         | (optional)                          |

### Frontend (.env.local)

| Variable              | Description                   | Default                |
|-----------------------|-------------------------------|------------------------|
| NEXT_PUBLIC_API_URL   | Backend API base URL          | http://localhost:3000  |
| API_URL_INTERNAL      | Backend URL for SSR in Docker | http://backend:3000    |

---

## Running with Docker

```bash
# Start all services (MongoDB, backend, frontend)
docker compose up --build

# Access:
#   Frontend  -> http://localhost:3001
#   Backend   -> http://localhost:3000
#   MongoDB   -> localhost:27017
```

---

## API Endpoints

### Auth
| Method | Endpoint         | Auth | Description             |
|--------|------------------|------|-------------------------|
| POST   | /auth/register   | No   | Register (participant)  |
| POST   | /auth/login      | No   | Login                   |
| POST   | /auth/logout     | JWT  | Logout (blacklist token)|

### Events
| Method | Endpoint          | Auth       | Description              |
|--------|-------------------|------------|--------------------------|
| GET    | /events           | No         | List published events    |
| GET    | /events/:id       | No         | Get event by ID          |
| GET    | /events/admin/all | JWT+Admin  | List all events          |
| POST   | /events           | JWT+Admin  | Create event             |
| PATCH  | /events/:id       | JWT+Admin  | Update event             |
| DELETE | /events/:id       | JWT+Admin  | Delete event             |

### Reservations
| Method | Endpoint                          | Auth            | Description              |
|--------|-----------------------------------|-----------------|--------------------------|
| POST   | /reservations                     | JWT+Participant | Create reservation       |
| GET    | /reservations/my                  | JWT+Participant | My reservations          |
| GET    | /reservations/:id/ticket          | JWT             | Download PDF ticket      |
| PATCH  | /reservations/:id/cancel          | JWT+Participant | Cancel reservation       |
| GET    | /reservations/event/:eventId      | JWT+Admin       | Reservations by event    |
| PATCH  | /reservations/:id/status          | JWT+Admin       | Update reservation status|

### Users (Admin)
| Method | Endpoint      | Auth       | Description       |
|--------|---------------|------------|-------------------|
| GET    | /users        | JWT+Admin  | List all users    |
| GET    | /users/:id    | JWT+Admin  | Get user by ID    |
| PATCH  | /users/:id    | JWT+Admin  | Update user       |
| DELETE | /users/:id    | JWT+Admin  | Delete user       |

---

## Testing

```bash
# Backend unit tests
cd backend && npm test

# Backend E2E tests (requires MongoDB)
cd backend && npm run test:e2e

# Frontend tests
cd frontend && npm test
```

---

## CI/CD

GitHub Actions pipeline runs on every push and pull request:

1. **Backend**: Install -> Lint -> Test -> Build
2. **Frontend**: Install -> Lint -> Test -> Build
3. **Docker Publish**: Build and push images to Docker Hub (main branch only)

Pipeline configuration: `.github/workflows/ci-cd.yml`

---

## Deployment

| Service  | Platform      | URL                                              |
|----------|---------------|--------------------------------------------------|
| Frontend | Vercel        | https://event-flow-ashy.vercel.app               |
| Backend  | Render        | -                                          |
| Database | MongoDB Atlas | EventFlow cluster                                |

---

## License

This project is for educational purposes.
