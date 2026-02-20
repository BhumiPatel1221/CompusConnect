const Event = require('../models/Event');
const Registration = require('../models/Registration');

/**
 * @desc    Get all events (with filters)
 * @route   GET /api/events
 * @access  Public
 */
exports.getEvents = async (req, res, next) => {
    try {
        // Build query
        let query = {};

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            query.date = {};
            if (req.query.startDate) {
                query.date.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.date.$lte = new Date(req.query.endDate);
            }
        }

        // Execute query with pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('createdBy', 'name email')
            .sort({ date: 1 })
            .limit(limit)
            .skip(startIndex);

        res.status(200).json({
            success: true,
            count: events.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private/Admin
 */
exports.createEvent = async (req, res, next) => {
    try {
        console.log('📝 Creating new event...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user?.id);

        // Add user (admin) to req.body
        req.body.createdBy = req.user.id;

        // Fix eligibility structure if department/year are sent as top-level fields
        if (req.body.department || req.body.year) {
            console.log('⚠️  Restructuring eligibility data...');
            req.body.eligibility = {
                department: req.body.department || ['All'],
                year: req.body.year || [1, 2, 3, 4]
            };
            // Remove top-level department and year
            delete req.body.department;
            delete req.body.year;
        }

        // Ensure eligibility has default values if not provided
        if (!req.body.eligibility) {
            req.body.eligibility = {
                department: ['All'],
                year: [1, 2, 3, 4]
            };
        }

        console.log('Creating event with data:', JSON.stringify(req.body, null, 2));

        // Create the event
        const event = await Event.create(req.body);

        console.log('✅ Event created successfully in DB:', event._id);
        console.log('Event data:', JSON.stringify(event, null, 2));

        // Verify the event was saved by querying it back
        const savedEvent = await Event.findById(event._id);
        console.log('🔍 Verification - Event found in DB:', savedEvent ? 'YES' : 'NO');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        });
    } catch (error) {
        console.error('❌ Error creating event:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        next(error);
    }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private/Admin
 */
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Make sure user is event creator
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event',
            });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private/Admin
 */
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Make sure user is event creator
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event',
            });
        }

        // Delete all registrations for this event
        await Registration.deleteMany({ event: req.params.id });

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event and related registrations deleted successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get recommended events for student based on interests
 * @route   GET /api/events/recommendations
 * @access  Private/Student
 */
exports.getRecommendedEvents = async (req, res, next) => {
    try {
        const user = req.user;

        // Find events matching user's interests, department, and year
        const events = await Event.find({
            category: { $in: user.interests },
            'eligibility.department': { $in: ['All', user.department] },
            'eligibility.year': user.year,
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .populate('createdBy', 'name email')
            .sort({ date: 1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get upcoming events
 * @route   GET /api/events/upcoming
 * @access  Public
 */
exports.getUpcomingEvents = async (req, res, next) => {
    try {
        const events = await Event.find({
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .populate('createdBy', 'name email')
            .sort({ date: 1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

// Aliases to match route naming
exports.getAllEvents = exports.getEvents;
exports.getEventById = exports.getEvent;
