import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../routes/auth/utils';
import { UnauthorizedError } from '../utils/errors';

declare module 'express-serve-static-core' {
    interface Request {
        user: { id: string; email: string; name: string };
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

        req.user = userTokenData;

        next();
    } catch (error) {
        next(error);
    }
};
