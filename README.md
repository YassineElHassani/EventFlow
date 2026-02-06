# EventFlow

Event Management System built with NestJS, MongoDB, and Next.js

## 📁 Project Structure

```
EventFlow/
├── backend/          # NestJS API
├── frontend/         # Next.js application
├── EventFlow_API.postman_collection.json   # Postman collection
├── EventFlow.postman_environment.json      # Postman environment
└── POSTMAN_COLLECTION_GUIDE.md            # API testing guide
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on: `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3001`

## 🧪 API Testing with Postman

Import the Postman collection for complete API testing:

1. **Import Collection**: `EventFlow_API.postman_collection.json`
2. **Import Environment** (optional): `EventFlow.postman_environment.json`
3. **Read the Guide**: See `POSTMAN_COLLECTION_GUIDE.md` for detailed instructions

### Key Features
✅ **22 Endpoints** - Complete API coverage  
✅ **Auto Token Management** - Tokens saved automatically after login/register  
✅ **Role-Based Testing** - Admin and Participant tokens managed separately  
✅ **Auto-Save IDs** - Event, User, Reservation IDs automatically saved

## 📚 API Endpoints

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login

### Users (Admin)
- POST `/users` - Create user
- GET `/users` - Get all users
- GET `/users/:id` - Get user by ID
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

### Events
- POST `/events` - Create event (Admin)
- GET `/events` - Get published events (Public)
- GET `/events/admin/all` - Get all events (Admin)
- GET `/events/:id` - Get event by ID
- PATCH `/events/:id` - Update event (Admin)
- DELETE `/events/:id` - Delete event (Admin)

### Reservations
- POST `/reservations` - Create reservation (Participant)
- GET `/reservations/my` - Get my reservations (Participant)
- GET `/reservations/:id/ticket` - Download PDF ticket (Participant)
- PATCH `/reservations/:id/cancel` - Cancel reservation (Participant)
- GET `/reservations/event/:eventId` - Get event reservations (Admin)
- PATCH `/reservations/:id/status` - Update status (Admin)

## 🛠️ Tech Stack

**Backend:**
- NestJS 11.x
- MongoDB with Mongoose
- JWT Authentication
- TypeScript
- Docker

**Frontend:**
- Next.js 15.x
- React 19.x
- TypeScript
- Tailwind CSS (planned)

## 📝 Environment Variables

Create `.env` files in backend and frontend:

**Backend** (`backend/.env`):
```env
PORT=3000
MONGODB_URI=mongodb://mongo:27017/eventflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=1d
FRONTEND_URL=http://localhost:3001
```

## 🐳 Docker Setup

Run everything with Docker:

```bash
docker-compose up -d
```

Services:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`

## 📖 Documentation

- [Postman Collection Guide](./POSTMAN_COLLECTION_GUIDE.md) - Complete API testing guide

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                 # Unit tests
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage report
npm run lint            # ESLint check
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
