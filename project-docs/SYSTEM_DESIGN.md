# CampusConnect — System Design

This document describes the architecture and key flows of **CampusConnect (College Event Management System)**.

---

## High-Level Architecture

```
[ React Frontend (Vite) ]
          |
          | HTTPS/HTTP (REST JSON)
          v
[ Node.js + Express API ]
          |
          | Mongoose ODM
          v
[ MongoDB ]

(Uploads)
Express serves static files from /uploads
```

---

## Frontend ↔ Backend ↔ Database Flow

### Typical Request Flow

1. User performs an action in React (e.g., register, login, create event).
2. Frontend calls the API using a centralized request helper (`src/services/api.ts`).
3. Backend routes map to controllers.
4. Controllers execute business logic and read/write to MongoDB via Mongoose models.
5. Response is returned to the frontend in a consistent JSON envelope.

### API Base URL (Frontend)

Frontend uses:

- `VITE_API_BASE_URL` or fallback `http://localhost:5000/api`

All requests are issued as:

- `fetch(BASE_URL + endpoint)`

---

## Authentication Flow (JWT)

### Registration

- **Endpoint:** `POST /api/auth/register`
- Backend creates user and returns:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "_id": "...", "name": "...", "email": "...", "role": "student" }
}
```

### Login

- **Endpoint:** `POST /api/auth/login`
- Backend validates credentials and returns the same token response format.

### Token Storage and Usage

- Frontend stores JWT in localStorage as `campus_connect_token`.
- Every request attaches:

```http
Authorization: Bearer <token>
```

### Backend Verification

- `middleware/auth.js`:
  - Extracts Bearer token.
  - Verifies via `JWT_SECRET`.
  - Loads user from DB and sets `req.user`.

---

## Role-Based Access Control (RBAC)

Roles are stored in the `User` model:

- `role: 'student' | 'admin'`

Authorization is enforced using:

- `authorize('admin')`
- `authorize('student')`

Examples:

- **Admin only**:
  - `POST /api/events`
  - `POST /api/company-visits`
  - `GET /api/admin/stats`
- **Student only**:
  - `POST /api/company-visit-applications`
  - `GET /api/company-visit-applications/my`

---

## Event Creation Lifecycle

### 1) Admin Creates an Event

- **Endpoint:** `POST /api/events` (Admin)
- Controller (`eventController.createEvent`) sets:
  - `createdBy = req.user.id`
  - Ensures `eligibility` structure exists.

### 2) Students Discover Events

- **Public listing:** `GET /api/events`
  - supports filters: `category`, `status`, `startDate`, `endDate`, pagination `page`, `limit`.
- **Upcoming events:** `GET /api/events/upcoming`

### 3) Student Recommendations

- **Endpoint:** `GET /api/events/recommended/me` (Protected)
- Matches:
  - `category in user.interests`
  - eligibility department includes `All` or student department
  - eligibility year includes student year
  - status upcoming + date in future

### 4) Student Registration

- **Endpoint:** `POST /api/registrations` (Protected)
- Validations:
  - event exists
  - status is `upcoming`
  - department/year eligibility checks
  - duplicate registration check
  - capacity check (`maxCapacity` vs `registrationCount`)
- Side effects:
  - creates a `Registration`
  - increments event `registrationCount`

### 5) Cancellation and Feedback

- **Cancel:** `DELETE /api/registrations/:id`
  - marks registration `cancelled`
  - decrements event `registrationCount`
- **Feedback:** `PUT /api/registrations/:id/feedback`
  - stores `feedback.rating` + `feedback.comment`

---

## Company Visit Lifecycle

### 1) Admin Creates Company Visit (Optional Logo)

- **Endpoint:** `POST /api/company-visits` (Admin)
- Supports `multipart/form-data` using Multer:
  - `companyLogo` file field
- Backend stores file under `/uploads` and exposes it via:
  - `GET /uploads/<filename>`

### 2) Student Eligibility View

- **Endpoint:** `GET /api/company-visits/eligible/me` (Protected)
- Filters scheduled, future visits and eligibility:
  - department in `['All', user.department]`
  - year includes user year

### 3) Student Applies

- **Endpoint:** `POST /api/company-visit-applications` (Student)
- Validations:
  - visit exists and is `scheduled`
  - optional deadline not passed
  - department/year eligibility checks
  - prevents duplicates via DB unique index

---

## Data Flow Explanation (End-to-End)

### Example: Student Registers for an Event

1. Student logs in and receives JWT.
2. Frontend stores JWT in localStorage.
3. Student clicks "Register" on an event.
4. Frontend calls:

```http
POST /api/registrations
Authorization: Bearer <jwt>
Content-Type: application/json

{ "eventId": "<eventObjectId>" }
```

5. Backend:

- `protect` middleware authenticates.
- `registerForEvent` validates eligibility and capacity.
- Creates `Registration` and increments `Event.registrationCount`.

6. Frontend updates UI based on response.

---

## Error Handling & Response Consistency

Backend uses a centralized error handler (`middleware/errorHandler.js`).

Common error envelope:

```json
{
  "success": false,
  "message": "Human readable message",
  "error": "<stack trace - only in development>"
}
```

Client-side:

- 401 triggers token removal and redirects to `/login`.
- 403 throws an explicit “Access Denied” error.
