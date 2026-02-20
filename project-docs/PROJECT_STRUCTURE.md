# Project Structure

```
college-event-management-backend/
│
├── config/
│   └── db.js                          # MongoDB connection configuration
│
├── models/
│   ├── User.js                        # User model (Student/Admin)
│   ├── Event.js                       # Event model
│   ├── Registration.js                # Registration model
│   └── CompanyVisit.js                # Company visit model
│
├── controllers/
│   ├── authController.js              # Authentication logic
│   ├── eventController.js             # Event CRUD operations
│   ├── registrationController.js      # Registration management
│   └── companyVisitController.js      # Company visit management
│
├── routes/
│   ├── authRoutes.js                  # Auth API routes
│   ├── eventRoutes.js                 # Event API routes
│   ├── registrationRoutes.js          # Registration API routes
│   └── companyVisitRoutes.js          # Company visit API routes
│
├── middleware/
│   ├── auth.js                        # JWT authentication & authorization
│   └── errorHandler.js                # Centralized error handling
│
├── utils/
│   └── jwtToken.js                    # JWT token utilities
│
├── .env                               # Environment variables
├── .gitignore                         # Git ignore rules
├── server.js                          # Main application entry point
├── package.json                       # Dependencies and scripts
├── README.md                          # Project documentation
├── POSTMAN_REQUESTS.md                # API testing guide
├── DOCUMENTATION.md                   # Technical documentation
└── PROJECT_STRUCTURE.md               # This file
```

## File Descriptions

### Configuration Files

- **`.env`**: Contains environment variables (PORT, MongoDB URI, JWT secret)
- **`config/db.js`**: MongoDB connection logic with error handling

### Models (Database Schemas)

- **`User.js`**: User schema with password hashing and validation
- **`Event.js`**: Event schema with eligibility criteria
- **`Registration.js`**: Registration schema with unique constraint
- **`CompanyVisit.js`**: Company visit schema for placements

### Controllers (Business Logic)

- **`authController.js`**: Register, login, profile management
- **`eventController.js`**: Event CRUD, recommendations
- **`registrationController.js`**: Event registration, feedback
- **`companyVisitController.js`**: Company visit CRUD, eligibility

### Routes (API Endpoints)

- **`authRoutes.js`**: `/api/auth/*` endpoints
- **`eventRoutes.js`**: `/api/events/*` endpoints
- **`registrationRoutes.js`**: `/api/registrations/*` endpoints
- **`companyVisitRoutes.js`**: `/api/company-visits/*` endpoints

### Middleware

- **`auth.js`**: JWT verification and role-based authorization
- **`errorHandler.js`**: Catches and formats all errors

### Utilities

- **`jwtToken.js`**: Token generation and response helpers

### Documentation

- **`README.md`**: Installation and usage guide
- **`POSTMAN_REQUESTS.md`**: Sample API requests
- **`DOCUMENTATION.md`**: Technical documentation for viva

## Total Files Created: 24

## Lines of Code: ~2500+
