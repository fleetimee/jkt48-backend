import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const XENDIT_TOKEN = 'yPA3KQkzCl7lPNNTrGy2dmOOwmH18FPb4P9XUole67Q0UrvA';

export const verifyXenditToken = (req: Request, res: Response, next: NextFunction) => {
    const callbackToken = req.headers['X-CALLBACK-TOKEN'];

    if (!callbackToken || callbackToken !== XENDIT_TOKEN) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
            message: 'Unauthorized',
        });
    }

    next();
};
