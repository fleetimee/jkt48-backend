import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getTopIdol } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const topIdol = await getTopIdol();

        if (!topIdol || topIdol.length === 0) {
            res.status(404).send(
                formatResponse({
                    code: StatusCodes.NOT_FOUND,
                    message: 'No top idol found',
                    success: false,
                    data: [],
                }),
            );
        } else {
            res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success fetch top idol',
                    data: topIdol,
                    success: true,
                }),
            );
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
