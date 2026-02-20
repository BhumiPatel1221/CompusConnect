const express = require('express');
const router = express.Router();

const {
    applyToCompanyVisit,
    getMyCompanyVisitApplications,
    cancelCompanyVisitApplication,
    getCompanyVisitAnalytics,
} = require('../controllers/companyVisitApplicationController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Student
router.post('/', authorize('student'), applyToCompanyVisit);
router.get('/my', authorize('student'), getMyCompanyVisitApplications);
router.delete('/:id', authorize('student'), cancelCompanyVisitApplication);

// Admin
router.get('/analytics', authorize('admin'), getCompanyVisitAnalytics);

module.exports = router;
