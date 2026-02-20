# CampusConnect — API Documentation

- **Base URL (local):** `http://localhost:5000/api`
- **Auth:** JWT Bearer token for protected routes

```http
Authorization: Bearer <token>
```

All responses follow a consistent pattern:

- Success (common):

```json
{ "success": true, "data": {} }
```

- Error (global handler):

```json
{ "success": false, "message": "...", "error": "..." }
```

> Note: `error` (stack trace) is included only when `NODE_ENV=development`.

---

## Authentication — `/api/auth`

### `POST /api/auth/register` (Public)

Register a student or admin.

Request body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "student",
  "department": "CSE",
  "year": "3",
  "interests": ["technical", "placement"]
}
```

Admin example:

```json
{
  "name": "Admin",
  "email": "admin@college.edu",
  "password": "secret123",
  "role": "admin",
  "organization": "Event Cell",
  "position": "Coordinator"
}
```

Response:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student"
  }
}
```

---

### `POST /api/auth/login` (Public)

Request body:

```json
{ "email": "alice@example.com", "password": "secret123" }
```

Response:

```json
{ "success": true, "token": "<jwt>", "user": { "_id": "...", "role": "student" } }
```

---

### `GET /api/auth/profile` (Protected)

Alias:

- `GET /api/auth/me`

Response:

```json
{ "success": true, "data": { "_id": "...", "email": "...", "role": "student" } }
```

---

### `PUT /api/auth/profile` (Protected)

Alias:

- `PUT /api/auth/updateprofile`

Request body (example):

```json
{
  "name": "Alice Updated",
  "department": "CSE",
  "year": "3",
  "interests": ["technical"]
}
```

Response:

```json
{ "success": true, "data": { "_id": "...", "name": "Alice Updated" } }
```

---

### `PUT /api/auth/updatepassword` (Protected)

Request body:

```json
{ "currentPassword": "secret123", "newPassword": "secret456" }
```

Response:

```json
{ "success": true, "token": "<jwt>", "user": { "_id": "..." } }
```

---

### `GET /api/auth/users` (Protected/Admin)

Response:

```json
{ "success": true, "count": 2, "data": [ {"_id":"...","email":"..."} ] }
```

---

### `DELETE /api/auth/users/:id` (Protected/Admin)

Response:

```json
{ "success": true, "message": "User deleted successfully" }
```

---

## Admin — `/api/admin`

### `GET /api/admin/stats` (Protected/Admin)

Response:

```json
{
  "success": true,
  "data": {
    "totalEvents": 10,
    "totalCompanyVisits": 4,
    "totalStudents": 120,
    "totalRegistrations": 300,
    "totalApplications": 80
  }
}
```

---

## Events — `/api/events`

### `GET /api/events` (Public)

Query params:

- `category` (technical|cultural|sports|placement)
- `status` (upcoming|ongoing|completed|cancelled)
- `startDate`, `endDate` (ISO date)
- `page`, `limit`

Response:

```json
{
  "success": true,
  "count": 10,
  "total": 34,
  "page": 1,
  "pages": 4,
  "data": [ { "_id": "...", "title": "..." } ]
}
```

---

### `GET /api/events/upcoming` (Public)

Response:

```json
{ "success": true, "count": 3, "data": [ {"_id":"...","status":"upcoming"} ] }
```

---

### `GET /api/events/:id` (Public)

Response:

```json
{ "success": true, "data": { "_id": "...", "title": "..." } }
```

---

### `GET /api/events/recommended/me` (Protected)

Returns personalized recommended events.

Response:

```json
{ "success": true, "count": 2, "data": [ {"_id":"...","category":"technical"} ] }
```

---

### `POST /api/events` (Protected/Admin)

Request body:

```json
{
  "title": "Hackathon 2026",
  "description": "24-hour hackathon",
  "category": "technical",
  "date": "2026-03-10T00:00:00.000Z",
  "time": "10:00 AM",
  "venue": "Main Auditorium",
  "eligibility": { "department": ["All"], "year": [1,2,3,4] },
  "maxCapacity": 200
}
```

Response:

```json
{ "success": true, "message": "Event created successfully", "data": { "_id": "..." } }
```

---

### `PUT /api/events/:id` (Protected/Admin)

Request body (partial allowed):

```json
{ "status": "completed" }
```

Response:

```json
{ "success": true, "message": "Event updated successfully", "data": { "_id": "..." } }
```

---

### `DELETE /api/events/:id` (Protected/Admin)

Deletes event and related registrations.

Response:

```json
{ "success": true, "message": "Event and related registrations deleted successfully", "data": {} }
```

---

## Registrations — `/api/registrations`

> All routes under this group require authentication (`protect`).

### `POST /api/registrations` (Protected)

Registers the current student for an event.

Request body:

```json
{ "eventId": "<eventObjectId>" }
```

Response:

```json
{ "success": true, "message": "Successfully registered for the event", "data": { "_id": "..." } }
```

Common errors:

- 403 if department/year not eligible
- 400 if already registered
- 400 if event is full

---

### `GET /api/registrations/my-registrations` (Protected)

Response:

```json
{ "success": true, "count": 2, "data": [ {"_id":"...","event":{}} ] }
```

---

### `GET /api/registrations` (Protected/Admin)

Response:

```json
{ "success": true, "count": 10, "data": [ {"_id":"..."} ] }
```

---

### `GET /api/registrations/analytics` (Protected/Admin)

