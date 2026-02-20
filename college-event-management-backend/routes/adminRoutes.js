const express = require('express');
const router = express.Router();

const { getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', authorize('admin'), getAdminStats);

module.exports = router;
