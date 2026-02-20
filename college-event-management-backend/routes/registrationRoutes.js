const express = require('express');
const router = express.Router();
const {
    registerForEvent,
    getMyRegistrations,
    getAllRegistrations,
    getRegistrationById,
    cancelRegistration,
    submitFeedback,
    getEventRegistrations,
    getRegistrationAnalytics,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// All registration routes require authentication
router.use(protect);

// Student routes
router.post('/', registerForEvent);
router.get('/my-registrations', getMyRegistrations);

// Admin routes
router.get('/', authorize('admin'), getAllRegistrations);
router.get('/analytics', authorize('admin'), getRegistrationAnalytics);
router.get('/event/:eventId', authorize('admin'), getEventRegistrations);

// Registration by ID routes (keep after named routes like /analytics)
router.get('/:id', getRegistrationById);
router.delete('/:id', cancelRegistration);
router.put('/:id/feedback', submitFeedback);

module.exports = router;
