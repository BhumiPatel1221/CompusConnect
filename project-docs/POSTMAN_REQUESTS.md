# Postman API Testing Guide

This document contains sample requests for testing all API endpoints using Postman.

## Base URL
```
http://localhost:5000
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register Student

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Headers:** 
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul.sharma@college.edu",
  "password": "password123",
  "role": "student",
  "department": "CSE",
  "year": 3,
  "interests": ["technical", "placement"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@college.edu",
    "role": "student",
    "department": "CSE",
    "year": 3,
    "interests": ["technical", "placement"]
  }
}
```

---

### 1.2 Register Admin

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/register`  
**Headers:** 
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Dr. Priya Verma",
  "email": "priya.verma@college.edu",
  "password": "admin123",
  "role": "admin",
  "department": "CSE",
  "year": 1
}
```

---

### 1.3 Login

**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:** 
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "rahul.sharma@college.edu",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Important:** Copy the token from the response and use it in subsequent requests!

---

### 1.4 Get Current User Profile

**Method:** GET  
**URL:** `http://localhost:5000/api/auth/me`  
**Headers:** 
```
Authorization: Bearer <your_token_here>
```

---

### 1.5 Update Profile

**Method:** PUT  
**URL:** `http://localhost:5000/api/auth/updateprofile`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <your_token_here>
```

**Body (JSON):**
```json
{
  "name": "Rahul Kumar Sharma",
  "interests": ["technical", "cultural", "placement"]
}
```

---

### 1.6 Update Password

**Method:** PUT  
**URL:** `http://localhost:5000/api/auth/updatepassword`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <your_token_here>
```

**Body (JSON):**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 2. EVENT ENDPOINTS

### 2.1 Create Event (Admin Only)

**Method:** POST  
**URL:** `http://localhost:5000/api/events`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <admin_token_here>
```

**Body (JSON):**
```json
{
  "title": "TechFest 2026",
  "description": "Annual technical festival featuring coding competitions, hackathons, and tech talks",
  "category": "technical",
  "date": "2026-03-15",
  "time": "10:00 AM",
  "venue": "Main Auditorium",
  "eligibility": {
    "department": ["All"],
    "year": [1, 2, 3, 4]
  },
  "maxCapacity": 200
}
```

---

### 2.2 Get All Events

**Method:** GET  
**URL:** `http://localhost:5000/api/events`  

**Optional Query Parameters:**
- `category=technical`
- `status=upcoming`
- `page=1`
- `limit=10`
- `startDate=2026-03-01`
- `endDate=2026-03-31`

**Example:**
```
http://localhost:5000/api/events?category=technical&status=upcoming
```

---

### 2.3 Get Single Event

**Method:** GET  
**URL:** `http://localhost:5000/api/events/:id`  

**Example:**
```
http://localhost:5000/api/events/65f1234567890abcdef12345
```

---

### 2.4 Get Recommended Events (Student Only)

**Method:** GET  
**URL:** `http://localhost:5000/api/events/recommendations/me`  
**Headers:** 
```
Authorization: Bearer <student_token_here>
```

---

### 2.5 Update Event (Admin Only)

**Method:** PUT  
**URL:** `http://localhost:5000/api/events/:id`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <admin_token_here>
```

**Body (JSON):**
```json
{
  "title": "TechFest 2026 - Updated",
  "venue": "New Auditorium",
  "status": "upcoming"
}
```

---

### 2.6 Delete Event (Admin Only)

**Method:** DELETE  
**URL:** `http://localhost:5000/api/events/:id`  
**Headers:** 
```
Authorization: Bearer <admin_token_here>
```

---

## 3. REGISTRATION ENDPOINTS

### 3.1 Register for Event (Student Only)

**Method:** POST  
**URL:** `http://localhost:5000/api/registrations`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <student_token_here>
```

**Body (JSON):**
```json
{
  "eventId": "65f1234567890abcdef12345"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "data": {
    "_id": "...",
    "event": "65f1234567890abcdef12345",
    "student": "...",
    "status": "registered",
    "registrationDate": "2026-02-01T13:51:30.000Z"
  }
}
```

---

### 3.2 Get My Registrations (Student Only)

**Method:** GET  
**URL:** `http://localhost:5000/api/registrations/my-registrations`  
**Headers:** 
```
Authorization: Bearer <student_token_here>
```

