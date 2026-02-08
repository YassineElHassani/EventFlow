# EventFlow Frontend

Next.js application for the EventFlow platform with SSR, Redux state management, and Tailwind CSS.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

| Variable            | Description                       | Required |
|---------------------|-----------------------------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL                   | Yes      |
| API_URL_INTERNAL    | Backend URL for SSR (Docker only) | No       |

## Scripts

| Command          | Description                |
|------------------|----------------------------|
| npm run dev      | Start development server   |
| npm run build    | Production build           |
| npm start        | Serve production build     |
| npm run lint     | Lint with ESLint           |
| npm test         | Run tests                  |

## Pages

| Route                         | Access      | Rendering |
|-------------------------------|-------------|-----------|
| /                             | Public      | SSR       |
| /events/:id                   | Public      | SSR       |
| /login                        | Public      | CSR       |
| /register                     | Public      | CSR       |
| /admin/dashboard              | Admin       | CSR       |
| /admin/events                 | Admin       | CSR       |
| /admin/reservations           | Admin       | CSR       |
| /admin/users                  | Admin       | CSR       |
| /dashboard                    | Participant | CSR       |
| /dashboard/reservations       | Participant | CSR       |
| /dashboard/reservations/:id   | Participant | CSR       |

## Testing

```bash
npm test            # 16 tests (Jest + React Testing Library)
```

## Tech

Next.js 16 | React 19 | Redux Toolkit | Tailwind CSS v4 | react-hook-form | Jest
