import express from 'express';
import { StatusCodes } from 'http-status-codes';
import appleReceiptVerify from 'node-apple-receipt-verify';

import { validateSchema } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { appleVerifySchema } from './schema';

const router = express.Router();

router.post('/verify', async (req, res, next) => {
    try {
        const { body } = req;

        console.log('Apple Pay verify body', body);
    } catch (error) {
        next(error);
    }
});

router.post('/verifyApple', validateSchema(appleVerifySchema), async (req, res, next) => {
    try {
        const { receiptData } = req.body;

        const product = await appleReceiptVerify.validate({
            receipt: receiptData,
        });

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                data: product,
                message: 'Apple Pay verified successfully',
                success: true,
            }),
        );
    } catch (e) {
        if (e instanceof appleReceiptVerify.EmptyError) {
            // Return 400
            console.log('EmptyError');
        } else if (e instanceof appleReceiptVerify.ServiceUnavailableError) {
            // todo

            // Return 503
            throw new Error('ServiceUnavailableError');
        }

        next(e);
    }
});

export default router;
