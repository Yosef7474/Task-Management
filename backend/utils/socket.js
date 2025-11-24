const { Server } = require('socket.io');
const { verifyToken } = require('./authUtils');

let io;
const userSockets = new Map();

const registerSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId) || new Set();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
};

const removeSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return;
  }
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
  }
};

const setupSocket = (server) => {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const headerToken =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : undefined;
      const token = socket.handshake.auth?.token || headerToken;

      if (!token) {
        return next(new Error('Authentication error: missing token'));
      }

      const decoded = verifyToken(token);
      const userId = Number(decoded.userId);

      if (!userId) {
        return next(new Error('Authentication error: invalid user'));
      }

      socket.user = { id: userId };
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    registerSocket(userId, socket.id);

    socket.on('disconnect', () => {
      removeSocket(userId, socket.id);
    });
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io) {
    return;
  }
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return;
  }
  sockets.forEach((socketId) => io.to(socketId).emit(event, payload));
};

const getIO = () => io;

module.exports = {
  setupSocket,
  emitToUser,
  getIO,
};

