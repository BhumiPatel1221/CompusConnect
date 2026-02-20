# 🎓 CampusConnect Backend - Complete System Documentation

**Generated**: 2026-02-12  
**Version**: 1.0.0  
**Last Updated**: Auto-generated from codebase analysis

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Database Models](#2-database-models)
3. [Model Relationships](#3-model-relationships)
4. [API Routes](#4-api-routes)
5. [Request & Response Structure](#5-request--response-structure)
6. [Validation Rules](#6-validation-rules)
7. [Middleware Logic](#7-middleware-logic)
8. [Suggested Frontend Form Fields](#8-suggested-frontend-form-fields)

---

## 1️⃣ Project Overview

### Tech Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime Environment |
| Express.js | 5.2.1 | Web Framework |
| MongoDB | - | Database |
| Mongoose | 9.1.5 | ODM (Object Data Modeling) |
| JWT | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password Hashing |
| CORS | 2.8.6 | Cross-Origin Resource Sharing |
| dotenv | 17.2.3 | Environment Variables |

### Authentication Method
- **Type**: JWT (JSON Web Token)
- **Storage**: Bearer Token in Authorization Header
- **Expiration**: 7 days (configurable via JWT_EXPIRE env variable)
- **Secret**: Stored in environment variable (JWT_SECRET)

### Role System
The system implements **Role-Based Access Control (RBAC)** with two roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **student** | College students who can register for events | Limited - Can view events, register, manage own registrations |
| **admin** | College administrators who manage events and company visits | Full - Can create, update, delete events and company visits |

### Database
- **Type**: MongoDB (Local)
- **Connection**: mongodb://127.0.0.1:27017/college_events
- **Collections**: users, events, registrations, companyvisits

---

## 2️⃣ Database Models

### Model: User

**Purpose**: Stores information about students and administrators

| Field | Type | Required | Default | Enum | Reference | Validation |
|-------|------|----------|---------|------|-----------|------------|
| name | String | Yes | - | - | - | Max 50 chars, trimmed |
| email | String | Yes | - | - | - | Unique, lowercase, valid email format |
| password | String | Yes | - | - | - | Min 6 chars, hashed, not returned in queries |
| role | String | No | 'student' | ['student', 'admin'] | - | - |
| department | String | Conditional* | - | - | - | Required if role is 'student' |
| year | String | Conditional* | - | - | - | Required if role is 'student' |
| interests | [String] | No | [] | - | - | Array of student interests |
| organization | String | Conditional** | - | - | - | Required if role is 'admin' |
| position | String | Conditional** | - | - | - | Required if role is 'admin' |
| createdAt | Date | Auto | Date.now | - | - | Timestamp |
| updatedAt | Date | Auto | Date.now | - | - | Timestamp |

**Notes**:
- *Required only for students
- **Required only for admins
- Password is hashed using bcrypt with salt rounds of 10
- Email validation regex: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`

**Methods**:
- `matchPassword(enteredPassword)`: Compares entered password with hashed password

---

### Model: Event

**Purpose**: Stores information about college events

| Field | Type | Required | Default | Enum | Reference | Validation |
|-------|------|----------|---------|------|-----------|------------|
| title | String | Yes | - | - | - | Max 100 chars, trimmed |
| description | String | Yes | - | - | - | Max 1000 chars |
| category | String | Yes | - | ['technical', 'cultural', 'sports', 'placement'] | - | Must be one of enum values |
| date | Date | Yes | - | - | - | Event date |
| time | String | Yes | - | - | - | Event time |
| venue | String | Yes | - | - | - | Trimmed |
| eligibility.department | [String] | No | ['All'] | ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'] | - | Array of eligible departments |
| eligibility.year | [Number] | No | [1, 2, 3, 4] | - | - | Array of eligible years (1-4) |
| createdBy | ObjectId | Yes | - | - | User | Reference to admin who created |
| registrationCount | Number | No | 0 | - | - | Current number of registrations |
| maxCapacity | Number | No | null | - | - | null = unlimited capacity |
| status | String | No | 'upcoming' | ['upcoming', 'ongoing', 'completed', 'cancelled'] | - | Event status |
| createdAt | Date | Auto | Date.now | - | - | Timestamp |
| updatedAt | Date | Auto | Date.now | - | - | Timestamp |

**Indexes**:
- Compound index on `category` and `date` for faster queries

---

### Model: Registration

**Purpose**: Stores student registrations for events

| Field | Type | Required | Default | Enum | Reference | Validation |
|-------|------|----------|---------|------|-----------|------------|
| event | ObjectId | Yes | - | - | Event | Reference to Event model |
| student | ObjectId | Yes | - | - | User | Reference to User model (student) |
| registrationDate | Date | No | Date.now | - | - | Auto-generated |
| status | String | No | 'registered' | ['registered', 'attended', 'cancelled'] | - | Registration status |
| feedback.rating | Number | No | - | - | - | Min: 1, Max: 5 |
| feedback.comment | String | No | - | - | - | Max 500 chars |
| createdAt | Date | Auto | Date.now | - | - | Timestamp |
| updatedAt | Date | Auto | Date.now | - | - | Timestamp |

**Indexes**:
- Compound unique index on `event` and `student` (prevents duplicate registrations)
- Index on `student` for faster queries
- Index on `event` for faster queries

**Constraints**:
- A student can register for an event only once (enforced by unique compound index)

---

### Model: CompanyVisit

**Purpose**: Stores information about company visits and placement opportunities

| Field | Type | Required | Default | Enum | Reference | Validation |
|-------|------|----------|---------|------|-----------|------------|
| companyName | String | Yes | - | - | - | Max 100 chars, trimmed |
| jobRole | String | Yes | - | - | - | Trimmed |
| description | String | Yes | - | - | - | Max 1000 chars |
| eligibility.department | [String] | Yes | - | ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'] | - | Array of eligible departments |
| eligibility.year | [Number] | Yes | - | - | - | Array of years (1-4) |
| eligibility.minCGPA | Number | No | 0 | - | - | Min: 0, Max: 10 |
| visitDate | Date | Yes | - | - | - | Company visit date |
| visitTime | String | Yes | - | - | - | Visit time |
| venue | String | Yes | - | - | - | Trimmed |
| package | String | No | - | - | - | Salary package offered |
| applicationDeadline | Date | No | - | - | - | Application deadline |
| contactPerson.name | String | No | - | - | - | Contact person name |
| contactPerson.email | String | No | - | - | - | Contact person email |
| contactPerson.phone | String | No | - | - | - | Contact person phone |
| createdBy | ObjectId | Yes | - | - | User | Reference to admin |
| status | String | No | 'scheduled' | ['scheduled', 'completed', 'cancelled'] | - | Visit status |
| createdAt | Date | Auto | Date.now | - | - | Timestamp |
| updatedAt | Date | Auto | Date.now | - | - | Timestamp |

**Indexes**:
- Index on `visitDate` for faster queries
- Index on `companyName` for faster queries

---

## 3️⃣ Model Relationships

### Relationship Diagram

```
User (Admin) ──┬─── creates ──→ Event
               │
               └─── creates ──→ CompanyVisit

User (Student) ──── registers for ──→ Event
                                      │
                                      └──→ Registration
```

### Detailed Relationships

#### 1. User → Event (One-to-Many)
- **Type**: One-to-Many
- **Description**: One admin can create multiple events
- **Field**: `Event.createdBy` references `User._id`
- **Population**: `populate('createdBy', 'name email')`
- **Cascade**: When event is deleted, no user data is affected

#### 2. User → CompanyVisit (One-to-Many)
- **Type**: One-to-Many
- **Description**: One admin can create multiple company visits
- **Field**: `CompanyVisit.createdBy` references `User._id`
- **Population**: `populate('createdBy', 'name email')`
- **Cascade**: When company visit is deleted, no user data is affected

#### 3. User (Student) → Registration (One-to-Many)
- **Type**: One-to-Many
- **Description**: One student can have multiple registrations
- **Field**: `Registration.student` references `User._id`
- **Population**: `populate('student', 'name email department year')`
- **Cascade**: No automatic cascade (registrations remain)

#### 4. Event → Registration (One-to-Many)
- **Type**: One-to-Many
- **Description**: One event can have multiple registrations
- **Field**: `Registration.event` references `Event._id`
- **Population**: `populate('event')`
- **Cascade**: When event is deleted, all related registrations are deleted

#### 5. User (Student) + Event → Registration (Many-to-Many through Registration)
- **Type**: Many-to-Many (through Registration model)
- **Description**: Students and Events have a many-to-many relationship through registrations
- **Constraint**: Unique compound index on (event, student) prevents duplicate registrations
- **Business Logic**: 
  - Student can register for multiple events
  - Event can have multiple students
  - Each student-event pair can only have one registration

---

## 4️⃣ API Routes

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Protected | Role | Request Body |
|--------|----------|-------------|-----------|------|--------------|
| POST | `/auth/register` | Register new user (student/admin) | No | - | name, email, password, role, [role-specific fields] |
| POST | `/auth/login` | Login user | No | - | email, password |
| GET | `/auth/me` | Get current user profile | Yes | Any | - |
| PUT | `/auth/updateprofile` | Update user profile | Yes | Any | name, email, department, year, interests |
| PUT | `/auth/updatepassword` | Update password | Yes | Any | currentPassword, newPassword |

---

### Event Routes (`/api/events`)

| Method | Endpoint | Description | Protected | Role | Query Params |
|--------|----------|-------------|-----------|------|--------------|
| GET | `/events` | Get all events with filters | No | - | category, status, page, limit, startDate, endDate |
| GET | `/events/:id` | Get single event by ID | No | - | - |
| GET | `/events/recommendations/me` | Get recommended events for student | Yes | student | - |
| POST | `/events` | Create new event | Yes | admin | See request body below |
| PUT | `/events/:id` | Update event | Yes | admin | See request body below |
| DELETE | `/events/:id` | Delete event | Yes | admin | - |

---

### Registration Routes (`/api/registrations`)

| Method | Endpoint | Description | Protected | Role | Request Body |
|--------|----------|-------------|-----------|------|--------------|
| POST | `/registrations` | Register for an event | Yes | student | eventId |
| GET | `/registrations/my-registrations` | Get student's registrations | Yes | student | - |
| GET | `/registrations/event/:eventId` | Get all registrations for event | Yes | admin | - |
| DELETE | `/registrations/:id` | Cancel registration | Yes | student | - |
| PUT | `/registrations/:id/status` | Update registration status | Yes | admin | status |
| PUT | `/registrations/:id/feedback` | Add feedback for event | Yes | student | rating, comment |

---

### Company Visit Routes (`/api/company-visits`)

| Method | Endpoint | Description | Protected | Role | Query Params |
|--------|----------|-------------|-----------|------|--------------|
| GET | `/company-visits` | Get all company visits | No | - | status, startDate, endDate |
| GET | `/company-visits/:id` | Get single company visit | No | - | - |
| GET | `/company-visits/eligible/me` | Get eligible visits for student | Yes | student | - |
| POST | `/company-visits` | Create company visit | Yes | admin | See request body below |
| PUT | `/company-visits/:id` | Update company visit | Yes | admin | See request body below |
| DELETE | `/company-visits/:id` | Delete company visit | Yes | admin | - |

---

## 5️⃣ Request & Response Structure

### Authentication

#### POST `/api/auth/register` - Register User

**Request Body (Student)**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "CSE",
  "year": "3",
  "interests": ["technical", "sports"]
}
```

**Request Body (Admin)**:
```json
{
  "name": "Admin User",
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "admin",
  "organization": "College Name",
  "position": "Event Coordinator"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "CSE",
    "year": "3",
    "interests": ["technical", "sports"],
    "createdAt": "2025-02-12T10:00:00.000Z",
    "updatedAt": "2025-02-12T10:00:00.000Z"
  }
}
```

---

#### POST `/api/auth/login` - Login

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "CSE",
    "year": "3"
  }
}
```

---

#### GET `/api/auth/me` - Get Current User

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "CSE",
    "year": "3",
    "interests": ["technical"]
  }
}
```

---

### Events

#### POST `/api/events` - Create Event

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "TechFest 2025",
  "description": "Annual technical festival featuring coding competitions, hackathons, and tech talks",
  "category": "technical",
  "date": "2025-03-15",
  "time": "10:00",
  "venue": "Main Auditorium",
  "eligibility": {
    "department": ["All"],
    "year": [1, 2, 3, 4]
  },
  "maxCapacity": 200
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "TechFest 2025",
    "description": "Annual technical festival...",
    "category": "technical",
    "date": "2025-03-15T00:00:00.000Z",
    "time": "10:00",
    "venue": "Main Auditorium",
    "eligibility": {
      "department": ["All"],
      "year": [1, 2, 3, 4]
    },
    "maxCapacity": 200,
    "registrationCount": 0,
    "status": "upcoming",
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2025-02-12T10:00:00.000Z",
    "updatedAt": "2025-02-12T10:00:00.000Z"
  }
}
```

---

#### GET `/api/events` - Get All Events

**Query Parameters**:
- `category` (optional): Filter by category (technical, cultural, sports, placement)
- `status` (optional): Filter by status (upcoming, ongoing, completed, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Filter events from this date
- `endDate` (optional): Filter events until this date

**Response**:
```json
{
  "success": true,
  "count": 5,
  "total": 20,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "TechFest 2025",
      "description": "Annual technical festival...",
      "category": "technical",
      "date": "2025-03-15T00:00:00.000Z",
      "time": "10:00",
      "venue": "Main Auditorium",
      "eligibility": {
        "department": ["All"],
        "year": [1, 2, 3, 4]
      },
      "maxCapacity": 200,
      "registrationCount": 45,
      "status": "upcoming",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Admin User",
        "email": "admin@college.edu"
      }
    }
  ]
}
```

---

### Registrations

#### POST `/api/registrations` - Register for Event

**Headers**:
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "event": "507f1f77bcf86cd799439011",
    "student": "507f1f77bcf86cd799439014",
    "registrationDate": "2025-02-12T10:00:00.000Z",
    "status": "registered",
    "createdAt": "2025-02-12T10:00:00.000Z",
    "updatedAt": "2025-02-12T10:00:00.000Z"
  }
}
```

