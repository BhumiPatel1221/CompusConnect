# Testing Checklist

Use this checklist to systematically test all features of the backend.

## ✅ Pre-Testing Setup

- [ ] MongoDB is running locally
- [ ] Server is started (`npm run dev`)
- [ ] Postman is installed and ready
- [ ] Server shows "MongoDB Connected" message

---

## 1️⃣ Authentication Testing

### Register Admin
- [ ] POST `/api/auth/register` with admin role
- [ ] Verify response contains token and user data
- [ ] Check password is NOT in response
- [ ] Save admin token for later use

### Register Student
- [ ] POST `/api/auth/register` with student role
- [ ] Include interests array
- [ ] Verify successful registration
- [ ] Save student token for later use

### Login
- [ ] POST `/api/auth/login` with correct credentials
- [ ] Verify token is returned
- [ ] Try login with wrong password (should fail)
- [ ] Try login with non-existent email (should fail)

### Get Profile
- [ ] GET `/api/auth/me` with valid token
- [ ] Verify user data is returned
- [ ] Try without token (should fail with 401)

### Update Profile
- [ ] PUT `/api/auth/updateprofile` with new data
- [ ] Verify profile is updated
- [ ] Check in MongoDB Compass

### Update Password
- [ ] PUT `/api/auth/updatepassword` with current and new password
- [ ] Verify new token is returned
- [ ] Try logging in with old password (should fail)
- [ ] Login with new password (should succeed)

---

## 2️⃣ Event Management Testing

### Create Event (Admin)
- [ ] POST `/api/events` with admin token
- [ ] Include all required fields
- [ ] Verify event is created
- [ ] Try with student token (should fail with 403)
- [ ] Try without token (should fail with 401)

### Get All Events
- [ ] GET `/api/events` without token
- [ ] Verify events are returned
- [ ] Try with pagination: `?page=1&limit=5`
- [ ] Filter by category: `?category=technical`
- [ ] Filter by status: `?status=upcoming`
- [ ] Filter by date range: `?startDate=2026-03-01&endDate=2026-03-31`

### Get Single Event
- [ ] GET `/api/events/:id` with valid event ID
- [ ] Verify event details are returned
- [ ] Try with invalid ID (should fail with 404)

### Get Recommendations (Student)
- [ ] GET `/api/events/recommendations/me` with student token
- [ ] Verify recommended events match student's interests
- [ ] Check department and year eligibility
- [ ] Try with admin token (should fail with 403)

### Update Event (Admin)
- [ ] PUT `/api/events/:id` with admin token
- [ ] Update title, venue, or other fields
- [ ] Verify event is updated
- [ ] Check in MongoDB Compass
- [ ] Try with student token (should fail)

### Delete Event (Admin)
- [ ] DELETE `/api/events/:id` with admin token
- [ ] Verify event is deleted
- [ ] Verify related registrations are also deleted
- [ ] Check in MongoDB Compass

---

## 3️⃣ Registration Testing

### Register for Event (Student)
- [ ] POST `/api/registrations` with student token and eventId
- [ ] Verify registration is created
- [ ] Check event's registrationCount increased
- [ ] Try registering for same event again (should fail - duplicate)

### Eligibility Testing
- [ ] Create event with specific department eligibility
- [ ] Try registering with ineligible student (should fail)
- [ ] Create event with specific year eligibility
- [ ] Try registering with ineligible year (should fail)

### Capacity Testing
- [ ] Create event with maxCapacity: 2
- [ ] Register 2 students
- [ ] Try registering 3rd student (should fail - full)

### Get My Registrations (Student)
- [ ] GET `/api/registrations/my-registrations` with student token
- [ ] Verify all student's registrations are returned
- [ ] Check populated event details

### Cancel Registration (Student)
- [ ] DELETE `/api/registrations/:id` with student token
- [ ] Verify status changed to 'cancelled'
- [ ] Check event's registrationCount decreased
- [ ] Try canceling another student's registration (should fail)

### Add Feedback (Student)
- [ ] PUT `/api/registrations/:id/feedback` with rating and comment
- [ ] Verify feedback is saved
- [ ] Check in MongoDB Compass
- [ ] Try adding feedback to another student's registration (should fail)

### Get Event Registrations (Admin)
- [ ] GET `/api/registrations/event/:eventId` with admin token
- [ ] Verify all registrations for event are returned
- [ ] Check populated student details
- [ ] Try with student token (should fail with 403)

### Update Registration Status (Admin)
- [ ] PUT `/api/registrations/:id/status` with admin token
- [ ] Change status to 'attended'
- [ ] Verify status is updated
- [ ] Try with student token (should fail)

---

## 4️⃣ Company Visit Testing

### Create Company Visit (Admin)
- [ ] POST `/api/company-visits` with admin token
- [ ] Include all required fields
- [ ] Include eligibility criteria (department, year, CGPA)
- [ ] Verify company visit is created
- [ ] Try with student token (should fail)

### Get All Company Visits
- [ ] GET `/api/company-visits` without token
- [ ] Verify company visits are returned
- [ ] Filter by status: `?status=scheduled`
- [ ] Filter by date range

