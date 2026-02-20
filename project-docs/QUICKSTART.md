# Quick Start Guide

## Prerequisites
1. **Node.js** installed (v14+)
2. **MongoDB** installed and running locally
3. **MongoDB Compass** (optional, for viewing database)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Check MongoDB Service
Make sure MongoDB is running on your machine:
- **Windows**: Check Services → MongoDB Server
- **Mac/Linux**: `sudo systemctl status mongod`

### 3. Configure Environment
The `.env` file is already configured with default values:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college_events_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
```

### 4. Start the Server

**Development Mode (with auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Verify Server is Running
You should see:
```
✅ MongoDB Connected: 127.0.0.1
📊 Database Name: college_events_db
🚀 Server running in development mode on port 5000
```

### 6. Test the API
Open browser or Postman and visit:
```
http://localhost:5000
```

You should see a welcome message with available endpoints.

## Quick Test Flow

### 1. Register Admin
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Admin User",
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "admin",
  "department": "CSE",
  "year": 1
}
```

### 2. Register Student
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Student User",
  "email": "student@college.edu",
  "password": "student123",
  "role": "student",
  "department": "CSE",
  "year": 3,
  "interests": ["technical", "placement"]
}
```

### 3. Login and Get Token
```bash
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@college.edu",
  "password": "admin123"
}
```
Copy the `token` from response.

### 4. Create Event (Admin)
```bash
POST http://localhost:5000/api/events
Headers: Authorization: Bearer <admin_token>
Body: {
  "title": "TechFest 2026",
  "description": "Annual tech festival",
  "category": "technical",
  "date": "2026-03-15",
  "time": "10:00 AM",
  "venue": "Main Auditorium",
  "eligibility": {
    "department": ["All"],
    "year": [1, 2, 3, 4]
  }
}
```

### 5. View All Events
```bash
GET http://localhost:5000/api/events
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check connection string in `.env`
- Try connecting via MongoDB Compass to verify

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Next Steps

1. Read `POSTMAN_REQUESTS.md` for all API endpoints
2. Read `DOCUMENTATION.md` for technical details
3. Test all endpoints using Postman
4. View database in MongoDB Compass

## Support

For detailed API documentation, see:
- `README.md` - Full documentation
- `POSTMAN_REQUESTS.md` - API testing guide
- `DOCUMENTATION.md` - Technical explanation