---

#### GET `/api/registrations/my-registrations` - Get Student's Registrations

**Headers**:
```
Authorization: Bearer <student_token>
```

**Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "event": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "TechFest 2025",
        "date": "2025-03-15T00:00:00.000Z",
        "venue": "Main Auditorium"
      },
      "student": "507f1f77bcf86cd799439014",
      "registrationDate": "2025-02-12T10:00:00.000Z",
      "status": "registered"
    }
  ]
}
```

---

### Company Visits

#### POST `/api/company-visits` - Create Company Visit

**Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "companyName": "Google India",
  "jobRole": "Software Engineer",
  "description": "Google is hiring software engineers for their Bangalore office",
  "eligibility": {
    "department": ["CSE", "IT", "ECE"],
    "year": [4],
    "minCGPA": 7.5
  },
  "visitDate": "2025-04-20",
  "visitTime": "10:00 AM",
  "venue": "Placement Cell",
  "package": "18-25 LPA",
  "applicationDeadline": "2025-04-10",
  "contactPerson": {
    "name": "Dr. Placement Officer",
    "email": "placement@college.edu",
    "phone": "9876543210"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Company visit created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "companyName": "Google India",
    "jobRole": "Software Engineer",
    "description": "Google is hiring...",
    "eligibility": {
      "department": ["CSE", "IT", "ECE"],
      "year": [4],
      "minCGPA": 7.5
    },
    "visitDate": "2025-04-20T00:00:00.000Z",
    "visitTime": "10:00 AM",
    "venue": "Placement Cell",
    "package": "18-25 LPA",
    "applicationDeadline": "2025-04-10T00:00:00.000Z",
    "contactPerson": {
      "name": "Dr. Placement Officer",
      "email": "placement@college.edu",
      "phone": "9876543210"
    },
    "status": "scheduled",
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2025-02-12T10:00:00.000Z"
  }
}
```