Response:

```json
{
  "success": true,
  "data": {
    "totalEventRegistrations": 120,
    "registrationsPerEvent": [
      { "eventId": "...", "title": "Hackathon 2026", "count": 40 }
    ]
  }
}
```

---

### `GET /api/registrations/event/:eventId` (Protected/Admin)

Response:

```json
{ "success": true, "count": 2, "data": [ {"student": {"name":"..."}} ] }
```

---

### `GET /api/registrations/:id` (Protected)

Accessible to:

- owner student OR
- admin

Response:

```json
{ "success": true, "data": { "_id": "...", "status": "registered" } }
```

---

### `DELETE /api/registrations/:id` (Protected)

Cancels a registration (owner only).

Response:

```json
{ "success": true, "message": "Registration cancelled successfully", "data": {} }
```

---

### `PUT /api/registrations/:id/feedback` (Protected)

Request body:

```json
{ "rating": 5, "comment": "Great event" }
```

Response:

```json
{ "success": true, "message": "Feedback added successfully", "data": { "_id": "..." } }
```

---

## Event Alias Routes — `/api/event`

### `GET /api/event/:id/registrations` (Protected/Admin)

Alias endpoint for admin drill-down registrations.

---

## Company Visits — `/api/company-visits`

### `GET /api/company-visits` (Public)

Query params:

- `status` (scheduled|completed|cancelled)
- `startDate`, `endDate` (filters by `visitDate`)

Response:

```json
{ "success": true, "count": 2, "data": [ {"_id":"...","companyName":"..."} ] }
```

---

### `GET /api/company-visits/upcoming` (Public)

Response:

```json
{ "success": true, "count": 1, "data": [ {"status":"scheduled"} ] }
```

---

### `GET /api/company-visits/:id` (Public)

Response:

```json
{ "success": true, "data": { "_id": "...", "companyName": "..." } }
```

---

### `GET /api/company-visits/eligible/me` (Protected)

Response:

```json
{ "success": true, "count": 1, "data": [ {"_id":"..."} ] }
```

---

### `POST /api/company-visits` (Protected/Admin)

Supports both JSON and `multipart/form-data`.

JSON request body:

```json
{
  "companyName": "Acme",
  "jobRole": "SDE",
  "description": "On-campus drive",
  "eligibility": { "department": ["CSE"], "year": [4], "minCGPA": 7.0 },
  "visitDate": "2026-03-15T00:00:00.000Z",
  "visitTime": "11:00 AM",
  "venue": "Seminar Hall",
  "package": "12 LPA",
  "applicationDeadline": "2026-03-10T00:00:00.000Z",
  "contactPerson": { "name": "HR", "email": "hr@acme.com", "phone": "9999999999" }
}
```

Response:

```json
{ "success": true, "message": "Company visit created successfully", "data": { "_id": "..." } }
```

---

### `GET /api/company-visits/:id/applications` (Protected/Admin)

Response:

```json
{ "success": true, "count": 2, "data": [ {"student": {"name":"..."}} ] }
```

---

### `PUT /api/company-visits/:id` (Protected/Admin)

Response:

```json
{ "success": true, "message": "Company visit updated successfully", "data": { "_id": "..." } }
```

---

### `DELETE /api/company-visits/:id` (Protected/Admin)

Response:

```json
{ "success": true, "message": "Company visit deleted successfully", "data": {} }
```

---

## Company Alias Routes — `/api/company`

- `PUT /api/company/:id` (Protected/Admin) — alias for updating company visit
- `GET /api/company/:id/applications` (Protected/Admin) — alias for applications drill-down

---

## Company Visit Applications — `/api/company-visit-applications`

> All routes require authentication.

### `POST /api/company-visit-applications` (Protected/Student)

Request body:

```json
{ "companyVisitId": "<companyVisitObjectId>" }
```

Response:

```json
{ "success": true, "message": "Successfully applied to company visit", "data": { "_id": "..." } }
```

Duplicate apply:

```json
{ "success": false, "message": "You have already applied to this company visit" }
```

---

### `GET /api/company-visit-applications/my` (Protected/Student)

Response:

```json
{ "success": true, "count": 2, "data": [ {"companyVisit": {"companyName":"..."}} ] }
```

---

### `DELETE /api/company-visit-applications/:id` (Protected/Student)

Response:

```json
{ "success": true, "message": "Application cancelled", "data": {} }
```

---

### `GET /api/company-visit-applications/analytics` (Protected/Admin)

Response:

```json
{
  "success": true,
  "data": {
    "totalCompanyVisits": 4,
    "totalApplications": 80,
    "applicationsPerCompany": [ { "companyVisitId": "...", "companyName": "Acme", "count": 20 } ],
    "eligibleVsApplied": { "eligibleVisits": 4, "appliedVisits": 2 },
    "upcomingVsPast": [ { "_id": "upcoming", "count": 3 }, { "_id": "past", "count": 1 } ]
  }
}
```

---

## Protected Routes Summary

Protected via `protect` middleware:

- `/api/auth/profile`, `/api/auth/me`, `/api/auth/updateprofile`, `/api/auth/updatepassword`
- All `/api/registrations/*`
- `/api/events/recommended/me`
- `/api/company-visits/eligible/me`
- `/api/company-visit-applications/*`

Role-gated via `authorize(...)`:

- Admin: event CRUD, company-visit CRUD, analytics, admin stats
- Student: company visit applications endpoints
