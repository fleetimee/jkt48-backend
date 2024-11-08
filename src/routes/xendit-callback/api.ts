import express from 'express';
import { messaging } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';

import { verifyXenditToken } from '../../middlewares/xendit-auth';
import { fetchIdolIdByOrderId } from '../order/repository';
import { fetchFcmTokenByOrderId } from '../token/repository';
import {
    deleteOrderStatusXenditCallback,
    updateOrderStatusXenditCallback,
    updateOrderStatusXenditSubscriptionCallback,
} from './repository';

const router = express.Router();

export enum XenditRecurringStatus {
    ACTIVATED = 'recurring.plan.activated',
    INACTIVATED = 'recurring.plan.inactivated',
    CYCLE_SUCCEED = 'recurring.cycle.succeeded',
    CYCLE_CREATED = 'recurring.cycle.created',
    CYCLE_RETRY = 'recurring.cycle.retrying',
    CYCLE_FAILED = 'recurring.cycle.failed',
    PAYMENT_ACTIVATED = 'payment_method.activated',
}

router.post('/', verifyXenditToken, async (req, res, next) => {
    try {
        const { body } = req;

        // Check if body is empty
        if (!body) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        switch (body.status) {
            case 'PAID': {
                await updateOrderStatusXenditCallback(body.external_id, 'success', body);

                // Fetch the FCM tokens and the idol ID associated with the order
                const [tokens, idolId] = await Promise.all([
                    fetchFcmTokenByOrderId(body.external_id),
                    fetchIdolIdByOrderId(body.external_id),
                ]);

                if (tokens.length > 0 && idolId) {
                    const subscribePromises = tokens.map(tokenRecord => {
                        const token = tokenRecord.token as string;
                        const topicName = `idol_${idolId.idol_id}`;
                        return messaging().subscribeToTopic(token, topicName);
                    });

                    // Wait for all subscriptions to complete
                    await Promise.all(subscribePromises);
                    console.log(`Successfully subscribed tokens to topic idol_${idolId.idol_id}`);
                }

                return res.status(StatusCodes.OK).send({
                    message: 'Xendit callback received for successful payment',
                });
            }

            case 'FAILED': {
                await updateOrderStatusXenditCallback(body.external_id, 'failed', body);

                return res.status(StatusCodes.OK).send({
                    message: 'Xendit callback received for failed payment',
                });
            }

            case 'EXPIRED': {
                await deleteOrderStatusXenditCallback(body.external_id);

                return res.status(StatusCodes.OK).send({
                    message: 'Xendit callback received for expired payment',
                });
            }

            default:
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid status received',
                });
        }

        return res.status(StatusCodes.BAD_REQUEST).send({
            message: 'Invalid status',
        });
    } catch (error) {
        console.error('Error processing Xendit callback:', error);
        next(error);
    }
});

router.post('/handleRecurringPayment', async (req, res, next) => {
    const webhookToken = 'yPA3KQkzCl7lPNNTrGy2dmOOwmH18FPb4P9XUole67Q0UrvA';

    try {
        const { body } = req;

        const xCallbackToken = req.headers['x-callback-token'];
        const webhookId = req.headers['webhook-id'];

        if (!body) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (!xCallbackToken || xCallbackToken !== webhookToken) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid x-callback-token',
            });
        }

        if (!webhookId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid webhook-id',
            });
        }

        if (
            body.event === XenditRecurringStatus.ACTIVATED ||
            body.event === XenditRecurringStatus.INACTIVATED ||
            body.event === XenditRecurringStatus.CYCLE_SUCCEED ||
            body.event === XenditRecurringStatus.CYCLE_CREATED ||
            body.event === XenditRecurringStatus.CYCLE_RETRY ||
            body.event === XenditRecurringStatus.CYCLE_FAILED
        ) {
            await updateOrderStatusXenditSubscriptionCallback(body.data.reference_id, body.event, body);

            console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

            return res.status(StatusCodes.OK).send({
                message: 'Success Updating Order Status',
            });
        } else {
            throw new Error(`Invalid event: ${body.event}`);
        }
    } catch (error) {
        console.log(error);

        next(error);
    }
});

router.post('/handlePaymentMethod', async (req, res, next) => {
    try {
        const { body } = req;

        if (!body) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (body.event === XenditRecurringStatus.PAYMENT_ACTIVATED) {
            console.log(`Payment method created ${body.data.type}`);

            return res.status(StatusCodes.OK).send({
                message: 'Payment Method Linked Successfully',
            });
        }
    } catch (error) {
        console.log(error);

        next(error);
    }
});

export default router;