---

## 6️⃣ Validation Rules

### User Model Validations

| Field | Validation Rules |
|-------|------------------|
| name | Required, Max 50 characters, Trimmed |
| email | Required, Unique, Lowercase, Valid email format |
| password | Required, Min 6 characters, Hashed before storage |
| role | Must be 'student' or 'admin', Default: 'student' |
| department | Required if role is 'student' |
| year | Required if role is 'student' |
| organization | Required if role is 'admin' |
| position | Required if role is 'admin' |

**Email Regex**: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`

---

### Event Model Validations

| Field | Validation Rules |
|-------|------------------|
| title | Required, Max 100 characters, Trimmed |
| description | Required, Max 1000 characters |
| category | Required, Must be one of: 'technical', 'cultural', 'sports', 'placement' |
| date | Required, Must be a valid date |
| time | Required |
| venue | Required, Trimmed |
| eligibility.department | Array, Must contain valid departments: 'All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other' |
| eligibility.year | Array of numbers, Default: [1, 2, 3, 4] |
| createdBy | Required, Must be valid User ObjectId |
| maxCapacity | Optional, Must be a number, null = unlimited |
| status | Must be one of: 'upcoming', 'ongoing', 'completed', 'cancelled' |

---

### Registration Model Validations

| Field | Validation Rules |
|-------|------------------|
| event | Required, Must be valid Event ObjectId |
| student | Required, Must be valid User ObjectId |
| status | Must be one of: 'registered', 'attended', 'cancelled' |
| feedback.rating | Optional, Min: 1, Max: 5 |
| feedback.comment | Optional, Max 500 characters |

**Unique Constraint**: Compound unique index on (event, student) - prevents duplicate registrations

---

### CompanyVisit Model Validations

| Field | Validation Rules |
|-------|------------------|
| companyName | Required, Max 100 characters, Trimmed |
| jobRole | Required, Trimmed |
| description | Required, Max 1000 characters |
| eligibility.department | Required, Array, Must contain valid departments |
| eligibility.year | Required, Array, Each year must be between 1-4 |
| eligibility.minCGPA | Optional, Min: 0, Max: 10, Default: 0 |
| visitDate | Required, Must be a valid date |
| visitTime | Required |
| venue | Required, Trimmed |
| createdBy | Required, Must be valid User ObjectId |
| status | Must be one of: 'scheduled', 'completed', 'cancelled' |

---

## 7️⃣ Middleware Logic

### Authentication Middleware (`protect`)

**Location**: `middleware/auth.js`

**Purpose**: Verify JWT token and authenticate users

**Flow**:
1. Extract token from `Authorization` header (format: `Bearer <token>`)
2. Check if token exists
3. Verify token using `JWT_SECRET`
4. Decode token to get user ID
5. Fetch user from database
6. Attach user to `req.user`
7. Call `next()` to proceed

**Error Responses**:
- No token: 401 "Not authorized to access this route. Please login."
- Invalid token: 401 "Not authorized. Token invalid or expired."
- User not found: 401 "User not found. Token invalid."

---

### Authorization Middleware (`authorize`)

**Location**: `middleware/auth.js`

**Purpose**: Check if user has required role

**Parameters**: `...roles` (array of allowed roles)

**Flow**:
1. Check if `req.user.role` is in allowed roles
2. If yes, call `next()`
3. If no, return 403 error

**Error Response**:
- Unauthorized role: 403 "User role '<role>' is not authorized to access this route"

---

### Error Handler Middleware

**Location**: `middleware/errorHandler.js`

**Purpose**: Centralized error handling for all routes

**Handles**:
1. **CastError** (Invalid ObjectId): 404 "Resource not found"
2. **Duplicate Key Error** (Code 11000): 400 "<field> already exists"
3. **ValidationError**: 400 with all validation error messages
4. **JsonWebTokenError**: 401 "Invalid token. Please login again."
5. **TokenExpiredError**: 401 "Token expired. Please login again."
6. **Generic Errors**: 500 "Server Error"

**Response Format**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Stack trace (only in development mode)"
}
```

