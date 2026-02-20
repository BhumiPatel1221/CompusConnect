const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const { initSockets } = require('./sockets');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server (required for Socket.IO)
const httpServer = http.createServer(app);

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS for all routes

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/event', require('./routes/eventAliasRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/company-visits', require('./routes/companyVisitRoutes'));
app.use('/api/company', require('./routes/companyAliasRoutes'));
app.use('/api/company-visit-applications', require('./routes/companyVisitApplicationRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to College Event Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            events: '/api/events',
            registrations: '/api/registrations',
            companyVisits: '/api/company-visits',
            companyVisitApplications: '/api/company-visit-applications',
        },
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`\n📚 Available Routes:`);
    console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
    console.log(`   - Events: http://localhost:${PORT}/api/events`);
    console.log(`   - Registrations: http://localhost:${PORT}/api/registrations`);
    console.log(`   - Company Visits: http://localhost:${PORT}/api/company-visits`);
    console.log(`\n✅ Server is ready to accept requests!\n`);
});

// Socket.IO init (after server starts)
initSockets(httpServer);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

module.exports = app;
