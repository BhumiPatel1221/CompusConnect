const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('./socketAuth');
const { registerChatbotHandlers } = require('./chatbotSocketController');

function initSockets(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        registerChatbotHandlers(io, socket);
    });

    return io;
}

module.exports = { initSockets };
