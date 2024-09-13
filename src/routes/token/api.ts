import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { deleteStaleFcmTokens, removeFcmTokensByUserIdAndDeviceModel, sendTokenToServer } from './repository';
import { begoneTokenSchema, sendTokenSchema } from './schema';

const router = express.Router();

router.get('/removeStaleTokens', async (req, res, next) => {
    try {
        // Remove stale tokens
        await deleteStaleFcmTokens();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Stale tokens removed',
                data: null,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/', validateSchema(sendTokenSchema), authenticateUser, async (req, res, next) => {
    try {
        const { fcmToken, model } = req.body;

        await sendTokenToServer(fcmToken, req.user.id, model || '');

        return res.status(StatusCodes.OK).send(
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

router.post('/tokenBegone', validateSchema(begoneTokenSchema), authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const { userId, model } = req.body;

        if (id !== userId) {
            return res.status(StatusCodes.FORBIDDEN).send(
                formatResponse({
                    message: 'You do not have permission to delete this token',
                    code: StatusCodes.FORBIDDEN,
                    data: null,
                    success: false,
                }),
            );
        }

        await removeFcmTokensByUserIdAndDeviceModel(userId, model);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                message: 'No more token for you!',
                code: StatusCodes.OK,
                data: null,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
