import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import prisma from '../prisma';

// Extend the Request type to include the user property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Not authorized, no token'));
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new UnauthorizedError('Not authorized, token failed'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true }, // Only select necessary fields
    });

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    if (user.status === 'SUSPENDED') {
      return next(new ForbiddenError('Your account has been suspended.'));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return next(new UnauthorizedError('Not authorized, token failed'));
  }
};

export const optionalProtect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(); // Continue without setting user
  }

  try {
    const decoded = verifyToken(token);
    if (decoded) {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, status: true },
        });
        if (user && user.status !== 'SUSPENDED') {
            req.user = { id: user.id, role: user.role };
        }
    }
  } catch (error) {
    // Ignore invalid tokens in optional auth
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`User role ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
};