---

### Password Hashing Middleware

**Location**: `models/User.js` (pre-save hook)

**Purpose**: Hash password before saving to database

**Flow**:
1. Check if password is modified
2. If not modified, skip hashing
3. Generate salt (10 rounds)
4. Hash password using bcrypt
5. Save hashed password

---

## 8️⃣ Suggested Frontend Form Fields

### Student Registration Form

**Required Fields**:
```javascript
{
  name: {
    type: 'text',
    required: true,
    maxLength: 50,
    placeholder: 'Full Name'
  },
  email: {
    type: 'email',
    required: true,
    pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    placeholder: 'Email Address'
  },
  password: {
    type: 'password',
    required: true,
    minLength: 6,
    placeholder: 'Password (min 6 characters)'
  },
  role: {
    type: 'hidden',
    value: 'student'
  },
  department: {
    type: 'select',
    required: true,
    options: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']
  },
  year: {
    type: 'select',
    required: true,
    options: ['1', '2', '3', '4']
  },
  interests: {
    type: 'multi-select',
    required: false,
    options: ['technical', 'cultural', 'sports', 'placement']
  }
}
```

---

### Admin Registration Form

**Required Fields**:
```javascript
{
  name: {
    type: 'text',
    required: true,
    maxLength: 50,
    placeholder: 'Full Name'
  },
  email: {
    type: 'email',
    required: true,
    placeholder: 'Email Address'
  },
  password: {
    type: 'password',
    required: true,
    minLength: 6,
    placeholder: 'Password (min 6 characters)'
  },
  role: {
    type: 'hidden',
    value: 'admin'
  },
  organization: {
    type: 'text',
    required: true,
    placeholder: 'College/Organization Name'
  },
  position: {
    type: 'text',
    required: true,
    placeholder: 'Position/Designation'
  }
}
```