---

### 3.3 Cancel Registration (Student Only)

**Method:** DELETE  
**URL:** `http://localhost:5000/api/registrations/:id`  
**Headers:** 
```
Authorization: Bearer <student_token_here>
```

---

### 3.4 Add Feedback (Student Only)

**Method:** PUT  
**URL:** `http://localhost:5000/api/registrations/:id/feedback`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <student_token_here>
```

**Body (JSON):**
```json
{
  "rating": 5,
  "comment": "Excellent event! Very well organized and informative."
}
```

---

### 3.5 Get Event Registrations (Admin Only)

**Method:** GET  
**URL:** `http://localhost:5000/api/registrations/event/:eventId`  
**Headers:** 
```
Authorization: Bearer <admin_token_here>
```

---

### 3.6 Update Registration Status (Admin Only)

**Method:** PUT  
**URL:** `http://localhost:5000/api/registrations/:id/status`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <admin_token_here>
```

**Body (JSON):**
```json
{
  "status": "attended"
}
```

---

## 4. COMPANY VISIT ENDPOINTS

### 4.1 Create Company Visit (Admin Only)

**Method:** POST  
**URL:** `http://localhost:5000/api/company-visits`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <admin_token_here>
```

**Body (JSON):**
```json
{
  "companyName": "Google India",
  "jobRole": "Software Engineer",
  "description": "Google is visiting for campus recruitment. Roles available for SDE positions.",
  "eligibility": {
    "department": ["CSE", "IT"],
    "year": [3, 4],
    "minCGPA": 7.5
  },
  "visitDate": "2026-04-10",
  "visitTime": "11:00 AM",
  "venue": "Placement Cell",
  "package": "15-20 LPA",
  "applicationDeadline": "2026-04-05",
  "contactPerson": {
    "name": "Dr. Placement Officer",
    "email": "placement@college.edu",
    "phone": "+91-9876543210"
  }
}
```

---

### 4.2 Get All Company Visits

**Method:** GET  
**URL:** `http://localhost:5000/api/company-visits`  

**Optional Query Parameters:**
- `status=scheduled`
- `startDate=2026-04-01`
- `endDate=2026-04-30`

---

### 4.3 Get Single Company Visit

**Method:** GET  
**URL:** `http://localhost:5000/api/company-visits/:id`  

---

### 4.4 Get Eligible Company Visits (Student Only)

**Method:** GET  
**URL:** `http://localhost:5000/api/company-visits/eligible/me`  
**Headers:** 
```
Authorization: Bearer <student_token_here>
```

---

### 4.5 Update Company Visit (Admin Only)

**Method:** PUT  
**URL:** `http://localhost:5000/api/company-visits/:id`  
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer <admin_token_here>
```

**Body (JSON):**
```json
{
  "package": "18-22 LPA",
  "status": "scheduled"
}
```

---

### 4.6 Delete Company Visit (Admin Only)

**Method:** DELETE  
**URL:** `http://localhost:5000/api/company-visits/:id`  
**Headers:** 
```
Authorization: Bearer <admin_token_here>
```

---

## Testing Flow

### Recommended Testing Sequence:

1. **Register Admin** → Save admin token
2. **Register Student** → Save student token
3. **Login as Admin** → Verify token
4. **Create Event** (using admin token)
5. **Get All Events** (no token needed)
6. **Login as Student** → Verify token
7. **Get Recommended Events** (using student token)
8. **Register for Event** (using student token)
9. **Get My Registrations** (using student token)
10. **Create Company Visit** (using admin token)
11. **Get Eligible Company Visits** (using student token)

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## Tips for Postman

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:5000`
   - `admin_token`: (paste admin token after login)
   - `student_token`: (paste student token after login)

2. **Use Collections:**
   - Create separate folders for Auth, Events, Registrations, Company Visits

3. **Save Requests:**
   - Save all requests in a collection for easy reuse

4. **Test Scripts:**
   - Add test scripts to automatically save tokens after login
