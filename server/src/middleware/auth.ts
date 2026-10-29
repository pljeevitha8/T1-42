import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../db/store.js';
import { User, UserRole } from '../types/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'sketchtrace-super-secret-jwt-key-2026-hackathon';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = store.getUserById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User associated with this token no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log unauthorized access attempt for security audit trail
      store.addAuditLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UNAUTHORIZED_ACCESS',
        details: `Access denied to restricted endpoint ${req.method} ${req.originalUrl}. Required: [${allowedRoles.join(', ')}]`,
        ipAddress: req.ip || '127.0.0.1',
      });

      res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your current role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
