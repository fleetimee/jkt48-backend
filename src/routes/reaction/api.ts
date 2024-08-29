import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getReactions } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const reactions = await getReactions();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Reactions fetched successfully',
                data: reactions,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
