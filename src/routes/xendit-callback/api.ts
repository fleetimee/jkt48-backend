import express from 'express';

import { updateOrderStatusXenditCallback } from './repository';

const router = express.Router();

router.post('/xendit-callback', async (req, res, next) => {
    try {
        const { body } = req;

        if (body.status === 'PAID') {
            console.log('Xendit callback:', body);

            await updateOrderStatusXenditCallback(body.external_id, 'success');
        } else if (body.status === 'FAILED') {
            console.log('Xendit callback:', body);

            await updateOrderStatusXenditCallback(body.external_id, 'failed');
        }

        res.status(200).send({
            message: 'Xendit callback received',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
