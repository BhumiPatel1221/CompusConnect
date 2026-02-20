# System Architecture Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Postman/Frontend)                │
│                     HTTP Requests with JSON                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                           │
│                      (Port 5000)                                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                      │   │
│  │  • CORS (Cross-Origin Resource Sharing)                 │   │
│  │  • JSON Parser (express.json())                         │   │
│  │  • URL Encoded Parser                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ROUTER LAYER                          │   │
│  │  • /api/auth          → authRoutes.js                   │   │
│  │  • /api/events        → eventRoutes.js                  │   │
│  │  • /api/registrations → registrationRoutes.js           │   │
│  │  • /api/company-visits→ companyVisitRoutes.js           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AUTHENTICATION MIDDLEWARE                   │   │
│  │  • protect()    - Verify JWT Token                      │   │
│  │  • authorize()  - Check User Role                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CONTROLLER LAYER                       │   │
│  │  • authController.js      - Auth logic                  │   │
│  │  • eventController.js     - Event logic                 │   │
│  │  • registrationController.js - Registration logic       │   │
│  │  • companyVisitController.js - Company visit logic      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     MODEL LAYER                          │   │
│  │  • User.js           - User schema + methods            │   │
│  │  • Event.js          - Event schema                     │   │
│  │  • Registration.js   - Registration schema              │   │
│  │  • CompanyVisit.js   - Company visit schema             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 ERROR HANDLER MIDDLEWARE                 │   │
│  │  • Catches all errors                                   │   │
│  │  • Formats error responses                              │   │
│  │  • Returns consistent JSON                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│                  (Local: 127.0.0.1:27017)                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    users     │  │    events    │  │ registrations│          │
│  │ collection   │  │  collection  │  │  collection  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                               │
│  │companyvisits │                                               │
│  │  collection  │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### Example: Student Registers for Event

```
1. CLIENT
   │
   │ POST /api/registrations
   │ Headers: { Authorization: "Bearer <token>" }
   │ Body: { eventId: "..." }
   │
   ▼
2. EXPRESS SERVER
   │
   │ Receives request
   │
   ▼
3. MIDDLEWARE
   │
   │ • Parse JSON body
   │ • Enable CORS
   │
   ▼
4. ROUTER
   │
   │ Match route: POST /api/registrations
   │ → registrationRoutes.js
   │
   ▼
5. AUTH MIDDLEWARE
   │
   │ protect() → Verify JWT token
   │           → Extract user from token
   │           → Attach user to req.user
   │
   │ authorize('student') → Check if role = 'student'
   │
   ▼
6. CONTROLLER
   │
   │ registrationController.registerForEvent()
   │
   │ • Get eventId from req.body
   │ • Get studentId from req.user.id
   │ • Validate event exists
   │ • Check eligibility (department, year)
   │ • Check for duplicate registration
   │ • Check capacity
   │
   ▼
7. MODEL
   │
   │ Registration.create({ event, student })
   │ Event.findByIdAndUpdate() → increment count
   │
   ▼
8. DATABASE
   │
   │ • Insert registration document
   │ • Update event document
   │ • Return saved data
   │
   ▼
9. CONTROLLER
   │
   │ Format response
   │
   ▼
10. CLIENT
    │
    │ Receive response:
    │ {
    │   "success": true,
    │   "message": "Successfully registered",
    │   "data": { ... }
    │ }
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│   Register   │
└──────┬───────┘
       │
       │ 1. Send: { email, password, ... }
       │
       ▼
┌─────────────────────────────────────┐
│  authController.register()          │
│                                     │
│  1. Check if email exists           │
│  2. Create user (password auto-     │
│     hashed by pre-save hook)        │
│  3. Generate JWT token              │
│  4. Return token + user data        │
└──────┬──────────────────────────────┘
       │
       │ Response: { token, user }
       │
       ▼
┌──────────────┐
│    Client    │
│  Saves Token │
└──────┬───────┘
       │
       │ For subsequent requests:
       │ Authorization: Bearer <token>
       │
       ▼
┌─────────────────────────────────────┐
│  protect() middleware               │
│                                     │
│  1. Extract token from header       │
│  2. Verify token with JWT_SECRET    │
│  3. Decode to get user ID           │
│  4. Fetch user from database        │
│  5. Attach user to req.user         │
│  6. Call next()                     │
└─────────────────────────────────────┘
```

---

## 📊 Database Relationships