---

### Login Form

**Required Fields**:
```javascript
{
  email: {
    type: 'email',
    required: true,
    placeholder: 'Email Address'
  },
  password: {
    type: 'password',
    required: true,
    placeholder: 'Password'
  }
}
```

---

### Create Event Form (Admin)

**Required Fields**:
```javascript
{
  title: {
    type: 'text',
    required: true,
    maxLength: 100,
    placeholder: 'Event Title'
  },
  description: {
    type: 'textarea',
    required: true,
    maxLength: 1000,
    placeholder: 'Event Description'
  },
  category: {
    type: 'select',
    required: true,
    options: ['technical', 'cultural', 'sports', 'placement']
  },
  date: {
    type: 'date',
    required: true
  },
  time: {
    type: 'time',
    required: true
  },
  venue: {
    type: 'text',
    required: true,
    placeholder: 'Event Venue'
  },
  'eligibility.department': {
    type: 'multi-select',
    required: false,
    default: ['All'],
    options: ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']
  },
  'eligibility.year': {
    type: 'multi-select',
    required: false,
    default: [1, 2, 3, 4],
    options: [1, 2, 3, 4]
  },
  maxCapacity: {
    type: 'number',
    required: false,
    placeholder: 'Maximum Capacity (leave empty for unlimited)'
  }
}
```

