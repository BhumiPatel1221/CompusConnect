const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('./socketAuth');
const { registerChatbotHandlers } = require('./chatbotSocketController');

function initSockets(httpServer) {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5000',
        'https://compusconnectbackend.onrender.com',
        process.env.FRONTEND_URL,
    ].filter(Boolean);

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        registerChatbotHandlers(io, socket);
    });

    return io;
}

module.exports = { initSockets };
