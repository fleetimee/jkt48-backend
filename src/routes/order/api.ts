import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { createOrder } from './repository';
import { createOrderSchema } from './schema';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.post('/', validate(createOrderSchema), authenticateUser, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { packageId, paymentMethod, subtotal, tax, total, idolIds } = req.body;

        console.log({ userId, packageId, paymentMethod, subtotal, tax, total, idolIds });

        // const checkPackageId = getPackage(packageId);
        // console.log(checkPackageId);

        // Call the repository function to create the order
        const createOrderItem = await createOrder(userId, packageId, paymentMethod, subtotal, tax, total, idolIds);

        res.status(StatusCodes.OK).send(
            formatResponse({ success: true, code: StatusCodes.OK, message: 'Order created', data: createOrderItem }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
