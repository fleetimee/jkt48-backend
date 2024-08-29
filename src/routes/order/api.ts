import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { deleteFcmTokensByUserId } from '../token/repository';
import { checkUserSubscription } from '../user/repository';
import {
    createOrder,
    createOrderAppleResubscribe,
    getExpiredOrders,
    getInquiryOrder,
    getInquiryOrderListIdol,
    getOrderById,
    updateAppleOriginalTransactionId,
    updateExpiredOrderStatus,
    updateGooglePurchaseToken,
    updateOrderStatusGpay,
} from './repository';
import {
    createOrderSchema,
    updateAppleOriginalTransactionIdSchema,
    updateGooglePurchaseTokenSchema,
    updateOrderStatusSchema,
} from './schema';

const router = express.Router();

router.get('/check-expired', async (req, res, next) => {
    try {
        await updateExpiredOrderStatus();

        const expiredOrders = await getExpiredOrders();

        if (expiredOrders.length === 0) {
            return res.status(StatusCodes.OK).send(
                formatResponse({
                    success: true,
                    code: StatusCodes.OK,
                    message: 'No expired orders found',
                    data: null,
                }),
            );
            return;
        }

        for (const order of expiredOrders) {
            await deleteFcmTokensByUserId(order.userId);
        }

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Expired order status updated',
                data: null,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:orderId', authenticateUser, async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getOrderById(orderId);

        if (!order) throw new NotFoundError('Order not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order fetched',
                data: order,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/inquiry/:orderId', authenticateUser, async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        // Check if the order is exist
        const isOrderExist = await getOrderById(orderId);
        if (!isOrderExist) throw new NotFoundError('Order not found');

        const order = await getInquiryOrder(orderId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/inquiry/:orderId/idol', authenticateUser, async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        // Check if the order is exist
        const isOrderExist = await getOrderById(orderId);
        if (!isOrderExist) throw new NotFoundError('Order not found');

        const order = await getInquiryOrderListIdol(orderId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/', validateSchema(createOrderSchema), authenticateUser, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { packageId, paymentMethod, subtotal, tax, total, idolIds } = req.body;

        // If user have a subscription, then the user can't buy a package
        const checkSubscription = await checkUserSubscription(userId);
        if (checkSubscription) throw new NotFoundError('User already have an active subscription');

        const createOrderItem = await createOrder(userId, packageId, paymentMethod, subtotal, tax, total, idolIds);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order created',
                data: createOrderItem,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.post('/createAppleResubscribe', async (req, res, next) => {
    try {
        const { appleOriginalTransactionId } = req.body;

        const order = await createOrderAppleResubscribe(appleOriginalTransactionId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order created',
                data: order,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.patch('/updateStatus', validateSchema(updateOrderStatusSchema), authenticateUser, async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await getOrderById(orderId);

        if (!order) throw new NotFoundError('Order not found');

        await updateOrderStatusGpay(orderId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order status updated',
                data: null,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.patch(
    '/updateAppleOriginalTransactionId',
    validateSchema(updateAppleOriginalTransactionIdSchema),
    authenticateUser,
    async (req, res, next) => {
        try {
            const { orderId, appleOriginalTransactionId } = req.body;

            const order = await getOrderById(orderId);

            if (!order) throw new NotFoundError('Order not found');

            await updateAppleOriginalTransactionId(orderId, appleOriginalTransactionId);

            return res.status(StatusCodes.OK).send(
                formatResponse({
                    success: true,
                    code: StatusCodes.OK,
                    message: 'Order status updated',
                    data: null,
                }),
            );
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    '/updateGooglePurchaseToken',
    validateSchema(updateGooglePurchaseTokenSchema),
    authenticateUser,
    async (req, res, next) => {
        try {
            const { orderId, googlePurchaseToken, googlePurchaseId } = req.body;

            const order = await getOrderById(orderId);

            if (!order) throw new NotFoundError('Order not found');

            await updateGooglePurchaseToken(orderId, googlePurchaseToken, googlePurchaseId);

            return res.status(StatusCodes.OK).send(
                formatResponse({
                    success: true,
                    code: StatusCodes.OK,
                    message: 'Order status updated',
                    data: null,
                }),
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
);

export default router;
