const CompanyVisit = require('../models/CompanyVisit');

/**
 * @desc    Get all company visits (with filters)
 * @route   GET /api/company-visits
 * @access  Public
 */
exports.getCompanyVisits = async (req, res, next) => {
    try {
        let query = {};

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            query.visitDate = {};
            if (req.query.startDate) {
                query.visitDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.visitDate.$lte = new Date(req.query.endDate);
            }
        }

        const companyVisits = await CompanyVisit.find(query)
            .populate('createdBy', 'name email')
            .sort({ visitDate: 1 });

        res.status(200).json({
            success: true,
            count: companyVisits.length,
            data: companyVisits,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single company visit by ID
 * @route   GET /api/company-visits/:id
 * @access  Public
 */
exports.getCompanyVisit = async (req, res, next) => {
    try {
        const companyVisit = await CompanyVisit.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!companyVisit) {
            return res.status(404).json({
                success: false,
                message: 'Company visit not found',
            });
        }

        res.status(200).json({
            success: true,
            data: companyVisit,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new company visit
 * @route   POST /api/company-visits
 * @access  Private/Admin
 */
exports.createCompanyVisit = async (req, res, next) => {
    try {
        console.log('🏢 Creating new company visit...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user?.id);

        // Handle company logo upload
        if (req.file) {
            const host = req.get('host');
            const protocol = req.protocol;
            req.body.companyLogoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        // Add user (admin) to req.body
        req.body.createdBy = req.user.id;

        // Handle multipart/form-data where nested objects may arrive as strings
        if (typeof req.body.eligibility === 'string') {
            try {
                req.body.eligibility = JSON.parse(req.body.eligibility);
            } catch {
                // ignore
            }
        }

        if (typeof req.body.contactPerson === 'string') {
            try {
                req.body.contactPerson = JSON.parse(req.body.contactPerson);
            } catch {
                // ignore
            }
        }

        // Fix eligibility structure if department/year/minCGPA are sent as top-level fields
        if (req.body.department || req.body.year || req.body.minCGPA !== undefined) {
            console.log('⚠️  Restructuring eligibility data...');
            req.body.eligibility = {
                department: req.body.department || ['All'],
                year: req.body.year || [4],
                minCGPA: req.body.minCGPA !== undefined ? req.body.minCGPA : 0
            };
            // Remove top-level fields
            delete req.body.department;
            delete req.body.year;
            delete req.body.minCGPA;
        }

        // Ensure eligibility has required values if not provided
        if (!req.body.eligibility) {
            req.body.eligibility = {
                department: ['All'],
                year: [4],
                minCGPA: 0
            };
        }

        // Normalize eligibility types
        if (req.body.eligibility && Array.isArray(req.body.eligibility.year)) {
            req.body.eligibility.year = req.body.eligibility.year.map((y) => Number(y));
        }
        if (req.body.eligibility && req.body.eligibility.minCGPA !== undefined) {
            req.body.eligibility.minCGPA = Number(req.body.eligibility.minCGPA);
        }

        console.log('Creating company visit with data:', JSON.stringify(req.body, null, 2));

        const companyVisit = await CompanyVisit.create(req.body);

        console.log('✅ Company visit created successfully in DB:', companyVisit._id);
        console.log('Company visit data:', JSON.stringify(companyVisit, null, 2));

        // Verify the company visit was saved by querying it back
        const savedVisit = await CompanyVisit.findById(companyVisit._id);
        console.log('🔍 Verification - Company visit found in DB:', savedVisit ? 'YES' : 'NO');

        res.status(201).json({
            success: true,
            message: 'Company visit created successfully',
            data: companyVisit,
        });
    } catch (error) {
        console.error('❌ Error creating company visit:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        next(error);
    }
};

/**
 * @desc    Update company visit
 * @route   PUT /api/company-visits/:id
 * @access  Private/Admin
 */
exports.updateCompanyVisit = async (req, res, next) => {
    try {
        let companyVisit = await CompanyVisit.findById(req.params.id);

        if (!companyVisit) {
            return res.status(404).json({
                success: false,
                message: 'Company visit not found',
            });
        }

        // Handle multipart/form-data where nested objects may arrive as strings
        const updateData = { ...req.body };

        // Normalize eligibility if sent as JSON string
        if (typeof updateData.eligibility === 'string') {
            try {
                updateData.eligibility = JSON.parse(updateData.eligibility);
            } catch {
                // ignore
            }
        }

        if (typeof updateData.contactPerson === 'string') {
            try {
                updateData.contactPerson = JSON.parse(updateData.contactPerson);
            } catch {
                // ignore
            }
        }

        // Normalize eligibility structure if department/year/minCGPA are sent as top-level fields
        if (updateData.department || updateData.year || updateData.minCGPA !== undefined) {
            updateData.eligibility = {
                department: updateData.department || (updateData.eligibility?.department ?? ['All']),
                year: updateData.year || (updateData.eligibility?.year ?? [4]),
                minCGPA: updateData.minCGPA !== undefined ? updateData.minCGPA : (updateData.eligibility?.minCGPA ?? 0),
            };
            delete updateData.department;
            delete updateData.year;
            delete updateData.minCGPA;
        }

        // Convert year values if they come as strings
        if (updateData.eligibility && Array.isArray(updateData.eligibility.year)) {
            updateData.eligibility.year = updateData.eligibility.year.map((y) => Number(y));
        }
        if (updateData.eligibility && updateData.eligibility.minCGPA !== undefined) {
            updateData.eligibility.minCGPA = Number(updateData.eligibility.minCGPA);
        }

        // Handle company logo upload
        if (req.file) {
            const host = req.get('host');
            const protocol = req.protocol;
            updateData.companyLogoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        companyVisit = await CompanyVisit.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Company visit updated successfully',
            data: companyVisit,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete company visit
 * @route   DELETE /api/company-visits/:id
 * @access  Private/Admin
 */
exports.deleteCompanyVisit = async (req, res, next) => {
    try {
        const companyVisit = await CompanyVisit.findById(req.params.id);

        if (!companyVisit) {
            return res.status(404).json({
                success: false,
                message: 'Company visit not found',
            });
        }

        await companyVisit.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Company visit deleted successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get eligible company visits for student
 * @route   GET /api/company-visits/eligible
 * @access  Private/Student
 */
exports.getEligibleCompanyVisits = async (req, res, next) => {
    try {
        const user = req.user;

        // Find company visits matching user's department and year
        const companyVisits = await CompanyVisit.find({
            'eligibility.department': { $in: ['All', user.department] },
            'eligibility.year': user.year,
            status: 'scheduled',
            visitDate: { $gte: new Date() },
        })
            .populate('createdBy', 'name email')
            .sort({ visitDate: 1 });

        res.status(200).json({
            success: true,
            count: companyVisits.length,
            data: companyVisits,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get upcoming company visits
 * @route   GET /api/company-visits/upcoming
 * @access  Public
 */
exports.getUpcomingCompanyVisits = async (req, res, next) => {
    try {
        const companyVisits = await CompanyVisit.find({
            status: 'scheduled',
            visitDate: { $gte: new Date() },
        })
            .populate('createdBy', 'name email')
            .sort({ visitDate: 1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: companyVisits.length,
            data: companyVisits,
        });
    } catch (error) {
        next(error);
    }
};

// Aliases to match route naming
exports.getAllCompanyVisits = exports.getCompanyVisits;
exports.getCompanyVisitById = exports.getCompanyVisit;
