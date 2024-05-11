import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { updateOrderStatusXenditCallback } from './repository';

const router = express.Router();

enum XenditRecurringStatus {
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
    try {
        const { body } = req;

        // Check if body is empty
        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        switch (body.event) {
            case XenditRecurringStatus.ACTIVATED:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'success', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.INACTIVATED:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'failed', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });
                break;
            case XenditRecurringStatus.CYCLE_SUCCEED:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'success', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_CREATED:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'success', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_RETRY:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'failed', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });

                break;
            case XenditRecurringStatus.CYCLE_FAILED:
                await updateOrderStatusXenditCallback(body.data.reference_id, 'failed', body);

                console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

                res.status(StatusCodes.OK).send({
                    message: 'Success Updating Order Status',
                });
                break;
        }
    } catch (error) {
        next(error);
    }
});

export default router;
