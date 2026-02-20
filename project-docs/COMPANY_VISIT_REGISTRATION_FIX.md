# Company Visit & Registration Fix - Testing Guide

## Problems Identified & Fixed

### 1. Company Visit Creation Issue
**Same problem as Events**: The `eligibility` object structure was incorrect in API requests.

#### ❌ WRONG Format:
```json
{
  "companyName": "Google India",
  "jobRole": "Software Engineer",
  "description": "...",
  "visitDate": "2025-04-20",
  "visitTime": "10:00 AM",
  "venue": "Placement Cell",
  "package": "18-25 LPA",
  "eligibility": {},
  "department": ["CSE", "IT"],
  "year": [4],
  "minCGPA": 7.5
}
```

#### ✅ CORRECT Format:
```json
{
  "companyName": "Google India",
  "jobRole": "Software Engineer",
  "description": "Google is hiring software engineers for their Bangalore office",
  "visitDate": "2025-04-20",
  "visitTime": "10:00 AM",
  "venue": "Placement Cell",
  "package": "18-25 LPA",
  "eligibility": {
    "department": ["CSE", "IT", "ECE"],
    "year": [4],
    "minCGPA": 7.5
  },
  "applicationDeadline": "2025-04-10",
  "contactPerson": {
    "name": "Dr. Placement Officer",
    "email": "placement@college.edu",
    "phone": "9876543210"
  }
}
```

### 2. Student Registration Issue
The registration controller was missing detailed logging to track where the process fails.

## What Was Fixed

### Company Visit Controller (`companyVisitController.js`)
1. ✅ Added comprehensive logging at each step
2. ✅ Auto-restructuring for eligibility data (backward compatibility)
3. ✅ Database verification after creation
4. ✅ Detailed validation error messages

### Registration Controller (`registrationController.js`)
1. ✅ Added step-by-step logging for the entire registration process
2. ✅ Logs for eligibility checks (department, year)
3. ✅ Capacity and duplicate registration checks
4. ✅ Database verification after creation
5. ✅ Detailed error messages

## Testing in Postman

### Test 1: Create Company Visit

**POST** `http://localhost:5000/api/company-visits`

**Headers:**
- `Authorization`: `Bearer YOUR_ADMIN_TOKEN`
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "companyName": "Google India",
  "jobRole": "Software Engineer",
  "description": "Google is hiring software engineers for their Bangalore office. Great opportunity for final year students.",
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

### Test 2: Student Registration for Event

**POST** `http://localhost:5000/api/registrations`

**Headers:**
- `Authorization`: `Bearer YOUR_STUDENT_TOKEN`
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "eventId": "YOUR_EVENT_ID_HERE"
}
```

**Note**: Replace `YOUR_EVENT_ID_HERE` with an actual event ID from your database.

### Test 3: Get All Company Visits

**GET** `http://localhost:5000/api/company-visits`

No authentication required (public route)

### Test 4: Get Student's Registrations

**GET** `http://localhost:5000/api/registrations/my-registrations`

**Headers:**
- `Authorization`: `Bearer YOUR_STUDENT_TOKEN`

## Backend Logs to Expect

### When Creating Company Visit:
```
🏢 Creating new company visit...
Request body: { ... }
User ID: <admin_id>
Creating company visit with data: { ... }
✅ Company visit created successfully in DB: <visit_id>
🔍 Verification - Company visit found in DB: YES
```

### When Student Registers for Event:
```
📝 Student registering for event...
Request body: { "eventId": "..." }
Student ID: <student_id>
Event ID: <event_id>
✅ Event found: <event_title>
✅ Eligibility checks passed
Creating registration...
✅ Registration created successfully in DB: <registration_id>
✅ Event registration count updated: <count>
🔍 Verification - Registration found in DB: YES
```

## Database Verification Scripts

### Test Company Visit Creation:
```bash
node test-create-company-visit.js
```

This will:
- Create a test company visit directly in the database
- Verify it was saved
- Show all company visits in the database

