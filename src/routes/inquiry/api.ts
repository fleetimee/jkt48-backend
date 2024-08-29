import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { formatResponse } from '../../utils/response-formatter';
import { getInquiry } from '../packet/repository';

const router = express.Router();

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const packageId = req.params.id;

        const inquiryList = await getInquiry(packageId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches inquiry',
                data: inquiryList,
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
