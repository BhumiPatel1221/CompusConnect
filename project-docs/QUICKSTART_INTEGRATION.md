# 🚀 Quick Start Guide - Backend Integration

## 📦 What Was Done

### ✅ Service Layer Created
All API services are in `/src/services/`:
- `api.ts` - Base configuration
- `authService.ts` - Authentication
- `eventService.ts` - Events
- `registrationService.ts` - Registrations
- `companyVisitService.ts` - Company visits

### ✅ Pages Integrated
- Login page
- Student signup
- Admin signup
- Event details page (example)

### ✅ Features Working
- User authentication
- Auto-login
- Route protection
- Error handling
- Toast notifications

---

## 🎯 How to Integrate Remaining Pages

### Pattern to Follow:

```typescript
import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { toast } from 'sonner';

function MyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await eventService.getEvents();
        setData(result);
      } catch (err) {
        toast.error(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Your existing UI here */}
      {data.map(item => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  );
}
```

---

## 📋 Service Methods Reference

### Authentication
```typescript
import { authService } from '../services/authService';

// Login
await authService.login({ email, password });

// Register
await authService.register({ name, email, password, role, department, year });

// Get current user
const user = await authService.getCurrentUser();

// Update profile
await authService.updateProfile({ name, interests });

// Update password
await authService.updatePassword({ currentPassword, newPassword });

// Logout
authService.logout();
```

### Events
```typescript
import { eventService } from '../services/eventService';

// Get all events
const events = await eventService.getEvents();

// Get with filters
const events = await eventService.getEvents({
  category: 'technical',
  status: 'upcoming',
  page: 1,
  limit: 10
});

// Get single event
const event = await eventService.getEventById(id);

// Get recommended (student only)
const events = await eventService.getRecommendedEvents();

// Create event (admin only)
await eventService.createEvent({
  title: 'Event Title',
  description: 'Description',
  category: 'technical',
  date: '2026-03-15',
  time: '10:00 AM',
  venue: 'Main Hall',
  eligibility: {
    department: ['CSE', 'IT'],
    year: [1, 2, 3, 4]
  },
  maxCapacity: 200
});

// Update event (admin only)
await eventService.updateEvent(id, { title: 'New Title' });

// Delete event (admin only)
await eventService.deleteEvent(id);
```

### Registrations
```typescript
import { registrationService } from '../services/registrationService';

// Register for event
await registrationService.registerForEvent({ eventId });

// Get my registrations
const registrations = await registrationService.getMyRegistrations();

// Get event registrations (admin)
const registrations = await registrationService.getEventRegistrations(eventId);

// Cancel registration
await registrationService.cancelRegistration(registrationId);

// Update status (admin)
await registrationService.updateRegistrationStatus(registrationId, {
  status: 'attended'
});

// Add feedback
await registrationService.addFeedback(registrationId, {
  rating: 5,
  comment: 'Great event!'
});

// Check if registered
const isRegistered = await registrationService.isRegisteredForEvent(eventId);
```

### Company Visits
```typescript
import { companyVisitService } from '../services/companyVisitService';

// Get all visits
const visits = await companyVisitService.getCompanyVisits();

// Get with filters
const visits = await companyVisitService.getCompanyVisits({
  status: 'scheduled',
  startDate: '2026-04-01',
  endDate: '2026-04-30'
});

// Get single visit
const visit = await companyVisitService.getCompanyVisitById(id);

// Get eligible visits (student)
const visits = await companyVisitService.getEligibleCompanyVisits();

// Create visit (admin)
await companyVisitService.createCompanyVisit({
  companyName: 'Google',
  jobRole: 'SDE',
  description: 'Job description',
  eligibility: {
    department: ['CSE', 'IT'],
    year: [3, 4],
    minCGPA: 7.5
  },
  visitDate: '2026-04-10',
  visitTime: '11:00 AM',
  venue: 'Placement Cell',
  package: '15-20 LPA',
  applicationDeadline: '2026-04-05',
  contactPerson: {
    name: 'Dr. Officer',
    email: 'placement@college.edu',
    phone: '+91-9876543210'
  }
});

// Update visit (admin)
await companyVisitService.updateCompanyVisit(id, { package: '18-22 LPA' });

// Delete visit (admin)
await companyVisitService.deleteCompanyVisit(id);
```

---

## 🔐 Using Auth Context

```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const {
    user,           // Current user object
    login,          // Login function
    register,       // Register function
    logout,         // Logout function
    updateUser,     // Update user in state
    isAuthenticated,// Boolean
    isLoading,      // Boolean
    isStudent,      // Boolean
    isAdmin,        // Boolean
    error           // Error message
  } = useAuth();

  // Use in your component
  if (isStudent) {
    // Student-only logic
  }

  if (isAdmin) {
    // Admin-only logic
  }
}
```

---

## 🎨 Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong');

// Info
toast.info('Information message');

// Warning
toast.warning('Warning message');

// Loading (with promise)
toast.promise(
  apiCall(),
  {
    loading: 'Loading...',
    success: 'Success!',
    error: 'Failed'
  }
);
```

---

## ⚠️ Error Handling Pattern

```typescript
const handleSubmit = async (data) => {
  setLoading(true);
  
  try {
    await eventService.createEvent(data);
    toast.success('Event created successfully!');
    navigate('/admin/events');
  } catch (err) {
    toast.error(err.message || 'Failed to create event');
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing Steps

1. **Start Backend:**
   ```bash
   cd college-event-management-backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd college-event-mangment-frontend
   npm run dev
   ```

3. **Test Authentication:**
   - Register as student
   - Login
   - Check auto-login (refresh page)
   - Logout

4. **Test Event Details:**
   - Navigate to an event
   - Register for event
   - Cancel registration

5. **Test Admin Functions:**
   - Register as admin
   - Create event
   - Delete event

---

## 📝 Important Notes

### Backend URL
- Current: `http://localhost:5000/api`
- Change in: `src/services/api.ts`

### Token Storage
- Key: `campus_connect_token`
- Location: localStorage
- Auto-cleared on 401

### User Data Storage
- Key: `campus_connect_user`
- Location: localStorage
- Updated on profile changes

### Error Codes
- 401 → Auto-logout + redirect to login
- 403 → Access denied message
- Others → Toast error message

---

## 🎯 Next Pages to Integrate

1. **Student Dashboard** - Use `eventService.getRecommendedEvents()`
2. **Admin Dashboard** - Use `eventService.getEvents()`
3. **Create Event** - Use `eventService.createEvent()`
4. **Company Visits** - Use `companyVisitService` methods
5. **My Registrations** - Use `registrationService.getMyRegistrations()`

---

## 💡 Tips

1. **Always use try/catch** for async operations
2. **Show loading states** during API calls
3. **Display toast notifications** for user feedback
4. **Check user role** before showing admin features
5. **Validate forms** before API calls
6. **Handle empty states** (no data)
7. **Test error scenarios** (network offline, invalid data)

---

## 📚 Documentation Files

- `BACKEND_INTEGRATION.md` - Detailed integration guide
- `INTEGRATION_SUMMARY.md` - Complete summary
- `QUICKSTART.md` - This file

---

## ✅ You're Ready!

Everything is set up and working. Just follow the patterns shown in `EventDetailsPage.tsx` to integrate the remaining pages.

**Happy coding! 🚀**
