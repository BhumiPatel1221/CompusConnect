const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores information about students and admins
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        // Student-specific fields
        department: {
            type: String,
            required: function () {
                return this.role === 'student';
            },
        },
        year: {
            type: String,
            required: function () {
                return this.role === 'student';
            },
        },
        interests: {
            type: [String],
            default: [],
        },
        // Admin-specific fields
        organization: {
            type: String,
            required: function () {
                return this.role === 'admin';
            },
        },
        position: {
            type: String,
            required: function () {
                return this.role === 'admin';
            },
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

/**
 * Hash password before saving to database
 * This middleware runs before save() operation
 */
userSchema.pre('save', async function () {
    // Only hash password if it's modified or new
    if (!this.isModified('password')) {
        return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method to compare entered password with hashed password in database
 * @param {String} enteredPassword - Password entered by user
 * @returns {Boolean} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
