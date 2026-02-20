const mongoose = require('mongoose');

/**
 * Company Visit Schema
 * Stores information about company visits and placement opportunities
 */
const companyVisitSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, 'Please provide company name'],
            trim: true,
            maxlength: [100, 'Company name cannot be more than 100 characters'],
        },
        jobRole: {
            type: String,
            required: [true, 'Please provide job role'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide description'],
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        companyLogoUrl: {
            type: String,
            default: '',
        },
        eligibility: {
            department: {
                type: [String],
                required: [true, 'Please specify eligible departments'],
                enum: ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'],
            },
            year: {
                type: [Number],
                required: [true, 'Please specify eligible years'],
                validate: {
                    validator: function (years) {
                        return years.every((year) => year >= 1 && year <= 4);
                    },
                    message: 'Year must be between 1 and 4',
                },
            },
            minCGPA: {
                type: Number,
                default: 0,
                min: [0, 'CGPA cannot be negative'],
                max: [10, 'CGPA cannot be more than 10'],
            },
        },
        visitDate: {
            type: Date,
            required: [true, 'Please provide visit date'],
        },
        visitTime: {
            type: String,
            required: [true, 'Please provide visit time'],
        },
        venue: {
            type: String,
            required: [true, 'Please provide venue'],
            trim: true,
        },
        package: {
            type: String, // Salary package offered
            trim: true,
        },
        applicationDeadline: {
            type: Date,
        },
        contactPerson: {
            name: String,
            email: String,
            phone: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to admin who created this
            required: true,
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled',
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Index for faster queries
 */
companyVisitSchema.index({ visitDate: 1 });
companyVisitSchema.index({ companyName: 1 });

module.exports = mongoose.model('CompanyVisit', companyVisitSchema);
