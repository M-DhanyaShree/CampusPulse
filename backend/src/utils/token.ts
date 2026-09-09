import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '../constants/roles.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
}
