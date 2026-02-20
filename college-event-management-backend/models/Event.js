const mongoose = require('mongoose');

/**
 * Event Schema
 * Stores information about college events
 */
const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide event title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide event description'],
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Please provide event category'],
            enum: {
                values: ['technical', 'cultural', 'sports', 'placement'],
                message: 'Category must be technical, cultural, sports, or placement',
            },
        },
        date: {
            type: Date,
            required: [true, 'Please provide event date'],
        },
        time: {
            type: String,
            required: [true, 'Please provide event time'],
        },
        venue: {
            type: String,
            required: [true, 'Please provide event venue'],
            trim: true,
        },
        eligibility: {
            department: {
                type: [String],
                default: ['All'], // All departments eligible by default
                enum: ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'],
            },
            year: {
                type: [Number],
                default: [1, 2, 3, 4], // All years eligible by default
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model (admin who created the event)
            required: true,
        },
        registrationCount: {
            type: Number,
            default: 0,
        },
        maxCapacity: {
            type: Number,
            default: null, // null means unlimited capacity
        },
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Index for faster queries
 * Create index on category and date for better performance
 */
eventSchema.index({ category: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
