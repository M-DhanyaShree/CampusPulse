import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token.js';
import { sendError } from '../utils/responseHandler.js';
import { User } from '../models/User.model.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // Optionally verify user is active
    const user = await User.findById(decoded.userId).select('isActive role departmentId').lean();
    if (!user || !user.isActive) {
      sendError(res, 'User account is deactivated or not found.', 401);
      return;
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired authentication token.', 401, error.message);
  }
}
