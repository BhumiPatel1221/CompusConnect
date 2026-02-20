---
description: Rule-based AI recommendations plug-in for Student Dashboard
---

# CampusConnect — Rule-Based Recommendation Engine (Plug-in Layer)

## Goals
- Add an **independent** recommendation engine without modifying existing UI layout/styling, DB schema, or existing controllers/routes.
- Provide **top 5** event recommendations for a given student.
- Integrate into the existing **Student Dashboard → Recommended For You** section by changing only the **data source logic**.

## Constraints honored
- No model changes
- No edits to existing controllers or existing route files
- No UI redesign (existing layout preserved)

## Backend

### New files
- `college-event-management-backend/services/recommendationService.js`
- `college-event-management-backend/controllers/recommendationController.js`
- `college-event-management-backend/routes/recommendationRoutes.js`

### New endpoint
`GET /api/recommendations/:studentId`

#### Auth
- Protected by existing `protect` middleware.
- Students can only access their own recommendations.

### Returned format
```json
{
  "success": true,
  "data": [
    {
      "eventId": "...",
      "eventName": "...",
      "matchScore": 87,
      "reasons": ["..."],
      "event": { "_id": "...", "title": "..." }
    }
  ]
}
```

### Scoring logic
The original spec references `Student.skills` / `Event.requiredSkills` / `branchEligible` / `minCgpa`.

**Current project schema** does not include those exact fields. To stay schema-safe and keep this fully backward compatible, the engine uses these mappings:
- **Student skills**: `User.interests` (string array)
- **Branch**: `User.department`
- **Eligible branches**: `Event.eligibility.department` (contains `All` or list)
- **Year**: `User.year` (string) mapped to number; compared with `Event.eligibility.year` (number array)
- **Popularity**: `Event.registrationCount` normalized against max registrationCount in active events
- **Placement CGPA**: Not available for events in current schema (CGPA exists in `CompanyVisit.eligibility.minCGPA`). Therefore, CGPA gating is **not applied to events**.

#### Weights
```js
skillMatchWeight = 0.6
branchWeight = 0.3
popularityWeight = 0.1
```

#### Match score
`matchScore` is a 0..100 integer.

### Efficiency
- Fetches student once.
- Fetches active events once (single query).
- No per-event DB calls.

## Frontend

### New file
- `college-event-mangment-frontend/src/services/recommendationService.ts`

### Integration
- `StudentDashboard.tsx` now calls:
  - `GET /api/recommendations/:studentId`
- Uses returned `event` objects to render existing cards.
- Adds:
  - `matchScore` badge
  - Expandable “Why Recommended?” section rendering `reasons`

## Notes / Limitations
- Because the event schema does not contain required skills, recommendations are best-effort using interest/category/title token overlap.
- If you later introduce `requiredSkills`, `branchEligible`, or `minCgpa` fields, the service can be extended without impacting existing routes/UI.
