import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string | null;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  errorDetails?: string | unknown
): Response {
  const payload: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    error: typeof errorDetails === 'string' ? errorDetails : (errorDetails ? JSON.stringify(errorDetails) : undefined),
  };
  return res.status(statusCode).json(payload);
}
