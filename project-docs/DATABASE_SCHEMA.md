# CampusConnect — Database Schema (MongoDB)

This project uses **MongoDB** with **Mongoose** ODM.

Collections (models):

- `User`
- `Event`
- `Registration`
- `CompanyVisit`
- `CompanyVisitApplication`

---

## 1) User Model (`models/User.js`)

### Purpose
Stores authentication and profile data for both **students** and **admins**.

### Fields

| Field | Type | Required | Notes |
|---|---:|:---:|---|
| `name` | `String` | Yes | max length 50, trimmed |
| `email` | `String` | Yes | unique, lowercase, validated by regex |
| `password` | `String` | Yes | min length 6, `select:false` in queries |
| `role` | `String` | No | enum: `student`, `admin`; default `student` |
| `department` | `String` | Student only | required if role is `student` |
| `year` | `String` | Student only | required if role is `student` |
| `interests` | `[String]` | No | default `[]` |
| `organization` | `String` | Admin only | required if role is `admin` |
| `position` | `String` | Admin only | required if role is `admin` |
| `createdAt` | `Date` | auto | timestamps enabled |
| `updatedAt` | `Date` | auto | timestamps enabled |

### Security / Hooks

- Password hashing is performed in a `pre('save')` hook using `bcryptjs`.
- `matchPassword(enteredPassword)` compares raw password with hashed password.

### Indexes

- `email` is `unique: true` (prevents duplicate accounts).

---

## 2) Event Model (`models/Event.js`)

### Purpose
Stores campus events created by admins.

### Fields

| Field | Type | Required | Notes |
|---|---:|:---:|---|
| `title` | `String` | Yes | max length 100 |
| `description` | `String` | Yes | max length 1000 |
| `category` | `String` | Yes | enum: `technical`, `cultural`, `sports`, `placement` |
| `date` | `Date` | Yes | event date |
| `time` | `String` | Yes | e.g., `10:00 AM` |
| `venue` | `String` | Yes | trimmed |
| `eligibility.department` | `[String]` | No | default `['All']`, enum includes `CSE`, `ECE`, etc. |
| `eligibility.year` | `[Number]` | No | default `[1,2,3,4]` |
| `createdBy` | `ObjectId` | Yes | ref: `User` (admin) |
| `registrationCount` | `Number` | No | default `0` |
| `maxCapacity` | `Number|null` | No | `null` = unlimited |
| `status` | `String` | No | enum: `upcoming`, `ongoing`, `completed`, `cancelled` |
| `createdAt` | `Date` | auto | timestamps enabled |
| `updatedAt` | `Date` | auto | timestamps enabled |

### Relationships

- **Event → User (Admin)**
  - `Event.createdBy` references the admin who created the event.

### Indexing

- Compound index:

```js
eventSchema.index({ category: 1, date: 1 })
```

Why:

- speeds up category-based listings and sorting/filtering by date.

---

## 3) Registration Model (`models/Registration.js`)

### Purpose
Stores student registrations for events.

### Fields

| Field | Type | Required | Notes |
|---|---:|:---:|---|
| `event` | `ObjectId` | Yes | ref: `Event` |
| `student` | `ObjectId` | Yes | ref: `User` |
| `registrationDate` | `Date` | No | default `Date.now` |
| `status` | `String` | No | enum: `registered`, `attended`, `cancelled` |
| `feedback.rating` | `Number` | No | min 1, max 5 |
| `feedback.comment` | `String` | No | max length 500 |
| `createdAt` | `Date` | auto | timestamps enabled |
| `updatedAt` | `Date` | auto | timestamps enabled |

### Relationships

- **Registration → Event** via `event`
- **Registration → User (Student)** via `student`

### Indexing

Duplicate prevention:

```js
registrationSchema.index({ event: 1, student: 1 }, { unique: true })
```

Performance indexes:

```js
registrationSchema.index({ student: 1 })
registrationSchema.index({ event: 1 })
```

Why:

- Fast lookups for "my registrations" and "registrations by event".

---

## 4) CompanyVisit Model (`models/CompanyVisit.js`)

### Purpose
Represents placement/company visit opportunities.

### Fields

| Field | Type | Required | Notes |
|---|---:|:---:|---|
| `companyName` | `String` | Yes | max length 100 |
| `jobRole` | `String` | Yes | |
| `description` | `String` | Yes | max length 1000 |
| `companyLogoUrl` | `String` | No | populated when file uploaded |
| `eligibility.department` | `[String]` | Yes | enum includes `All`, `CSE`, etc. |
| `eligibility.year` | `[Number]` | Yes | validated 1..4 |
| `eligibility.minCGPA` | `Number` | No | default 0, 0..10 |
| `visitDate` | `Date` | Yes | |
| `visitTime` | `String` | Yes | |
| `venue` | `String` | Yes | |
| `package` | `String` | No | salary package |
| `applicationDeadline` | `Date` | No | optional |
| `contactPerson` | `Object` | No | `{name,email,phone}` |
| `createdBy` | `ObjectId` | Yes | ref: `User` (admin) |
| `status` | `String` | No | enum: `scheduled`, `completed`, `cancelled` |
| `createdAt` | `Date` | auto | timestamps enabled |
| `updatedAt` | `Date` | auto | timestamps enabled |

### Relationships

- **CompanyVisit → User (Admin)** via `createdBy`

### Indexing

```js
companyVisitSchema.index({ visitDate: 1 })
companyVisitSchema.index({ companyName: 1 })
```

Why:

- Efficient upcoming/past visit filtering and company-based search.

---

## 5) CompanyVisitApplication Model (`models/CompanyVisitApplication.js`)

### Purpose
Tracks student applications to company visits.

### Fields

| Field | Type | Required | Notes |
|---|---:|:---:|---|
| `companyVisit` | `ObjectId` | Yes | ref: `CompanyVisit` |
| `student` | `ObjectId` | Yes | ref: `User` |
| `status` | `String` | No | enum: `applied`, `cancelled` |
| `appliedAt` | `Date` | No | default now |
| `createdAt` | `Date` | auto | timestamps enabled |
| `updatedAt` | `Date` | auto | timestamps enabled |

### Relationships

- **Application → CompanyVisit** via `companyVisit`
- **Application → User (Student)** via `student`

### Indexing

Duplicate prevention (one student can apply once per visit):

```js
companyVisitApplicationSchema.index({ companyVisit: 1, student: 1 }, { unique: true })
```

---

## Relationship Summary

- **User (admin)** creates many **Events** and **CompanyVisits**
- **User (student)** creates many **Registrations** and **CompanyVisitApplications**
- **Event** has many **Registrations**
- **CompanyVisit** has many **CompanyVisitApplications**

---

## Notes on Data Consistency

- `Event.registrationCount` is maintained by controller logic during registration and cancellation.
- Duplicate registrations/applications are prevented at the **database level** using unique compound indexes.
