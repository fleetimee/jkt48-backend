import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { updateOrderStatusXenditCallback } from './repository';

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { body } = req;

        // Check if body is empty
        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (body.status === 'PAID') {
            console.log('Xendit callback:', body);

            await updateOrderStatusXenditCallback(body.external_id, 'success');

            res.status(StatusCodes.OK).send({
                message: 'Xendit callback received',
            });
        } else if (body.status === 'FAILED') {
            console.log('Xendit callback:', body);

            await updateOrderStatusXenditCallback(body.external_id, 'failed');
        }

        res.status(StatusCodes.BAD_REQUEST).send({
            message: 'Invalid status',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
