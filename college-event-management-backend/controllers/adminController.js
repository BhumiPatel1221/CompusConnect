const User = require('../models/User');
const Event = require('../models/Event');
const CompanyVisit = require('../models/CompanyVisit');
const Registration = require('../models/Registration');
const CompanyVisitApplication = require('../models/CompanyVisitApplication');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getAdminStats = async (req, res, next) => {
    try {
        const [
            totalEvents,
            totalCompanyVisits,
            totalStudents,
            totalRegistrations,
            totalApplications,
        ] = await Promise.all([
            Event.countDocuments({}),
            CompanyVisit.countDocuments({}),
            User.countDocuments({ role: 'student' }),
            Registration.countDocuments({ status: { $ne: 'cancelled' } }),
            CompanyVisitApplication.countDocuments({ status: { $ne: 'cancelled' } }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEvents,
                totalCompanyVisits,
                totalStudents,
                totalRegistrations,
                totalApplications,
            },
        });
    } catch (error) {
        next(error);
    }
};
