# College Event Management System - Technical Documentation

## 📖 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Security Implementation](#security-implementation)
6. [Error Handling](#error-handling)
7. [Code Explanation](#code-explanation)

---

## 1. Project Overview

### Purpose
This backend system manages college events, student registrations, and company placement visits with role-based access control.

### Key Features
- JWT-based authentication
- Role-based authorization (Student/Admin)
- Event management with eligibility criteria
- Automated event recommendations
- Company visit management
- Registration tracking with feedback

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Local)
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcryptjs
- **CORS:** cors middleware

---

## 2. Architecture

### MVC Pattern
The project follows the Model-View-Controller (MVC) pattern:

```
├── Models (Database Schemas)
│   ├── User.js
│   ├── Event.js
│   ├── Registration.js
│   └── CompanyVisit.js
│
├── Controllers (Business Logic)
│   ├── authController.js
│   ├── eventController.js
│   ├── registrationController.js
│   └── companyVisitController.js
│
└── Routes (API Endpoints)
    ├── authRoutes.js
    ├── eventRoutes.js
    ├── registrationRoutes.js
    └── companyVisitRoutes.js
```

### Request Flow
```
Client Request
    ↓
Express Router
    ↓
Middleware (auth, validation)
    ↓
Controller (business logic)
    ↓
Model (database operations)
    ↓
Response to Client
```

---

## 3. Database Schema

### User Schema
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  role: String (enum: ['student', 'admin']),
  department: String (enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']),
  year: Number (1-4),
  interests: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** email (unique)

**Middleware:** 
- Pre-save hook to hash password using bcrypt
- Method to compare passwords

---

### Event Schema
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 1000 chars),
  category: String (enum: ['technical', 'cultural', 'sports', 'placement']),
  date: Date (required),
  time: String (required),
  venue: String (required),
  eligibility: {
    department: [String],
    year: [Number]
  },
  createdBy: ObjectId (ref: 'User'),
  registrationCount: Number (default: 0),
  maxCapacity: Number (nullable),
  status: String (enum: ['upcoming', 'ongoing', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** 
- Compound index on (category, date)

**Relationships:**
- createdBy → User (Admin)

---

### Registration Schema
```javascript
{
  event: ObjectId (ref: 'Event', required),
  student: ObjectId (ref: 'User', required),
  registrationDate: Date (default: now),
  status: String (enum: ['registered', 'attended', 'cancelled']),
  feedback: {
    rating: Number (1-5),
    comment: String (max 500 chars)
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound unique index on (event, student) - prevents duplicate registrations
- Single index on student
- Single index on event

**Relationships:**
- event → Event
- student → User (Student)

---

### CompanyVisit Schema
```javascript
{
  companyName: String (required, max 100 chars),
  jobRole: String (required),
  description: String (required, max 1000 chars),
  eligibility: {
    department: [String],
    year: [Number],
    minCGPA: Number (0-10)
  },
  visitDate: Date (required),
  visitTime: String (required),
  venue: String (required),
  package: String,
  applicationDeadline: Date,
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  createdBy: ObjectId (ref: 'User'),
  status: String (enum: ['scheduled', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Single index on visitDate
- Single index on companyName

**Relationships:**
- createdBy → User (Admin)

---

## 4. API Documentation

### Authentication Flow

#### Registration
1. Client sends user data
2. Server validates data
3. Password is hashed using bcrypt (10 salt rounds)
4. User is saved to database
5. JWT token is generated
6. Token and user data returned

#### Login
1. Client sends email and password
2. Server finds user by email (including password field)
3. Password is compared using bcrypt
4. If valid, JWT token is generated
5. Token and user data returned

#### Protected Routes
1. Client sends request with Authorization header
2. Middleware extracts token from "Bearer <token>"
3. Token is verified using JWT_SECRET
4. User is fetched from database
5. User object attached to req.user
6. Request proceeds to controller

---

## 5. Security Implementation

### Password Security
```javascript
// Hashing (in User model pre-save hook)
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);

// Verification (in User model method)
return await bcrypt.compare(enteredPassword, this.password);
```

### JWT Token
```javascript
// Generation
const token = jwt.sign({ id: user._id }, JWT_SECRET, {
  expiresIn: '7d'
});

// Verification
const decoded = jwt.verify(token, JWT_SECRET);
```

### Authorization Levels
1. **Public Routes:** No authentication required
   - GET /api/events
   - GET /api/company-visits
   - POST /api/auth/register
   - POST /api/auth/login

2. **Protected Routes:** Authentication required
   - GET /api/auth/me
   - PUT /api/auth/updateprofile

3. **Student-Only Routes:** Student role required
   - POST /api/registrations
   - GET /api/registrations/my-registrations
   - GET /api/events/recommendations/me

4. **Admin-Only Routes:** Admin role required
   - POST /api/events
   - PUT /api/events/:id
   - DELETE /api/events/:id
   - POST /api/company-visits

---

## 6. Error Handling

### Centralized Error Handler
The `errorHandler` middleware catches all errors and formats them consistently:

```javascript
// Mongoose CastError (Invalid ObjectId)
if (err.name === 'CastError') {
  return { message: 'Resource not found', statusCode: 404 };
}

// Duplicate Key Error
if (err.code === 11000) {
  return { message: 'Field already exists', statusCode: 400 };
}

// Validation Error
if (err.name === 'ValidationError') {
  return { message: 'Validation failed', statusCode: 400 };
}

// JWT Errors
if (err.name === 'JsonWebTokenError') {
  return { message: 'Invalid token', statusCode: 401 };
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (development only)"
}
```

---

## 7. Code Explanation

### Authentication Middleware (`middleware/auth.js`)

#### protect Middleware
**Purpose:** Verify JWT token and authenticate user

**Process:**
1. Extract token from Authorization header
2. Verify token using JWT_SECRET
3. Decode token to get user ID
4. Fetch user from database
5. Attach user to request object
6. Proceed to next middleware

**Usage:**
```javascript
router.get('/protected', protect, controller);
```

#### authorize Middleware
**Purpose:** Check if user has required role

**Process:**
1. Check if user's role is in allowed roles
2. If yes, proceed
3. If no, return 403 Forbidden

**Usage:**
```javascript
router.post('/admin-only', protect, authorize('admin'), controller);
```

---

### Event Controller (`controllers/eventController.js`)

#### getRecommendedEvents
**Purpose:** Get personalized event recommendations for student

**Algorithm:**
1. Get current user's interests, department, and year
2. Query events where:
   - Category matches user's interests
   - Department eligibility includes user's department or 'All'
   - Year eligibility includes user's year
   - Status is 'upcoming'
   - Date is in the future
3. Sort by date (ascending)
4. Limit to 10 results
5. Return recommended events

**Example:**
```javascript
// Student: CSE, Year 3, Interests: ['technical', 'placement']
// Will get: Technical and placement events for CSE or All departments, Year 3
```

---

### Registration Controller (`controllers/registrationController.js`)

#### registerForEvent
**Purpose:** Register student for an event with validation

**Validation Checks:**
1. Event exists
2. Event status is 'upcoming'
3. Student's department matches eligibility
4. Student's year matches eligibility
5. No duplicate registration exists
6. Event capacity not exceeded

**Process:**
1. Validate all conditions
2. Create registration record
3. Increment event's registrationCount
4. Return success response

**Duplicate Prevention:**
```javascript
// Compound unique index in schema
registrationSchema.index({ event: 1, student: 1 }, { unique: true });
```

---

### Password Hashing (`models/User.js`)

#### Pre-save Hook
**Purpose:** Hash password before saving to database

```javascript
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generate salt (10 rounds)
  const salt = await bcrypt.genSalt(10);
  
  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});
```

**Why 10 rounds?**
- Balance between security and performance
- Higher rounds = more secure but slower
- 10 rounds is industry standard

---

## 8. Database Relationships

### One-to-Many Relationships

#### User → Events
- One admin can create many events
- Stored as `createdBy` field in Event schema

#### User → Registrations
- One student can have many registrations
- Stored as `student` field in Registration schema

#### Event → Registrations
- One event can have many registrations
- Stored as `event` field in Registration schema

### Querying with Population

```javascript
// Get event with creator details
const event = await Event.findById(id).populate('createdBy', 'name email');

// Get registration with event and student details
const registration = await Registration.findById(id)
  .populate('event')
  .populate('student', 'name email department');
```

---

## 9. Best Practices Implemented

### 1. Environment Variables
- Sensitive data (JWT_SECRET, DB_URI) in .env
- Never commit .env to version control

### 2. Password Security
- Never store plain text passwords
- Use bcrypt for hashing
- Password field excluded from queries by default

### 3. Input Validation
- Mongoose schema validation
- Email format validation
- Enum validation for specific fields

### 4. Error Handling
- Centralized error handler
- Consistent error response format
- Proper HTTP status codes

### 5. Code Organization
- Separation of concerns (MVC pattern)
- Modular code structure
- Reusable utility functions

### 6. Database Optimization
- Indexes on frequently queried fields
- Compound indexes for complex queries
- Pagination for large datasets

### 7. Security
- JWT token expiration
- Role-based access control
- CORS enabled for cross-origin requests

---

## 10. Common Interview Questions & Answers

### Q1: How does JWT authentication work?
**Answer:** 
1. User logs in with credentials
2. Server verifies credentials
3. Server generates JWT token containing user ID
4. Token is signed with secret key
5. Token sent to client
6. Client includes token in subsequent requests
7. Server verifies token signature and extracts user ID
8. User is authenticated

### Q2: Why use bcrypt for password hashing?
**Answer:**
- Bcrypt is designed for password hashing
- Uses salt to prevent rainbow table attacks
- Computationally expensive (prevents brute force)
- Adaptive - can increase rounds as hardware improves

### Q3: How do you prevent duplicate registrations?
**Answer:**
- Compound unique index on (event, student)
- MongoDB enforces uniqueness at database level
- If duplicate attempted, returns error code 11000
- Error handler catches and returns user-friendly message

### Q4: Explain the middleware execution order
**Answer:**
```
Request → CORS → JSON Parser → Router → protect → authorize → Controller
```

### Q5: How does the recommendation system work?
**Answer:**
- Matches event category with student interests
- Filters by department and year eligibility
- Only shows upcoming events
- Sorts by date
- Returns top 10 matches

---

## 11. Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV to 'production'
- [ ] Update MongoDB connection for production
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Add input sanitization
- [ ] Enable MongoDB authentication
- [ ] Set up backup strategy

---

## 12. Future Enhancements

Possible improvements:
1. Email notifications for event registrations
2. QR code for event check-in
3. Analytics dashboard for admins
4. File upload for event posters
5. Real-time notifications using WebSockets
6. Advanced search and filtering
7. Event calendar integration
8. Attendance tracking with geolocation
9. Certificate generation
10. Payment integration for paid events

---

## 13. Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB service is running
- Verify connection string in .env
- Check firewall settings

### JWT Token Invalid
- Check if JWT_SECRET matches
- Verify token hasn't expired
- Ensure token format is "Bearer <token>"

### Duplicate Key Error
- User with email already exists
- Student already registered for event
- Check unique indexes

### Validation Error
- Check required fields
- Verify enum values
- Check data types

---

This documentation should help you understand and explain the entire backend system during your viva or project presentation!
