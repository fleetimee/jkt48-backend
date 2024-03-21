import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../routes/auth/utils';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

declare module 'express-serve-static-core' {
    interface Request {
        user: { id: string; email: string; name: string; roles: string };
    }
}

/**
 * Middleware function to authenticate the user.
 * It checks if the authorization token is present in the request headers,
 * verifies the token, and sets the user data in the request object.
 * If the token is missing or invalid, it throws an UnauthorizedError.
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction.
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new UnauthorizedError('Authorization token missing in request');

        const userTokenData = verifyToken(token);

        // Check if the user is marked as deleted
        if (userTokenData.isDeleted) {
            throw new UnauthorizedError(
                'Youre account has been deleted. Please contact support for further assistance.',
            );
        }

        req.user = userTokenData;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware function to require the 'member' role for a user.
 * If the user has the 'member' role, the next middleware function is called.
 * Otherwise, an UnauthorizedError is passed to the next middleware function.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const requireMemberRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.roles === 'member') {
        next();
    } else {
        next(new ForbiddenError('User does not have the required member role'));
    }
};

/**
 * Middleware function to require admin role for a user.
 * If the user has the admin role, the next middleware function is called.
 * Otherwise, an UnauthorizedError is passed to the next middleware function.
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction.
 */
export const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.roles === 'admin') {
        next();
    } else {
        next(new ForbiddenError('User does not have the required admin role'));
    }
};
