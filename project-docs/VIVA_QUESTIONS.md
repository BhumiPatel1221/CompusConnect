# Viva Questions & Answers

## Project Overview Questions

### Q1: What is the purpose of this project?
**Answer:** This is a backend API for a College Event Management System that allows:
- Students to view and register for events
- Admins to create and manage events
- Students to get personalized event recommendations
- Management of company visits for placements
- Role-based access control with JWT authentication

### Q2: What technologies did you use and why?
**Answer:**
- **Node.js**: JavaScript runtime for building scalable server-side applications
- **Express.js**: Web framework for creating RESTful APIs easily
- **MongoDB**: NoSQL database for flexible document storage
- **Mongoose**: ODM for MongoDB, provides schema validation
- **JWT**: Stateless authentication, scalable for distributed systems
- **bcryptjs**: Industry-standard password hashing algorithm

---

## Authentication & Security

### Q3: How does JWT authentication work in your project?
**Answer:**
1. User logs in with email and password
2. Server verifies credentials against database
3. If valid, server generates JWT token containing user ID
4. Token is signed with secret key from .env file
5. Token sent to client with 7-day expiration
6. Client includes token in Authorization header for protected routes
7. Middleware verifies token and extracts user information
8. User is authenticated and request proceeds

### Q4: Why did you use bcrypt for password hashing?
**Answer:**
- Bcrypt is specifically designed for password hashing
- Uses salt to prevent rainbow table attacks
- Computationally expensive, prevents brute force attacks
- Adaptive - can increase difficulty as hardware improves
- We use 10 salt rounds for balance between security and performance

### Q5: How do you implement role-based access control?
**Answer:**
We have two middleware functions:
1. **protect**: Verifies JWT token and authenticates user
2. **authorize**: Checks if user has required role (admin/student)

Example:
```javascript
router.post('/events', protect, authorize('admin'), createEvent);
```
This ensures only authenticated admins can create events.

### Q6: What security measures have you implemented?
**Answer:**
1. Password hashing with bcrypt
2. JWT token with expiration
3. Role-based authorization
4. Input validation using Mongoose schemas
5. CORS enabled for cross-origin requests
6. Password field excluded from queries by default
7. Environment variables for sensitive data

---

## Database & Models

### Q7: Explain your database schema design
**Answer:**
We have 4 main models:

1. **User**: Stores student/admin information with hashed passwords
2. **Event**: Stores event details with eligibility criteria
3. **Registration**: Links students to events, prevents duplicates
4. **CompanyVisit**: Stores placement opportunities

Relationships:
- User → Events (one admin creates many events)
- User → Registrations (one student has many registrations)
- Event → Registrations (one event has many registrations)

### Q8: How do you prevent duplicate registrations?
**Answer:**
We use a compound unique index(combination of one oe more feild=>compund index) on the Registration schema:
```javascript
registrationSchema.index({ event: 1, student: 1 }, { unique: true });
```
This ensures a student can register for an event only once. MongoDB enforces this at the database level. If duplicate is attempted, we catch the error (code 11000) and return a user-friendly message.

### Q9: What are Mongoose middleware and how did you use them?
**Answer:**
Mongoose middleware are functions that run at specific stages of document lifecycle.

We used a **pre-save hook** in the User model:
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
This automatically hashes the password before saving to database.

---

## API Design

