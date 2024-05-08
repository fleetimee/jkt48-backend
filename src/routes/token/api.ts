import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { sendTokenToServer } from './repository';
import { sendTokenSchema } from './schema';

const router = express.Router();

router.post('/', validateSchema(sendTokenSchema), authenticateUser, async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        await sendTokenToServer(fcmToken, req.user.id);

        res.status(StatusCodes.OK).send(
            formatResponse({
                message: 'Token saved successfully',
                code: StatusCodes.OK,
                data: null,
                success: true,
            }),
        );
    } catch (error) {
        console.error('Error saving token:', error);
        next(error);
    }
});

export default router;
