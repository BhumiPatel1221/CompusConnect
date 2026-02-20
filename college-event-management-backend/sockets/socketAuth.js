const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function socketAuthMiddleware(socket, next) {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Unauthorized'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Unauthorized'));
        }

        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Unauthorized'));
    }
}

module.exports = { socketAuthMiddleware };