### Q10: Explain the MVC pattern in your project
**Answer:**
- **Model**: Database schemas (User, Event, Registration, CompanyVisit)
- **View**: JSON responses (we don't have traditional views)
- **Controller**: Business logic (authController, eventController, etc.)
- **Routes**: Map URLs to controllers

This separation makes code maintainable and testable.

### Q11: How does error handling work?
**Answer:**
We have centralized error handling middleware that catches all errors:

1. Mongoose validation errors → 400 Bad Request
2. Duplicate key errors → 400 with friendly message
3. Invalid ObjectId → 404 Not Found
4. JWT errors → 401 Unauthorized
5. All other errors → 500 Server Error

All errors return consistent JSON format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Q12: What is the difference between authentication and authorization?
**Answer:**
- **Authentication**: Verifying WHO you are (login with credentials)
- **Authorization**: Verifying WHAT you can do (checking permissions)

In our project:
- Authentication: `protect` middleware verifies JWT token
- Authorization: `authorize` middleware checks user role

---

## Features & Functionality

### Q13: How does the event recommendation system work?
**Answer:**
The recommendation algorithm:
1. Gets student's interests, department, and year
2. Queries events where:
   - Category matches student's interests
   - Department eligibility includes student's department or "All"
   - Year eligibility includes student's year
   - Status is "upcoming" and date is in future
3. Sorts by date (ascending)
4. Returns top 10 matches

This provides personalized recommendations based on student profile.

### Q14: Explain the event registration flow
**Answer:**
1. Student sends eventId in request
2. System validates:
   - Event exists and is upcoming
   - Student's department is eligible
   - Student's year is eligible
   - No duplicate registration exists
   - Event capacity not exceeded
3. Creates registration record
4. Increments event's registrationCount
5. Returns success response

If any validation fails, appropriate error is returned.

### Q15: What is the purpose of the CompanyVisit module?
**Answer:**
The CompanyVisit module manages campus placement activities:
- Admins can add company visit details
- Includes eligibility criteria (department, year, CGPA)
- Students can view eligible opportunities
- Stores job role, package, contact information
- Helps students find relevant placement opportunities

---

## Technical Implementation

### Q16: Why use local MongoDB instead of MongoDB Atlas?
**Answer:**
For this project, local MongoDB is preferred because:
1. No internet dependency during development
2. Faster response times (no network latency)
3. Complete control over database
4. Easy to demonstrate in viva/presentation
5. No cloud service costs
6. Can view data easily in MongoDB Compass

### Q17: What is the purpose of environment variables?
**Answer:**
Environment variables (.env file) store configuration that:
1. Varies between environments (dev/production)
2. Contains sensitive data (JWT secret, database credentials)
3. Should not be committed to version control
4. Can be changed without modifying code

Examples: PORT, MONGODB_URI, JWT_SECRET

### Q18: How do you handle asynchronous operations?
**Answer:**
We use async/await for all database operations:
```javascript
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email });
    // ... rest of logic
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```
This makes asynchronous code look synchronous and easier to read.

### Q19: What is CORS and why did you enable it?
**Answer:**
CORS (Cross-Origin Resource Sharing) allows frontend applications from different origins to access our API.

Without CORS, a frontend running on `http://localhost:3000` cannot access our API on `http://localhost:5000` due to browser security.

We enabled it using:
```javascript
app.use(cors());
```

### Q20: Explain the difference between PUT and DELETE requests
**Answer:**
- **PUT**: Update existing resource (e.g., update event details)
- **DELETE**: Remove resource (e.g., delete event)

Both are idempotent - multiple identical requests have same effect as single request.

---

## Project Management

### Q21: How would you deploy this to production?
**Answer:**
1. Change JWT_SECRET to strong random string
2. Set NODE_ENV to 'production'
3. Use production MongoDB (Atlas or dedicated server)
4. Enable HTTPS
5. Set up proper CORS origins (not allow all)
6. Add rate limiting to prevent abuse
7. Set up logging and monitoring
8. Enable MongoDB authentication
9. Use process manager like PM2
10. Deploy to cloud platform (AWS, Heroku, DigitalOcean)

### Q22: What improvements would you make?
**Answer:**
1. Email notifications for registrations
2. File upload for event posters
3. QR code for event check-in
4. Real-time notifications using WebSockets
5. Analytics dashboard for admins
6. Advanced search and filtering
7. Attendance tracking
8. Certificate generation
9. Payment integration for paid events
10. Mobile app integration

### Q23: How did you test your API?
**Answer:**
1. Used Postman for manual testing
2. Tested all endpoints (auth, events, registrations, company visits)
3. Tested different user roles (student, admin)
4. Tested error scenarios (invalid data, unauthorized access)
5. Verified database changes in MongoDB Compass
6. Tested edge cases (duplicate registrations, capacity limits)

---

## Code Quality

### Q24: What coding best practices did you follow?
**Answer:**
1. **Separation of Concerns**: MVC pattern
2. **DRY Principle**: Reusable utility functions
3. **Error Handling**: Centralized error handler
4. **Security**: Password hashing, JWT, validation
5. **Code Organization**: Modular file structure
6. **Documentation**: Comments explaining logic
7. **Naming Conventions**: Descriptive variable/function names
8. **Environment Variables**: Sensitive data not hardcoded

### Q25: Why use Mongoose instead of native MongoDB driver?
**Answer:**
Mongoose provides:
1. **Schema validation**: Ensures data consistency
2. **Middleware**: Pre/post hooks for operations
3. **Type casting**: Automatic data type conversion
4. **Query building**: Easier and more readable queries
5. **Population**: Easy relationship handling
6. **Plugins**: Reusable functionality
7. **Better developer experience**: More intuitive API

---

## Bonus Questions

### Q26: What is the difference between SQL and NoSQL?
**Answer:**
**SQL (MySQL, PostgreSQL)**:
- Structured, table-based
- Fixed schema
- ACID compliant
- Good for complex relationships

**NoSQL (MongoDB)**:
- Document-based, flexible
- Dynamic schema
- Horizontally scalable
- Good for rapid development

We chose MongoDB for flexibility and ease of use.

### Q27: What is REST API?
**Answer:**
REST (Representational State Transfer) is an architectural style for APIs:
- Uses HTTP methods (GET, POST, PUT, DELETE)
- Stateless (each request independent)
- Resource-based URLs
- Returns JSON/XML data

Our API follows REST principles with endpoints like:
- GET /api/events (get all)
- POST /api/events (create)
- PUT /api/events/:id (update)
- DELETE /api/events/:id (delete)

### Q28: What happens when server restarts?
**Answer:**
- All active JWT tokens remain valid (they're stateless)
- Database data persists (stored in MongoDB)
- Server reconnects to MongoDB
- All routes and middleware reload
- Active connections are lost (users need to reconnect)

---

## Preparation Tips

1. **Understand the flow**: Know how a request travels from client to database and back
2. **Know your code**: Be able to explain any file you created
3. **Practice explaining**: Use simple language, avoid jargon
4. **Be honest**: If you don't know something, say so
5. **Show enthusiasm**: Demonstrate your learning and interest

Good luck with your viva! 🎓
