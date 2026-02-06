# EventFlow API - Postman Collection

Complete Postman collection for testing the EventFlow API with automatic token management.

## Features

✅ **Automatic Token Management** - Access tokens are automatically saved after login/register  
✅ **Role-Based Authentication** - Separate tokens for Admin and Participant roles  
✅ **Auto-Save IDs** - Event, User, and Reservation IDs are automatically saved for reuse  
✅ **Pre-configured Examples** - All requests include sample data  
✅ **Complete Coverage** - All 22 endpoints included

## Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select `EventFlow_API.postman_collection.json`
4. The collection will appear in your Collections sidebar

### 2. Configure Base URL

The collection uses a `baseUrl` variable (default: `http://localhost:3000`).  
To change it:
1. Click on the collection name
2. Go to **Variables** tab
3. Update the `baseUrl` value

### 3. Testing Workflow

**Step 1: Register Users**
```
1. Run "Register Admin" - Token automatically saved to adminToken
2. Run "Register Participant" - Token automatically saved to participantToken
```

**Step 2: Create Events (Admin)**
```
3. Run "Create Event (Admin)" - Event ID automatically saved
```

**Step 3: Make Reservations (Participant)**
```
4. Run "Create Reservation (Participant)" - Reservation ID automatically saved
```

**Step 4: Admin Actions**
```
5. Run "Update Reservation Status (Admin)" - Confirm/Refuse reservations
6. Run "Get Reservations By Event (Admin)" - View all reservations
```

## Collection Variables

The collection automatically manages these variables:

| Variable | Description | Auto-Saved |
|----------|-------------|------------|
| `baseUrl` | API base URL | Manual |
| `access_token` | Current user token | ✅ Yes |
| `adminToken` | Admin user token | ✅ Yes |
| `participantToken` | Participant token | ✅ Yes |
| `eventId` | Last created event ID | ✅ Yes |
| `userId` | Last created user ID | ✅ Yes |
| `reservationId` | Last created reservation ID | ✅ Yes |

## Endpoints Overview

### 🔐 Auth (3 endpoints)
- **POST** `/auth/register` - Register new user (Admin/Participant)
- **POST** `/auth/login` - Login with credentials

### 👥 Users (5 endpoints)
- **POST** `/users` - Create user (Admin only)
- **GET** `/users` - Get all users (Admin only)
- **GET** `/users/:id` - Get user by ID
- **PATCH** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user

### 🎉 Events (6 endpoints)
- **POST** `/events` - Create event (Admin only)
- **GET** `/events` - Get all published events (Public)
- **GET** `/events/admin/all` - Get all events (Admin only)
- **GET** `/events/:id` - Get event by ID (Public)
- **PATCH** `/events/:id` - Update event (Admin only)
- **DELETE** `/events/:id` - Delete event (Admin only)

### 🎫 Reservations (6 endpoints)
- **POST** `/reservations` - Create reservation (Participant)
- **GET** `/reservations/my` - Get my reservations (Participant)
- **GET** `/reservations/:id/ticket` - Download PDF ticket (Participant)
- **PATCH** `/reservations/:id/cancel` - Cancel reservation (Participant)
- **GET** `/reservations/event/:eventId` - Get event reservations (Admin)
- **PATCH** `/reservations/:id/status` - Update status (Admin)

## Token Management

### Automatic Token Saving

Tokens are automatically saved when you:
- Register a new user (Admin or Participant)
- Login with credentials

The collection uses test scripts to extract and save tokens:

```javascript
// Automatically executed after registration/login
if (pm.response.code === 201 || pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.access_token) {
        pm.collectionVariables.set('access_token', jsonData.access_token);
        // Role-specific token saved based on user role
    }
}
```

### Using Tokens

All protected endpoints automatically use the appropriate token:
- **Admin endpoints** → Use `{{adminToken}}`
- **Participant endpoints** → Use `{{participantToken}}`
- **General endpoints** → Use `{{access_token}}`

No manual copying of tokens required! 🎉

## Role-Based Access

### Admin Role
Can access:
- All user management endpoints
- Create/Update/Delete events
- View all reservations
- Update reservation status

### Participant Role
Can access:
- Create reservations
- View own reservations
- Download tickets
- Cancel own reservations

## Sample Data

### Admin Registration
```json
{
  "fullName": "Admin User",
  "email": "admin@eventflow.com",
  "password": "admin123",
  "role": "admin"
}
```

### Event Creation
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  "title": "Tech Conference 2026",
  "description": "Annual technology conference",
  "date": "2026-06-15T09:00:00.000Z",
  "location": "Casablanca Convention Center",
  "totalCapacity": 200,
  "status": "PUBLISHED"
}
```

### Reservation Status Values
- `PENDING` - Waiting for admin approval
- `CONFIRMED` - Approved by admin
- `REFUSED` - Rejected by admin
- `CANCELED` - Canceled by participant

## Testing Tips

1. **Run in Order**: Follow the numbered workflow above for best experience
2. **Check Console**: Token saves are logged to Postman console
3. **View Variables**: Click collection → Variables tab to see saved values
4. **Multiple Users**: Register different users to test various scenarios
5. **Role Testing**: Use adminToken and participantToken to test permissions

## Troubleshooting

**Token not saving?**
- Check Postman Console (View → Show Postman Console)
- Verify response is 200/201 status code
- Ensure response contains `access_token` field

**401 Unauthorized?**
- Register/Login first to get a token
- Check the correct token is being used (admin vs participant)
- Token might have expired (re-login)

**Variables not working?**
- Make sure you're using collection variables, not environment variables
- Check variable names match exactly (case-sensitive)

## Environment Setup

Make sure your backend is running:
```bash
cd backend
npm run start:dev
```

Default URL: `http://localhost:3000`

## Support

For issues or questions:
- Check backend logs for errors
- Verify MongoDB is running
- Ensure all environment variables are set

---

**Happy Testing! 🚀**
