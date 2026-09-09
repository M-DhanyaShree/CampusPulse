import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from '../config/env.js';
import { verifyToken, TokenPayload } from '../utils/token.js';
import { logger } from '../utils/logger.js';

let io: SocketIOServer | null = null;

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      // Allow anonymous connection for public poll counters or public feed, but without user room
      return next();
    }
    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn('Socket connection token invalid, proceeding as guest');
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user?.userId || 'Guest'})`);

    // Join specific rooms based on user identity
    if (socket.user) {
      // User personal room
      socket.join(`user:${socket.user.userId}`);
      
      // Role room
      socket.join(`role:${socket.user.role}`);

      // Department room if assigned
      if (socket.user.departmentId) {
        socket.join(`dept:${socket.user.departmentId}`);
      }
    }

    // Join complaint discussion room
    socket.on('join:complaint', (complaintId: string) => {
      socket.join(`complaint:${complaintId}`);
      logger.debug(`Socket ${socket.id} joined complaint:${complaintId}`);
    });

    socket.on('leave:complaint', (complaintId: string) => {
      socket.leave(`complaint:${complaintId}`);
    });

    // Join live poll room
    socket.on('join:poll', (pollId: string) => {
      socket.join(`poll:${pollId}`);
    });

    socket.on('leave:poll', (pollId: string) => {
      socket.leave(`poll:${pollId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io server has not been initialized yet!');
  }
  return io;
}