### Test Registration Creation:
```bash
node test-create-registration.js
```

This will:
- Find a student and an upcoming event
- Create a test registration
- Update the event's registration count
- Verify it was saved
- Show all registrations for that student

### Check All Collections:
```bash
node test-db.js
```

This will show:
- All collections in the database
- Total count of events, company visits, registrations, etc.

## Common Issues & Solutions

### Issue 1: "Event not found"
**Solution**: Make sure you're using a valid event ID. Get event IDs by calling:
```
GET http://localhost:5000/api/events
```

### Issue 2: "Not eligible for this event"
**Solution**: Check the event's eligibility criteria:
- Department must match (or event must allow "All")
- Year must match
- For company visits, CGPA must be >= minCGPA

### Issue 3: "Already registered"
**Solution**: Each student can only register once per event. Check existing registrations:
```
GET http://localhost:5000/api/registrations/my-registrations
```

### Issue 4: "Event is full"
**Solution**: The event has reached its maximum capacity. Admin can:
- Increase the `maxCapacity` of the event
- Set `maxCapacity` to `null` for unlimited capacity

## Additional Test Cases

### Company Visit - Microsoft
```json
{
  "companyName": "Microsoft",
  "jobRole": "Cloud Engineer",
  "description": "Microsoft Azure team is hiring cloud engineers",
  "eligibility": {
    "department": ["CSE", "IT"],
    "year": [3, 4],
    "minCGPA": 8.0
  },
  "visitDate": "2025-05-15",
  "visitTime": "2:00 PM",
  "venue": "Conference Hall",
  "package": "20-30 LPA",
  "applicationDeadline": "2025-05-05"
}
```

### Company Visit - Amazon
```json
{
  "companyName": "Amazon",
  "jobRole": "SDE-1",
  "description": "Amazon is looking for Software Development Engineers",
  "eligibility": {
    "department": ["All"],
    "year": [4],
    "minCGPA": 7.0
  },
  "visitDate": "2025-06-01",
  "visitTime": "9:00 AM",
  "venue": "Main Auditorium",
  "package": "15-22 LPA"
}
```

## Field Validations

### Company Visit Required Fields:
- `companyName` (max 100 chars)
- `jobRole`
- `description` (max 1000 chars)
- `eligibility.department` (array of valid departments)
- `eligibility.year` (array of numbers 1-4)
- `visitDate` (future date)
- `visitTime`
- `venue`

### Company Visit Optional Fields:
- `package` (salary package)
- `applicationDeadline`
- `contactPerson` (object with name, email, phone)
- `eligibility.minCGPA` (0-10, default: 0)

### Registration Required Fields:
- `eventId` (valid event ObjectId)

## Status Values

### Company Visit Status:
- `scheduled` (default)
- `completed`
- `cancelled`

### Registration Status:
- `registered` (default)
- `attended`
- `cancelled`

## API Endpoints Summary

### Company Visits:
- `GET /api/company-visits` - Get all company visits (Public)
- `GET /api/company-visits/:id` - Get single company visit (Public)
- `POST /api/company-visits` - Create company visit (Admin only)
- `PUT /api/company-visits/:id` - Update company visit (Admin only)
- `DELETE /api/company-visits/:id` - Delete company visit (Admin only)
- `GET /api/company-visits/eligible` - Get eligible visits for student (Student only)

### Registrations:
- `POST /api/registrations` - Register for event (Student only)
- `GET /api/registrations/my-registrations` - Get student's registrations (Student only)
- `GET /api/registrations/event/:eventId` - Get event registrations (Admin only)
- `DELETE /api/registrations/:id` - Cancel registration (Student only)
- `PUT /api/registrations/:id/status` - Update registration status (Admin only)
- `PUT /api/registrations/:id/feedback` - Add feedback (Student only)

## Notes
- All controllers now have enhanced logging
- Backend automatically restructures data for backward compatibility
- All database operations are verified immediately after creation
- Detailed error messages help identify issues quickly
