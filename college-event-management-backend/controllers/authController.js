const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwtToken');

/**
 * @desc    Register a new user (Student or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, department, year, interests, organization, position } =
            req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Create user with role-specific fields
        const userData = {
            name,
            email,
            password,
            role: role || 'student',
        };

        // Add student-specific fields
        if (role === 'student') {
            userData.department = department;
            userData.year = year;
            userData.interests = interests || [];
        }

        // Add admin-specific fields
        if (role === 'admin') {
            userData.organization = organization;
            userData.position = position;
        }

        const user = await User.create(userData);

        // Send token response
        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check if user exists (include password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        // req.user is set by protect middleware
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updateprofile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const fieldsToUpdate = {};

        if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
        if (req.body.email !== undefined) fieldsToUpdate.email = req.body.email;

        if (currentUser.role === 'student') {
            if (req.body.department !== undefined) fieldsToUpdate.department = req.body.department;
            if (req.body.year !== undefined) fieldsToUpdate.year = req.body.year;
            if (req.body.interests !== undefined) fieldsToUpdate.interests = req.body.interests;
        }

        if (currentUser.role === 'admin') {
            if (req.body.organization !== undefined) fieldsToUpdate.organization = req.body.organization;
            if (req.body.position !== undefined) fieldsToUpdate.position = req.body.position;
        }

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Alias for getMe to match route naming
exports.getProfile = exports.getMe;
