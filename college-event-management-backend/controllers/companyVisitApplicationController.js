const CompanyVisitApplication = require('../models/CompanyVisitApplication');
const CompanyVisit = require('../models/CompanyVisit');

/**
 * @desc    Apply to a company visit
 * @route   POST /api/company-visit-applications
 * @access  Private/Student
 */
exports.applyToCompanyVisit = async (req, res, next) => {
    try {
        const { companyVisitId } = req.body;

        const visit = await CompanyVisit.findById(companyVisitId);
        if (!visit) {
            return res.status(404).json({ success: false, message: 'Company visit not found' });
        }

        if (visit.status !== 'scheduled') {
            return res.status(400).json({ success: false, message: 'Cannot apply. Visit is not scheduled.' });
        }

        if (visit.applicationDeadline && new Date() > new Date(visit.applicationDeadline)) {
            return res.status(400).json({ success: false, message: 'Application deadline has passed.' });
        }

        // Eligibility checks
        if (
            !visit.eligibility.department.includes('All') &&
            !visit.eligibility.department.includes(req.user.department)
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not eligible for this company visit (Department mismatch)',
            });
        }

        if (!visit.eligibility.year.includes(req.user.year)) {
            return res.status(403).json({
                success: false,
                message: 'You are not eligible for this company visit (Year mismatch)',
            });
        }

        if (visit.eligibility.minCGPA && req.user.cgpa !== undefined && req.user.cgpa < visit.eligibility.minCGPA) {
            return res.status(403).json({
                success: false,
                message: 'You are not eligible for this company visit (CGPA below minimum)',
            });
        }

        const application = await CompanyVisitApplication.create({
            companyVisit: companyVisitId,
            student: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Successfully applied to company visit',
            data: application,
        });
    } catch (error) {
        // Duplicate apply
        if (error && error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied to this company visit' });
        }
        next(error);
    }
};

/**
 * @desc    Get my company visit applications
 * @route   GET /api/company-visit-applications/my
 * @access  Private/Student
 */
exports.getMyCompanyVisitApplications = async (req, res, next) => {
    try {
        const applications = await CompanyVisitApplication.find({ student: req.user.id })
            .populate('companyVisit')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel company visit application
 * @route   DELETE /api/company-visit-applications/:id
 * @access  Private/Student
 */
exports.cancelCompanyVisitApplication = async (req, res, next) => {
    try {
        const application = await CompanyVisitApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.student.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this application' });
        }

        application.status = 'cancelled';
        await application.save();

        res.status(200).json({ success: true, message: 'Application cancelled', data: {} });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get company visit analytics
 * @route   GET /api/company-visit-applications/analytics
 * @access  Private/Admin
 */
exports.getCompanyVisitAnalytics = async (req, res, next) => {
    try {
        const totalApplications = await CompanyVisitApplication.countDocuments({ status: 'applied' });
        const totalCompanyVisits = await CompanyVisit.countDocuments({});

        const applicationsPerCompany = await CompanyVisitApplication.aggregate([
            { $match: { status: 'applied' } },
            {
                $lookup: {
                    from: 'companyvisits',
                    localField: 'companyVisit',
                    foreignField: '_id',
                    as: 'visit',
                },
            },
            { $unwind: '$visit' },
            {
                $group: {
                    _id: '$visit._id',
                    companyName: { $first: '$visit.companyName' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const applicationsPerVisit = applicationsPerCompany.map((x) => ({
            companyVisitId: x._id,
            companyName: x.companyName,
            count: x.count,
        }));

        // Eligible vs Applied (overall)
        const eligibleVisits = await CompanyVisit.countDocuments({ status: 'scheduled' });
        const appliedVisits = await CompanyVisitApplication.distinct('companyVisit', { status: 'applied' });
        const eligibleVsApplied = {
            eligibleVisits,
            appliedVisits: appliedVisits.length,
        };

        const now = new Date();
        const upcomingVsPast = await CompanyVisit.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [{ $gte: ['$visitDate', now] }, 'upcoming', 'past'],
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCompanyVisits,
                totalApplications,
                applicationsPerCompany: applicationsPerVisit,
                eligibleVsApplied,
                upcomingVsPast,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get applications for a company visit (Admin drilldown)
 * @route   GET /api/company-visits/:id/applications
 * @access  Private/Admin
 */
exports.getApplicationsForCompanyVisit = async (req, res, next) => {
    try {
        const visit = await CompanyVisit.findById(req.params.id);
        if (!visit) {
            return res.status(404).json({ success: false, message: 'Company visit not found' });
        }

        const applications = await CompanyVisitApplication.find({
            companyVisit: req.params.id,
            status: { $ne: 'cancelled' },
        })
            .populate('student', 'name email department year')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};
