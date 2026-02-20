const express = require('express');
const router = express.Router({ mergeParams: true });

const { getApplicationsForCompanyVisit } = require('../controllers/companyVisitApplicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/:id/applications', authorize('admin'), getApplicationsForCompanyVisit);

module.exports = router;
