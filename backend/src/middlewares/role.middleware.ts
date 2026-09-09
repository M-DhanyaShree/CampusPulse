import { Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.js';
import { AuthenticatedRequest } from './auth.middleware.js';
import { sendError } from '../utils/responseHandler.js';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      // Super Admin bypasses all role restrictions
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
}

export function requireSameDepartmentOrManagement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (
    req.user.role === UserRole.SUPER_ADMIN ||
    req.user.role === UserRole.MANAGEMENT
  ) {
    return next();
  }

  const targetDeptId = req.params.departmentId || req.body.departmentId || req.query.departmentId;

  if (
    req.user.role === UserRole.DEPT_ADMIN &&
    req.user.departmentId &&
    targetDeptId &&
    req.user.departmentId.toString() === targetDeptId.toString()
  ) {
    return next();
  }

  sendError(
    res,
    'Access denied. You can only manage complaints within your assigned department.',
    403
  );
}
