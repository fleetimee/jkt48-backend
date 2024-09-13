import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getTermsOfService } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const terms = await getTermsOfService();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches privacy policy',
                data: terms ? [terms] : [],
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
