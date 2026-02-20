const express = require('express');
const router = express.Router();

const { updateCompanyVisit } = require('../controllers/companyVisitController');
const { getApplicationsForCompanyVisit } = require('../controllers/companyVisitApplicationController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

// Spec alias routes
router.put('/:id', authorize('admin'), upload.single('companyLogo'), updateCompanyVisit);
router.get('/:id/applications', authorize('admin'), getApplicationsForCompanyVisit);

module.exports = router;