### Get Single Company Visit
- [ ] GET `/api/company-visits/:id` with valid ID
- [ ] Verify company visit details are returned
- [ ] Try with invalid ID (should fail)

### Get Eligible Company Visits (Student)
- [ ] GET `/api/company-visits/eligible/me` with student token
- [ ] Verify only eligible visits are returned
- [ ] Check department and year match
- [ ] Try with admin token (should fail)

### Update Company Visit (Admin)
- [ ] PUT `/api/company-visits/:id` with admin token
- [ ] Update package, status, or other fields
- [ ] Verify company visit is updated
- [ ] Try with student token (should fail)

### Delete Company Visit (Admin)
- [ ] DELETE `/api/company-visits/:id` with admin token
- [ ] Verify company visit is deleted
- [ ] Check in MongoDB Compass

---

## 5️⃣ Error Handling Testing

### Validation Errors
- [ ] Try registering without required fields
- [ ] Try creating event with invalid category
- [ ] Try creating user with invalid email format
- [ ] Try creating user with password < 6 characters
- [ ] Verify all return 400 with meaningful messages

### Authentication Errors
- [ ] Try accessing protected route without token (401)
- [ ] Try with invalid token (401)
- [ ] Try with expired token (401)

### Authorization Errors
- [ ] Try admin-only route with student token (403)
- [ ] Try student-only route with admin token (403)

### Not Found Errors
- [ ] Try getting event with non-existent ID (404)
- [ ] Try updating user that doesn't exist (404)

### Duplicate Errors
- [ ] Try registering with existing email (400)
- [ ] Try registering for same event twice (400)

---

## 6️⃣ Database Verification

### MongoDB Compass Checks
- [ ] Open MongoDB Compass
- [ ] Connect to `mongodb://127.0.0.1:27017`
- [ ] Verify database `college_events_db` exists
- [ ] Check collections: users, events, registrations, companyvisits
- [ ] Verify passwords are hashed (not plain text)
- [ ] Check timestamps (createdAt, updatedAt) are present
- [ ] Verify relationships (ObjectId references)

---

## 7️⃣ Security Testing

### Password Security
- [ ] Verify passwords are hashed in database
- [ ] Verify password field is not returned in responses
- [ ] Verify bcrypt is used (check User model)

### JWT Security
- [ ] Verify token expires after 7 days
- [ ] Verify token contains only user ID (not password)
- [ ] Verify token is signed with secret key

### Authorization
- [ ] Verify students cannot create events
- [ ] Verify students cannot delete events
- [ ] Verify admins cannot register for events
- [ ] Verify users can only modify their own data

---

## 8️⃣ Edge Cases Testing

### Empty Results
- [ ] Get events when no events exist
- [ ] Get registrations when student has none
- [ ] Get recommendations when no matching events

### Boundary Values
- [ ] Create user with year = 1 (minimum)
- [ ] Create user with year = 4 (maximum)
- [ ] Try year = 0 (should fail)
- [ ] Try year = 5 (should fail)

### Special Characters
- [ ] Create event with special characters in title
- [ ] Register user with special characters in name
- [ ] Add feedback with emojis

### Large Data
- [ ] Create 50+ events
- [ ] Test pagination works correctly
- [ ] Verify performance is acceptable

---

## 9️⃣ Integration Testing

### Complete User Flow (Student)
- [ ] Register as student
- [ ] Login
- [ ] View all events
- [ ] Get recommendations
- [ ] Register for event
- [ ] View my registrations
- [ ] Add feedback
- [ ] Cancel registration
- [ ] View eligible company visits

### Complete User Flow (Admin)
- [ ] Register as admin
- [ ] Login
- [ ] Create event
- [ ] View all events
- [ ] Update event
- [ ] View event registrations
- [ ] Update registration status
- [ ] Create company visit
- [ ] Update company visit
- [ ] Delete event
- [ ] Delete company visit

---

## 🔟 Performance Testing

### Response Times
- [ ] All endpoints respond within 500ms
- [ ] Database queries are optimized
- [ ] No N+1 query problems

### Concurrent Requests
- [ ] Multiple students can register simultaneously
- [ ] No race conditions in capacity checking

---

## 📊 Testing Summary

### Total Tests: 100+

After completing all tests, fill this out:

- **Tests Passed**: _____ / 100+
- **Tests Failed**: _____
- **Issues Found**: _____
- **Critical Bugs**: _____
- **Minor Bugs**: _____

---

## 🐛 Bug Tracking

If you find bugs, document them here:

| Bug # | Description | Severity | Status |
|-------|-------------|----------|--------|
| 1     |             |          |        |
| 2     |             |          |        |
| 3     |             |          |        |

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] Role-based access control works
- [ ] Error handling is consistent
- [ ] Database is properly updated
- [ ] No sensitive data in responses
- [ ] Documentation matches actual behavior
- [ ] Ready for viva demonstration

---

## 📝 Notes

Use this space for any additional observations:

---

**Testing completed on**: _______________

**Tested by**: _______________

**Overall Status**: ⭕ Pass / ⭕ Fail / ⭕ Needs Work
