# Event Creation Fix - Testing Guide

## Problem Identified

The issue was with the **request body structure** in Postman. The `department` and `year` fields were being sent as top-level fields instead of being nested inside the `eligibility` object.

### ❌ WRONG Format (What you were using):
```json
{
  "title": "TechFest 2025",
  "description": "Annual technical festival featuring coding competitions, hackathons, and tech talks",
  "category": "technical",
  "date": "2025-03-15",
  "time": "10:00",
  "venue": "Main Auditorium",
  "eligibility": {},
  "department": ["All"],
  "year": [1, 2, 3, 4],
  "maxCapacity": 200
}
```

### ✅ CORRECT Format (Use this):
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

## What Was Fixed

1. **Enhanced Error Logging**: Added comprehensive logging in `eventController.js` to track:
   - Request body received
   - User authentication status
   - Event creation process
   - Database verification
   - Detailed validation errors

2. **Auto-Restructuring Middleware**: Added logic to automatically fix the request structure if `department` and `year` are sent as top-level fields (backward compatibility)

3. **Default Values**: Added automatic default values for eligibility if not provided

## How to Test in Postman

### Step 1: Login as Admin
**POST** `http://localhost:5000/api/auth/login`

**Body (raw JSON):**
```json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

**Copy the token from the response**

### Step 2: Create Event with Correct Format
**POST** `http://localhost:5000/api/events`

**Headers:**
- `Authorization`: `Bearer YOUR_TOKEN_HERE`
- `Content-Type`: `application/json`

**Body (raw JSON):**
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

### Step 3: Verify Event Was Created
**GET** `http://localhost:5000/api/events`

This should return the newly created event.

## Additional Test Cases

### Test Case 1: Technical Event for CSE Students Only
```json
{
  "title": "AI Workshop 2025",
  "description": "Hands-on workshop on Artificial Intelligence and Machine Learning",
  "category": "technical",
  "date": "2025-04-10",
  "time": "14:00",
  "venue": "Computer Lab 1",
  "eligibility": {
    "department": ["CSE", "IT"],
    "year": [2, 3, 4]
  },
  "maxCapacity": 50
}
```

### Test Case 2: Cultural Event for All
```json
{
  "title": "Cultural Night 2025",
  "description": "Annual cultural festival with music, dance, and drama performances",
  "category": "cultural",
  "date": "2025-05-20",
  "time": "18:00",
  "venue": "Open Auditorium",
  "eligibility": {
    "department": ["All"],
    "year": [1, 2, 3, 4]
  },
  "maxCapacity": 500
}
```

### Test Case 3: Placement Drive
```json
{
  "title": "Google Campus Recruitment",
  "description": "On-campus recruitment drive by Google for software engineering positions",
  "category": "placement",
  "date": "2025-06-15",
  "time": "09:00",
  "venue": "Placement Cell",
  "eligibility": {
    "department": ["CSE", "IT", "ECE"],
    "year": [4]
  },
  "maxCapacity": 100
}
```

## Checking Backend Logs

After creating an event, check your backend terminal. You should see:
```
📝 Creating new event...
Request body: { ... }
User ID: <user_id>
Creating event with data: { ... }
✅ Event created successfully in DB: <event_id>
🔍 Verification - Event found in DB: YES
```

## Verifying in MongoDB

You can also verify the event was saved by running:
```bash
node test-db.js
```

This will show:
- All collections in the database
- Total number of events
- List of recent events

## Category Options
Valid categories are:
- `technical`
- `cultural`
- `sports`
- `placement`

## Department Options
Valid departments are:
- `All`
- `CSE`
- `ECE`
- `ME`
- `CE`
- `EE`
- `IT`
- `Other`

## Status Options
Valid statuses are:
- `upcoming` (default)
- `ongoing`
- `completed`
- `cancelled`

## Notes
- The backend now supports BOTH formats (nested and flat) for backward compatibility
- The frontend service already uses the correct nested format
- All validation errors will now be logged in detail in the backend console
- Events are verified immediately after creation to ensure they're saved to MongoDB