**Note**: Send as nested object:
```json
{
  "eligibility": {
    "department": ["CSE", "IT"],
    "year": [3, 4]
  }
}
```

---

### Create Company Visit Form (Admin)

**Required Fields**:
```javascript
{
  companyName: {
    type: 'text',
    required: true,
    maxLength: 100,
    placeholder: 'Company Name'
  },
  jobRole: {
    type: 'text',
    required: true,
    placeholder: 'Job Role/Position'
  },
  description: {
    type: 'textarea',
    required: true,
    maxLength: 1000,
    placeholder: 'Job Description'
  },
  'eligibility.department': {
    type: 'multi-select',
    required: true,
    options: ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']
  },
  'eligibility.year': {
    type: 'multi-select',
    required: true,
    options: [1, 2, 3, 4]
  },
  'eligibility.minCGPA': {
    type: 'number',
    required: false,
    min: 0,
    max: 10,
    step: 0.1,
    default: 0,
    placeholder: 'Minimum CGPA Required'
  },
  visitDate: {
    type: 'date',
    required: true
  },
  visitTime: {
    type: 'time',
    required: true
  },
  venue: {
    type: 'text',
    required: true,
    placeholder: 'Visit Venue'
  },
  package: {
    type: 'text',
    required: false,
    placeholder: 'Salary Package (e.g., 10-15 LPA)'
  },
  applicationDeadline: {
    type: 'date',
    required: false
  },
  'contactPerson.name': {
    type: 'text',
    required: false,
    placeholder: 'Contact Person Name'
  },
  'contactPerson.email': {
    type: 'email',
    required: false,
    placeholder: 'Contact Email'
  },
  'contactPerson.phone': {
    type: 'tel',
    required: false,
    placeholder: 'Contact Phone'
  }
}
```

