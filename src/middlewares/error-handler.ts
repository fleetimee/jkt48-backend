import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../utils/errors';

/**
 * Error handler middleware.
 *
 * @param error - The error object.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next();

    let status = 500;
    let message = 'Internal Server Error';

    if (error instanceof CustomError) {
        message = error.message;
        status = error.status;
    }

    return res.status(status).json({ error: message });
};
