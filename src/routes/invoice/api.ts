import { differenceInDays } from 'date-fns';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getInquiryOrder, getOrderById } from '../order/repository';
import { createInvoice, expireInvoice, getInvoice, getInvoices } from './repository';
import { createInvoiceSchema } from './schema';

const router = express.Router();

router.get('/', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const invoices = await getInvoices();

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoices fetched',
                data: invoices,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:invoiceId', authenticateUser, async (req, res, next) => {
    try {
        const invoiceId = req.params.invoiceId;

        const invoice = await getInvoice(invoiceId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice fetched',
                data: invoice,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:invoiceId/forceExpire', authenticateUser, async (req, res, next) => {
    try {
        const invoiceId = req.params.invoiceId;

        const invoice = await expireInvoice(invoiceId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice expired',
                data: invoice,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/', validateSchema(createInvoiceSchema), authenticateUser, async (req, res, next) => {
    try {
        // Get user details from the request
        const { id, email, name } = req.user;

        // Get order details from the body of the request
        const { idOrder, currency } = req.body;

        // Check if idOrder is valid
        if (!validateUuid(idOrder)) throw new UnprocessableEntityError('The orderId is not a valid UUID');

        // Check if the order exists
        const order = await getOrderById(idOrder);
        if (!order) throw new UnprocessableEntityError('The order does not exist');

        if (order.orderStatus === 'success') {
            const currentDate = new Date();
            const expiredAt = order.expiredAt as Date;
            const daysUntilExpiration = differenceInDays(expiredAt, currentDate);

            if (daysUntilExpiration > 7) {
                throw new UnprocessableEntityError(
                    'The order has already been paid and is not within 7 days of expiration',
                );
            }
        }

        // Inquiry order to get package details
        const inquiryOrder = await getInquiryOrder(idOrder);

        // Build request body for creating invoice
        const invoice = await createInvoice({
            externalId: idOrder,
            payerEmail: email,
            amount: inquiryOrder.order_total as number,
            currency,
            description: 'Pembayaran JKT48 Private Message',
            customer: {
                id: id,
                email: email,
                customerId: `${id}-${Date.now()}`,
                givenNames: name,
            },
            items: [
                {
                    name: inquiryOrder.package_name as string,
                    price: inquiryOrder.order_subtotal as number,
                    quantity: 1,
                    category: inquiryOrder.category as string,
                },
                {
                    name: 'Tax',
                    price: inquiryOrder.order_tax as number,
                    quantity: 1,
                    category: 'tax',
                },
            ],
        });

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice created',
                data: invoice,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;
