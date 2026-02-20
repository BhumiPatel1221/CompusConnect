const Registration = require('../models/Registration');
const Event = require('../models/Event');

/**
 * @desc    Register for an event
 * @route   POST /api/registrations
 * @access  Private/Student
 */
exports.registerForEvent = async (req, res, next) => {
    try {
        console.log('📝 Student registering for event...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Student ID:', req.user?.id);

        const { eventId } = req.body;
        const studentId = req.user.id;

        console.log('Event ID:', eventId);
        console.log('Student ID:', studentId);

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.log('❌ Event not found:', eventId);
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        console.log('✅ Event found:', event.title);

        // Check if event is upcoming
        if (event.status !== 'upcoming') {
            console.log('❌ Event is not upcoming. Status:', event.status);
            return res.status(400).json({
                success: false,
                message: 'Cannot register for this event. Event is not upcoming.',
            });
        }

        // Check eligibility - Department
        if (
            !event.eligibility.department.includes('All') &&
            !event.eligibility.department.includes(req.user.department)
        ) {
            console.log('❌ Department eligibility failed');
            console.log('Event departments:', event.eligibility.department);
            console.log('Student department:', req.user.department);
            return res.status(403).json({
                success: false,
                message: 'You are not eligible for this event (Department mismatch)',
            });
        }

        // Check eligibility - Year
        if (!event.eligibility.year.includes(req.user.year)) {
            console.log('❌ Year eligibility failed');
            console.log('Event years:', event.eligibility.year);
            console.log('Student year:', req.user.year);
            return res.status(403).json({
                success: false,
                message: 'You are not eligible for this event (Year mismatch)',
            });
        }

        console.log('✅ Eligibility checks passed');

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            event: eventId,
            student: studentId,
        });

        if (existingRegistration) {
            console.log('❌ Already registered:', existingRegistration._id);
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event',
            });
        }

        // Check capacity
        if (event.maxCapacity && event.registrationCount >= event.maxCapacity) {
            console.log('❌ Event is full');
            console.log('Max capacity:', event.maxCapacity);
            console.log('Current registrations:', event.registrationCount);
            return res.status(400).json({
                success: false,
                message: 'Event is full. Registration closed.',
            });
        }

        console.log('Creating registration...');

        // Create registration
        const registration = await Registration.create({
            event: eventId,
            student: studentId,
        });

        console.log('✅ Registration created successfully in DB:', registration._id);

        // Update event registration count
        event.registrationCount += 1;
        await event.save();

        console.log('✅ Event registration count updated:', event.registrationCount);

        // Verify the registration was saved by querying it back
        const savedRegistration = await Registration.findById(registration._id);
        console.log('🔍 Verification - Registration found in DB:', savedRegistration ? 'YES' : 'NO');

        res.status(201).json({
            success: true,
            message: 'Successfully registered for the event',
            data: registration,
        });
    } catch (error) {
        console.error('❌ Error registering for event:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        next(error);
    }
};

/**
 * @desc    Get all registrations for a student
 * @route   GET /api/registrations/my-registrations
 * @access  Private/Student
 */
exports.getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({
            student: req.user.id,
        })
            .populate('event')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get event registration analytics (Admin)
 * @route   GET /api/registrations/analytics
 * @access  Private/Admin
 */
exports.getRegistrationAnalytics = async (req, res, next) => {
    try {
        const totalEventRegistrations = await Registration.countDocuments({ status: { $ne: 'cancelled' } });

        const registrationsPerEvent = await Registration.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $lookup: {
                    from: 'events',
                    localField: 'event',
                    foreignField: '_id',
                    as: 'event',
                },
            },
            { $unwind: '$event' },
            {
                $group: {
                    _id: '$event._id',
                    title: { $first: '$event.title' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEventRegistrations,
                registrationsPerEvent: registrationsPerEvent.map((x) => ({
                    eventId: x._id,
                    title: x.title,
                    count: x.count,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all registrations for an event (Admin only)
 * @route   GET /api/registrations/event/:eventId
 * @access  Private/Admin
 */
exports.getEventRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({
            event: req.params.eventId,
        })
            .populate('student', 'name email department year')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel registration
 * @route   DELETE /api/registrations/:id
 * @access  Private/Student
 */
exports.cancelRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found',
            });
        }

        // Make sure user owns the registration
        if (registration.student.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this registration',
            });
        }

        // Update registration status
        registration.status = 'cancelled';
        await registration.save();

        // Decrease event registration count
        const event = await Event.findById(registration.event);
        if (event) {
            event.registrationCount = Math.max(0, event.registrationCount - 1);
            await event.save();
        }

        res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update registration status (Admin only)
 * @route   PUT /api/registrations/:id/status
 * @access  Private/Admin
 */
exports.updateRegistrationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Registration status updated',
            data: registration,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add feedback for an event
 * @route   PUT /api/registrations/:id/feedback
 * @access  Private/Student
 */
exports.addFeedback = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found',
            });
        }

        // Make sure user owns the registration
        if (registration.student.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add feedback',
            });
        }

        // Update feedback
        registration.feedback = { rating, comment };
        await registration.save();

        res.status(200).json({
            success: true,
            message: 'Feedback added successfully',
            data: registration,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all registrations (Admin only)
 * @route   GET /api/registrations
 * @access  Private/Admin
 */
exports.getAllRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find()
            .populate('event', 'title date')
            .populate('student', 'name email department year')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single registration by ID
 * @route   GET /api/registrations/:id
 * @access  Private
 */
exports.getRegistrationById = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('event')
            .populate('student', 'name email department year');

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found',
            });
        }

        // Make sure user owns the registration or is admin
        if (
            registration.student._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this registration',
            });
        }

        res.status(200).json({
            success: true,
            data: registration,
        });
    } catch (error) {
        next(error);
    }
};

// Alias for addFeedback to match route naming
exports.submitFeedback = exports.addFeedback;
