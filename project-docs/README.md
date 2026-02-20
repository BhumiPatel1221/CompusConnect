# College Event Management System - Backend API

A production-ready backend API for managing college events, student registrations, and company placement visits.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Event Management**: Create, update, delete, and view events
- **Event Registration**: Students can register for events with eligibility checking
- **Personalized Recommendations**: AI-powered event recommendations based on student interests
- **Company Visits Module**: Manage company visits and placement opportunities
- **Secure Password Hashing**: Using bcrypt for password security
- **MongoDB Local Database**: Uses local MongoDB instance

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** installed locally
- **MongoDB Compass** (optional, for database visualization)

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd college-event-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - The `.env` file is already created with default values
   - Update `JWT_SECRET` with a secure random string for production

4. **Start MongoDB service**
   - Make sure MongoDB is running on your local machine
   - Default connection: `mongodb://127.0.0.1:27017/college_events_db`

## 🏃 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
college-event-management-backend/
│
├── config/
│   └── db.js                 # MongoDB connection configuration
│
├── models/
│   ├── User.js               # User schema (Student/Admin)
│   ├── Event.js              # Event schema
│   ├── Registration.js       # Registration schema
│   └── CompanyVisit.js       # Company visit schema
│
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── eventController.js    # Event management logic
│   ├── registrationController.js  # Registration logic
│   └── companyVisitController.js  # Company visit logic
│
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── eventRoutes.js        # Event endpoints
│   ├── registrationRoutes.js # Registration endpoints
│   └── companyVisitRoutes.js # Company visit endpoints
│
├── middleware/
│   ├── auth.js               # JWT verification & authorization
│   └── errorHandler.js       # Centralized error handling
│
├── utils/
│   └── jwtToken.js           # JWT token generation utilities
│
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── server.js                # Main application entry point
└── package.json             # Project dependencies
```

## 🔐 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updateprofile` - Update profile (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Events (`/api/events`)
- `GET /api/events` - Get all events (Public)
- `GET /api/events/:id` - Get single event (Public)
- `GET /api/events/recommendations/me` - Get recommended events (Student)
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Registrations (`/api/registrations`)
- `POST /api/registrations` - Register for event (Student)
- `GET /api/registrations/my-registrations` - Get my registrations (Student)
- `DELETE /api/registrations/:id` - Cancel registration (Student)
- `PUT /api/registrations/:id/feedback` - Add feedback (Student)
- `GET /api/registrations/event/:eventId` - Get event registrations (Admin)
- `PUT /api/registrations/:id/status` - Update status (Admin)

### Company Visits (`/api/company-visits`)
- `GET /api/company-visits` - Get all company visits (Public)
- `GET /api/company-visits/:id` - Get single company visit (Public)
- `GET /api/company-visits/eligible/me` - Get eligible visits (Student)
- `POST /api/company-visits` - Create company visit (Admin)
- `PUT /api/company-visits/:id` - Update company visit (Admin)
- `DELETE /api/company-visits/:id` - Delete company visit (Admin)

## 🔑 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **Student**: Can view events, register, get recommendations
- **Admin**: Can create/update/delete events and company visits

## 🗄️ Database Schema

### User
- name, email, password, role, department, year, interests

### Event
- title, description, category, date, time, venue, eligibility, createdBy

### Registration
- event, student, registrationDate, status, feedback

### Company Visit
- companyName, jobRole, description, eligibility, visitDate, package

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/college_events_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

## 🧪 Testing with Postman

See `POSTMAN_REQUESTS.md` for sample API requests.

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation
- Error handling middleware

## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 👨‍💻 Author

College Event Management System Backend

## 📄 License

ISC
