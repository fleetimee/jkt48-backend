import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { updateOrderStatusXenditCallback, updateOrderStatusXenditSubscriptionCallback } from './repository';

const router = express.Router();

export enum XenditRecurringStatus {
    ACTIVATED = 'recurring.plan.activated',
    INACTIVATED = 'recurring.plan.inactivated',
    CYCLE_SUCCEED = 'recurring.cycle.succeeded',
    CYCLE_CREATED = 'recurring.cycle.created',
    CYCLE_RETRY = 'recurring.cycle.retrying',
    CYCLE_FAILED = 'recurring.cycle.failed',
}

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
            await updateOrderStatusXenditCallback(body.external_id, 'success', body);

            res.status(StatusCodes.OK).send({
                message: 'Xendit callback received',
            });
        } else if (body.status === 'FAILED') {
            await updateOrderStatusXenditCallback(body.external_id, 'failed', body);
        }

        res.status(StatusCodes.BAD_REQUEST).send({
            message: 'Invalid status',
        });
    } catch (error) {
        next(error);
    }
});

router.post('/handleRecurringPayment', async (req, res, next) => {
    const webhookToken = 'gzx5Y8CUbh6Mm4FmwITYrW9kV39VBD1x8i4Iodvisy03x3M1';

    try {
        const { body } = req;

        const xCallbackToken = req.headers['x-callback-token'];
        const webhookId = req.headers['webhook-id'];

        // Check if body is empty
        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        // Check if x-callback-token is empty
        if (!xCallbackToken) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid x-callback-token',
            });
        }

        // Check if webhook-id is empty
        if (!webhookId) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid webhook-id',
            });
        }

        // Check if x-callback-token is invalid
        if (xCallbackToken !== webhookToken) {
            res.status(StatusCodes.UNAUTHORIZED).send({
                message: 'Invalid x-callback-token',
            });
        }

        if (webhookId !== webhookId) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid webhook-id',
            });
        }

        switch (body.event) {
            case XenditRecurringStatus.ACTIVATED:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.ACTIVATED,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.INACTIVATED:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.INACTIVATED,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });
                break;
            case XenditRecurringStatus.CYCLE_SUCCEED:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.CYCLE_SUCCEED,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_CREATED:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.CYCLE_CREATED,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_RETRY:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.CYCLE_RETRY,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_FAILED:
                await updateOrderStatusXenditSubscriptionCallback(
                    body.data.reference_id,
                    XenditRecurringStatus.CYCLE_FAILED,
                    body,
                );

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });
                break;
        }
    } catch (error) {
        console.log(error);

        next(error);
    }
});

export default router;
