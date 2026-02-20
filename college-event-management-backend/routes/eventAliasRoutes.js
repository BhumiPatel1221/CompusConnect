const express = require('express');
const router = express.Router();

const { getEventRegistrations } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Spec alias route
router.get('/:id/registrations', authorize('admin'), (req, res, next) => {
    req.params.eventId = req.params.id;
    return getEventRegistrations(req, res, next);
});

module.exports = router;
