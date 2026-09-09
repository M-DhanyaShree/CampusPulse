import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHandler.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    sendError(res, 'Database validation error', 400, err.message);
    return;
  }

  if (err.name === 'CastError') {
    // Mongoose ObjectId cast error
    sendError(res, `Invalid ID parameter format for ${err.path}`, 400, err.message);
    return;
  }

  if (err.code === 11000) {
    // Mongo duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `Duplicate value entered for unique property: ${field}`, 409);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid authorization token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Authorization token has expired', 401);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
}
