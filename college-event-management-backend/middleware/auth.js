const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 * This middleware checks if user is authenticated
 */
exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Please login.',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database and attach to request object
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token invalid.',
            });
        }

        next(); // Proceed to next middleware/controller
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Token invalid or expired.',
            error: error.message,
        });
    }
};

/**
 * Authorize specific roles
 * This middleware checks if user has required role
 * @param  {...any} roles - Allowed roles (e.g., 'admin', 'student')
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