```
┌─────────────────────┐
│       User          │
│  (Student/Admin)    │
│                     │
│  _id (ObjectId)     │
│  name               │
│  email              │
│  password (hashed)  │
│  role               │
│  department         │
│  year               │
│  interests[]        │
└──────┬──────────────┘
       │
       │ createdBy (Admin creates Events)
       │
       ▼
┌─────────────────────┐
│       Event         │
│                     │
│  _id (ObjectId)     │
│  title              │
│  description        │
│  category           │
│  date               │
│  eligibility        │
│  createdBy ────────────┐
│  registrationCount  │  │
└──────┬──────────────┘  │
       │                 │
       │ event           │ References User
       │                 │
       ▼                 │
┌─────────────────────┐  │
│   Registration      │  │
│                     │  │
│  _id (ObjectId)     │  │
│  event ─────────────┘  │
│  student ──────────────┤
│  status             │  │
│  feedback           │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│   CompanyVisit      │  │
│                     │  │
│  _id (ObjectId)     │  │
│  companyName        │  │
│  jobRole            │  │
│  eligibility        │  │
│  createdBy ─────────────┘
└─────────────────────┘
```

---

## 🛡️ Security Layers

```
┌────────────────────────────────────────────┐
│         Layer 1: Network Security          │
│  • CORS enabled                            │
│  • HTTPS (in production)                   │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│      Layer 2: Authentication               │
│  • JWT token verification                  │
│  • Token expiration (7 days)               │
│  • Secret key signing     
    1. Server signs the token using a secret key
    2. Token is sent to client
    3. On every request, server verifies the signature using the same secret key                 │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│       Layer 3: Authorization               │
│  • Role-based access control               │
│  • Student vs Admin permissions            │
│  • Resource ownership verification         │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│        Layer 4: Data Security              │
│  • Password hashing (bcrypt)               │
│  • Password field excluded from queries    │
│  • Input validation (Mongoose)             │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│      Layer 5: Database Security            │
│  • Unique indexes                          │
│  • Schema validation                       │
│  • Relationship integrity                  │
└────────────────────────────────────────────┘
```

---

## 📁 File Organization

```
college-event-management-backend/
│
├── 🔧 Configuration
│   ├── .env                    → Environment variables
│   ├── config/db.js            → MongoDB connection
│   └── server.js               → App initialization
│
├── 🗄️ Data Layer
│   └── models/
│       ├── User.js             → User schema
│       ├── Event.js            → Event schema
│       ├── Registration.js     → Registration schema
│       └── CompanyVisit.js     → Company visit schema
│
├── 🎮 Business Logic
│   └── controllers/
│       ├── authController.js
│       ├── eventController.js
│       ├── registrationController.js
│       └── companyVisitController.js
│
├── 🛣️ API Routes
│   └── routes/
│       ├── authRoutes.js
│       ├── eventRoutes.js
│       ├── registrationRoutes.js
│       └── companyVisitRoutes.js
│
├── 🛡️ Security
│   └── middleware/
│       ├── auth.js             → JWT verification
│       └── errorHandler.js     → Error handling
│
├── 🔧 Utilities
│   └── utils/
│       └── jwtToken.js         → Token generation
│
└── 📚 Documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── POSTMAN_REQUESTS.md
    ├── DOCUMENTATION.md
    ├── VIVA_QUESTIONS.md
    ├── TESTING_CHECKLIST.md
    ├── ARCHITECTURE.md         → This file
    └── SUMMARY.md
```

---

## 🔄 Data Flow Examples

### Example 1: Create Event (Admin)
```
Admin → POST /api/events
        ↓
    protect() → Verify token
        ↓
    authorize('admin') → Check role
        ↓
    eventController.createEvent()
        ↓
    Event.create() → Save to DB
        ↓
    Response: { success: true, data: event }
```

### Example 2: Get Recommendations (Student)
```
Student → GET /api/events/recommendations/me
          ↓
      protect() → Verify token
          ↓
      authorize('student') → Check role
          ↓
      eventController.getRecommendedEvents()
          ↓
      Query: category IN interests
             department IN eligibility
             year IN eligibility
          ↓
      Response: { success: true, data: [events] }
```

---

This architecture ensures:
✅ Separation of concerns(MVC)
✅ Scalability(add new feature-->does't effect any module)
✅ Security(JWT)
✅ Maintainability(debug,update code logic)
✅ Testability(postman)

<!-- 👉 Scalability is NOT only about handling more user requests.

Scalability means the system can grow in multiple ways without breaking. -->
<!-- Modular folders → feature scalability
JWT (stateless) → user/load scalability
MongoDB → data scalability
Clear separation → team scalability -->