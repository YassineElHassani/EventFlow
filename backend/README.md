# EventFlow Backend

REST API for the EventFlow platform, built with NestJS, MongoDB, and Passport JWT.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Environment Variables

| Variable       | Description                | Required |
|----------------|----------------------------|----------|
| MONGO_URI      | MongoDB connection string  | Yes      |
| JWT_SECRET     | JWT signing key            | Yes      |
| JWT_EXPIRATION | Token lifetime (e.g. 1d)   | No       |
| PORT           | Server port                | No       |
| FRONTEND_URL   | Frontend origin for CORS   | No       |

## Scripts

| Command              | Description                     |
|----------------------|---------------------------------|
| npm run start:dev    | Start in development mode       |
| npm run build        | Compile TypeScript to dist/     |
| npm run start:prod   | Run compiled production build   |
| npm run lint         | Lint with ESLint                |
| npm test             | Run unit tests                  |
| npm run test:e2e     | Run end-to-end tests            |
| npm run seed:admin   | Seed admin user (development)   |

## API Overview

- **POST** /auth/register -- Register a participant
- **POST** /auth/login -- Login and receive JWT
- **POST** /auth/logout -- Blacklist current token
- **GET/POST/PATCH/DELETE** /events -- Event CRUD (admin)
- **GET** /events -- Public published events
- **POST** /reservations -- Book a seat (participant)
- **GET** /reservations/my -- My reservations
- **GET** /reservations/:id/ticket -- Download PDF ticket

## Testing

```bash
npm test            # Unit tests (20 tests)
npm run test:e2e    # E2E tests (requires MongoDB)
```

## Tech

NestJS 11 | Mongoose 9 | Passport JWT | PDFKit | Jest
