---
description: Real-time Student-to-System chatbot using Socket.IO
---

# CampusConnect — Real-time Chatbot (Socket.IO)

## Overview
This feature adds a **Student-to-System** real-time chatbot (not student-to-student chat).

- Transport: **Socket.IO**
- Auth: **JWT-based** (uses existing `campus_connect_token`)
- Data sources: existing MongoDB models
  - `Event`
  - `Registration`
  - `CompanyVisit`
  - `User`

No existing REST endpoints were changed.

## Backend

### Added dependencies
- `socket.io`

### New folder structure
- `college-event-management-backend/sockets/`
  - `index.js` (Socket.IO init)
  - `socketAuth.js` (JWT socket auth middleware)
  - `chatbotSocketController.js` (keyword-based chatbot)

### Server wiring
`server.js` now:
- Creates an HTTP server from the Express app
- Starts listening using the HTTP server
- Initializes Socket.IO via `initSockets(httpServer)`

### Socket authentication
- Client passes token using `io(url, { auth: { token } })`
- Server validates `token` with `JWT_SECRET` and loads the user from DB
- If invalid/missing: connection rejected as `Unauthorized`

### Events
- Client -> Server: `message` `{ text, ts }`
- Server -> Client: `botReply` `{ text, data?, ts }`

### Supported queries (keyword-based)
- **Upcoming events**
  - "show upcoming events"
  - Queries `Event` where `status=upcoming` and `date >= now`
- **My registered events**
  - "show my registered events" / "my registrations"
  - Queries `Registration` for current student and populates `event`
- **Event time**
  - "what is the time of AI Workshop?"
  - Finds event by title regex and returns date+time
- **Next company visit**
  - "which company is visiting next?"
  - Queries `CompanyVisit` where `status=scheduled` and `visitDate >= now`
- **Registration count**
  - "how many students registered for Hackathon?"
  - Uses `Event.registrationCount`

## Frontend

### Added dependency
- `socket.io-client`

### New files
- `college-event-mangment-frontend/src/services/chatbotSocket.ts`
  - Creates a singleton socket connection
  - Reads token from `localStorage.campus_connect_token`
- `college-event-mangment-frontend/src/app/components/chat/ChatbotWidget.tsx`
  - Auto-scroll
  - Typing indicator
  - Timestamps

### Mount point
Currently mounted inside:
- `StudentDashboard.tsx` right-side card (replacing Upcoming Schedule card content)

If you already have a dedicated chat section elsewhere, you can move the component there without changing its internals.

## Setup / Run
1. Install deps:
   - Backend: `npm install`
   - Frontend: `npm install`
2. Restart backend server (Socket.IO requires restart)
3. Start frontend (`npm run dev`)
4. Login as student and open dashboard. Use the chatbot card.

## Notes
- The TypeScript error "Cannot find module 'socket.io-client'" will go away after installing frontend dependencies.
- This is intentionally keyword-based, but designed so that future AI intent parsing can replace the `processMessage()` function only.
