import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { createOrder, getInquiryOrder, getInquiryOrderListIdol } from './repository';
import { createOrderSchema } from './schema';

const router = express.Router();

router.get('/inquiry/:orderId', async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getInquiryOrder(orderId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/inquiry/:orderId/idol', async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getInquiryOrderListIdol(orderId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/', validate(createOrderSchema), authenticateUser, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { packageId, paymentMethod, subtotal, tax, total, idolIds } = req.body;

        console.log({ userId, packageId, paymentMethod, subtotal, tax, total, idolIds });

        // const checkPackageId = getPackage(packageId);
        // console.log(checkPackageId);

        const createOrderItem = await createOrder(userId, packageId, paymentMethod, subtotal, tax, total, idolIds);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order created',
                data: createOrderItem,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
