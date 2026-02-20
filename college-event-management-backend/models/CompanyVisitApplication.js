const mongoose = require('mongoose');

/**
 * Company Visit Application Schema
 * Stores applications by students for company visits
 */
const companyVisitApplicationSchema = new mongoose.Schema(
    {
        companyVisit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CompanyVisit',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['applied', 'cancelled'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

companyVisitApplicationSchema.index({ companyVisit: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('CompanyVisitApplication', companyVisitApplicationSchema);
