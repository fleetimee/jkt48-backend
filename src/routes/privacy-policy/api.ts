import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getPrivacyPolicy } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const privacyPolicy = await getPrivacyPolicy();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches privacy policy',
                data: privacyPolicy ? [privacyPolicy] : [],
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
