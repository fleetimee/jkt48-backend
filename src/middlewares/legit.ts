import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../utils/response-formatter';

export const verifyCustomHeader = (req: Request, res: Response, next: NextFunction) => {
    const serverKey = process.env.SERVER_KEY;
    const clientKey = req.headers['x-server-key'];

    if (clientKey === serverKey) {
        next();
    } else {
        return res.status(StatusCodes.UNAUTHORIZED).send(
            formatResponse({
                success: false,
                code: StatusCodes.UNAUTHORIZED,
                message: 'Unauthorized access',
                data: null,
            }),
        );
    }
};
