const express = require('express');
const router = express.Router();
const {
    createCompanyVisit,
    getAllCompanyVisits,
    getCompanyVisitById,
    updateCompanyVisit,
    deleteCompanyVisit,
    getEligibleCompanyVisits,
    getUpcomingCompanyVisits,
} = require('../controllers/companyVisitController');
const { getApplicationsForCompanyVisit } = require('../controllers/companyVisitApplicationController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getAllCompanyVisits);
router.get('/upcoming', getUpcomingCompanyVisits);
router.get('/:id', getCompanyVisitById);

// Protected routes (students can view eligible visits)
router.get('/eligible/me', protect, getEligibleCompanyVisits);

// Admin only routes
router.post('/', protect, authorize('admin'), upload.single('companyLogo'), createCompanyVisit);
router.get('/:id/applications', protect, authorize('admin'), getApplicationsForCompanyVisit);
router.put('/:id', protect, authorize('admin'), upload.single('companyLogo'), updateCompanyVisit);
router.delete('/:id', protect, authorize('admin'), deleteCompanyVisit);

module.exports = router;
