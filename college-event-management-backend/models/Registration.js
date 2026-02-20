const mongoose = require('mongoose');

/**
 * Registration Schema
 * Stores student registrations for events
 */
const registrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event', // Reference to Event model
            required: [true, 'Event reference is required'],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to User model (student)
            required: [true, 'Student reference is required'],
        },
        registrationDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['registered', 'attended', 'cancelled'],
            default: 'registered',
        },
        feedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
                maxlength: [500, 'Feedback cannot be more than 500 characters'],
            },
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Compound index to prevent duplicate registrations
 * A student can register for an event only once
 */
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

/**
 * Index for faster queries
 */
registrationSchema.index({ student: 1 });
registrationSchema.index({ event: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