**Note**: Send as nested objects:
```json
{
  "eligibility": {
    "department": ["CSE", "IT"],
    "year": [4],
    "minCGPA": 7.5
  },
  "contactPerson": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

---

### Event Registration Form (Student)

**Required Fields**:
```javascript
{
  eventId: {
    type: 'hidden',
    required: true,
    value: '<selected_event_id>'
  }
}
```

**Note**: This is typically a button click action, not a traditional form. The eventId is passed from the selected event.

---

### Add Feedback Form (Student)

**Required Fields**:
```javascript
{
  rating: {
    type: 'number',
    required: false,
    min: 1,
    max: 5,
    placeholder: 'Rate the event (1-5)'
  },
  comment: {
    type: 'textarea',
    required: false,
    maxLength: 500,
    placeholder: 'Your feedback (max 500 characters)'
  }
}
```

---

### Update Profile Form

**Required Fields**:
```javascript
{
  name: {
    type: 'text',
    required: false,
    maxLength: 50
  },
  email: {
    type: 'email',
    required: false
  },
  department: {
    type: 'select',
    required: false,
    options: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']
  },
  year: {
    type: 'select',
    required: false,
    options: ['1', '2', '3', '4']
  },
  interests: {
    type: 'multi-select',
    required: false,
    options: ['technical', 'cultural', 'sports', 'placement']
  }
}
```

---

### Update Password Form

**Required Fields**:
```javascript
{
  currentPassword: {
    type: 'password',
    required: true,
    placeholder: 'Current Password'
  },
  newPassword: {
    type: 'password',
    required: true,
    minLength: 6,
    placeholder: 'New Password (min 6 characters)'
  },
  confirmPassword: {
    type: 'password',
    required: true,
    minLength: 6,
    placeholder: 'Confirm New Password',
    validation: 'Must match newPassword'
  }
}
```

---

## 📊 Additional Information

### Environment Variables Required

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/college_events
JWT_SECRET=<your_secret_key>
JWT_EXPIRE=7d
```

---

### Common Response Patterns

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Stack trace (development only)"
}
```

---

### Pagination Response (for GET /events)

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [ /* array of results */ ]
}
```

---

### Authentication Header Format

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Admin and Student roles
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: Centralized error handler prevents information leakage
6. **CORS**: Enabled for cross-origin requests
7. **Unique Constraints**: Prevents duplicate registrations and users

---

## 📝 Notes for Frontend Developers

1. **Always send nested objects correctly**: 
   - ✅ `{ "eligibility": { "department": ["CSE"] } }`
   - ❌ `{ "eligibility": {}, "department": ["CSE"] }`

2. **Token Management**:
   - Store JWT token securely (localStorage/sessionStorage)
   - Include in Authorization header for protected routes
   - Handle token expiration (7 days default)

3. **Error Handling**:
   - Check `success` field in response
   - Display `message` field to users
   - Handle 401 errors (redirect to login)
   - Handle 403 errors (show unauthorized message)

4. **Form Validation**:
   - Implement client-side validation matching backend rules
   - Show user-friendly error messages
   - Validate email format before submission
   - Check password length (min 6 characters)

5. **Role-Based UI**:
   - Show/hide features based on user role
   - Admin: Can create/edit/delete events and company visits
   - Student: Can register for events, view company visits

6. **Date Handling**:
   - Send dates in ISO format: `YYYY-MM-DD`
   - Backend stores as Date objects
   - Display dates in user-friendly format

---

**End of Documentation**

*This documentation is auto-generated from the backend codebase. For any discrepancies, refer to the actual code.*
